#!/usr/bin/env python3
"""
Sync local Apple Messages/CallHistory metadata into Eric Family Tracker.

This runs only on Eric's Mac. It does not upload message text.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sqlite3
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


APPLE_EPOCH = 978307200
DEFAULT_MESSAGE_GAP_MINUTES = 60
DAILY_SCORE_CAP = 600


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key.strip(), value)


def normalize_phone(value: str | None) -> str:
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits


def normalize_email(value: str | None) -> str:
    value = (value or "").strip().lower()
    return value if "@" in value else ""


def normalize_handle(value: str | None) -> str:
    email = normalize_email(value)
    return email or normalize_phone(value)


def apple_time_to_datetime(value: Any) -> datetime | None:
    if value is None:
        return None
    try:
        numeric = int(value)
    except (TypeError, ValueError):
        return None

    if numeric > 10_000_000_000_000:
        seconds = numeric / 1_000_000_000 + APPLE_EPOCH
    elif numeric > 10_000_000_000:
        seconds = numeric / 1_000_000 + APPLE_EPOCH
    else:
        seconds = numeric + APPLE_EPOCH

    try:
        return datetime.fromtimestamp(seconds, tz=timezone.utc)
    except (OverflowError, OSError):
        return None


def iso(dt: datetime | None) -> str | None:
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z") if dt else None


@dataclass
class Person:
    id: str
    name: str
    phone: str
    email: str
    active: bool


@dataclass
class ImportedInteraction:
    person_id: str
    type: str
    direction: str
    initiated_by_person: bool
    started_at: datetime
    ended_at: datetime | None
    duration_minutes: float
    message_count: int
    is_group_chat: bool
    source: str
    status: str
    notes: str

    @property
    def import_key(self) -> str:
        material = "|".join(
            [
                self.person_id,
                self.type,
                self.direction,
                iso(self.started_at) or "",
                str(round(self.duration_minutes, 2)),
                str(self.message_count),
                str(self.is_group_chat),
            ]
        )
        return hashlib.sha256(material.encode("utf-8")).hexdigest()[:24]

    def to_row(self) -> dict[str, Any]:
        key = self.import_key
        note = f"[apple-import:{key}] {self.notes}".strip()
        return {
            "person_id": self.person_id,
            "type": self.type,
            "direction": self.direction,
            "initiated_by_person": self.initiated_by_person,
            "started_at": iso(self.started_at),
            "ended_at": iso(self.ended_at),
            "duration_minutes": round(self.duration_minutes, 2),
            "message_count": self.message_count,
            "is_group_chat": self.is_group_chat,
            "source": self.source,
            "status": self.status,
            "notes": note,
        }


class SupabaseRest:
    def __init__(self, url: str, api_key: str, bearer_token: str | None = None) -> None:
        self.url = url.rstrip("/")
        self.key = api_key
        self.bearer_token = bearer_token or api_key

    def request(
        self,
        method: str,
        path: str,
        *,
        query: dict[str, str] | None = None,
        body: Any | None = None,
        extra_headers: dict[str, str] | None = None,
    ) -> Any:
        query_string = urllib.parse.urlencode(query or {}, safe="*,.:()")
        endpoint = f"{self.url}/rest/v1/{path}"
        if query_string:
            endpoint = f"{endpoint}?{query_string}"

        payload = None if body is None else json.dumps(body).encode("utf-8")
        request = urllib.request.Request(endpoint, data=payload, method=method)
        request.add_header("apikey", self.key)
        request.add_header("Authorization", f"Bearer {self.bearer_token}")
        request.add_header("Content-Type", "application/json")
        request.add_header("Accept", "application/json")
        for key, value in (extra_headers or {}).items():
            request.add_header(key, value)

        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                text = response.read().decode("utf-8")
        except urllib.error.HTTPError as error:
            details = error.read().decode("utf-8")
            raise RuntimeError(f"Supabase {method} {path} failed: {error.code} {details}") from error
        except urllib.error.URLError as error:
            raise RuntimeError(f"Could not reach Supabase. Check your internet connection and Supabase URL: {error}") from error
        return json.loads(text) if text else None

    def select(self, table: str, *, query: dict[str, str] | None = None) -> list[dict[str, Any]]:
        return self.request("GET", table, query=query) or []

    def insert(self, table: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not rows:
            return []
        return self.request(
            "POST",
            table,
            body=rows,
            extra_headers={"Prefer": "return=representation"},
        ) or []

    def upsert(self, table: str, rows: list[dict[str, Any]], on_conflict: str) -> None:
        if not rows:
            return
        self.request(
            "POST",
            table,
            query={"on_conflict": on_conflict},
            body=rows,
            extra_headers={"Prefer": "resolution=merge-duplicates"},
        )


def fetch_people(client: SupabaseRest, *, active_only: bool = False) -> tuple[list[Person], dict[str, Person]]:
    query = {"select": "id,name,phone,email,active"}
    if active_only:
        query["active"] = "eq.true"
    rows = client.select("people", query=query)
    people = [
        Person(
            id=row["id"],
            name=row["name"],
            phone=normalize_phone(row.get("phone")),
            email=normalize_email(row.get("email")),
            active=bool(row.get("active")),
        )
        for row in rows
    ]

    by_handle: dict[str, Person] = {}
    for person in people:
        if person.phone:
            by_handle[person.phone] = person
        if person.email:
            by_handle[person.email] = person
    return people, by_handle


def fetch_contact_handles_from_applescript() -> dict[str, set[str]]:
    script = """
    set output to ""
    tell application "Contacts"
      repeat with p in people
        set personName to name of p
        set handles to ""
        repeat with ph in phones of p
          set handles to handles & value of ph & ";"
        end repeat
        repeat with em in emails of p
          set handles to handles & value of em & ";"
        end repeat
        if handles is not "" then set output to output & personName & "|" & handles & linefeed
      end repeat
    end tell
    return output
    """
    try:
        result = subprocess.run(
            ["osascript", "-e", script],
            check=True,
            capture_output=True,
            text=True,
            timeout=120,
        )
    except (subprocess.SubprocessError, FileNotFoundError) as error:
        print(f"Skipped Contacts app lookup: {error}")
        return {}

    contacts: dict[str, set[str]] = {}
    for line in result.stdout.splitlines():
        if "|" not in line:
            continue
        name, handles = line.split("|", 1)
        normalized = {normalize_handle(handle) for handle in handles.split(";")}
        contacts[name.strip().lower()] = {handle for handle in normalized if handle}
    return contacts


def enrich_handles_from_contacts(people: list[Person], by_handle: dict[str, Person]) -> int:
    contacts = fetch_contact_handles_from_applescript()
    added = 0
    for person in people:
        contact_handles = contacts.get(person.name.strip().lower(), set())
        for handle in contact_handles:
            if handle and handle not in by_handle:
                by_handle[handle] = person
                added += 1
    return added


def connect_readonly(path: Path) -> sqlite3.Connection | None:
    if not path.exists():
        print(f"Skipped missing database: {path}")
        return None
    try:
        conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    except sqlite3.Error as error:
        print(f"Skipped {path}: {error}")
        return None
    conn.row_factory = sqlite3.Row
    return conn


def import_text_exchanges(
    db_path: Path,
    by_handle: dict[str, Person],
    *,
    status: str,
    since: datetime | None,
    gap_minutes: int,
) -> list[ImportedInteraction]:
    conn = connect_readonly(db_path)
    if not conn:
        return []

    query = """
        select
          handle.id as handle,
          message.date as message_date,
          coalesce(message.is_from_me, 0) as is_from_me,
          chat.ROWID as chat_id,
          chat.chat_identifier as chat_identifier,
          chat.display_name as display_name
        from message
        join handle on handle.ROWID = message.handle_id
        left join chat_message_join cmj on cmj.message_id = message.ROWID
        left join chat on chat.ROWID = cmj.chat_id
        where message.handle_id is not null
        order by message.date asc
    """

    grouped: dict[str, list[tuple[datetime, bool]]] = defaultdict(list)
    try:
        rows = conn.execute(query)
        for row in rows:
            chat_identifier = str(row["chat_identifier"] or "")
            is_group = bool(row["display_name"]) or chat_identifier.startswith("chat")
            if is_group:
                continue

            person = by_handle.get(normalize_handle(row["handle"]))
            touched_at = apple_time_to_datetime(row["message_date"])
            if not person or not touched_at or (since and touched_at < since):
                continue
            grouped[person.id].append((touched_at, bool(row["is_from_me"])))
    except sqlite3.Error as error:
        print(f"Skipped Messages rows: {error}")
    finally:
        conn.close()

    imported: list[ImportedInteraction] = []
    gap = timedelta(minutes=gap_minutes)
    for person_id, messages in grouped.items():
        session: list[tuple[datetime, bool]] = []
        for item in messages:
            if session and item[0] - session[-1][0] > gap:
                imported.append(build_text_exchange(person_id, session, status))
                session = []
            session.append(item)
        if session:
            imported.append(build_text_exchange(person_id, session, status))
    return imported


def diagnose_messages(db_path: Path, by_handle: dict[str, Person], limit: int) -> dict[str, Any]:
    conn = connect_readonly(db_path)
    if not conn:
        return {"available": False, "total": 0, "matched": 0, "unmatched": []}

    query = """
        select handle.id as handle, count(*) as message_count
        from message
        join handle on handle.ROWID = message.handle_id
        where message.handle_id is not null
        group by handle.id
        order by message_count desc
        limit 200
    """
    total = 0
    matched = 0
    unmatched: Counter[str] = Counter()
    try:
        for row in conn.execute(query):
            count = int(row["message_count"] or 0)
            total += count
            handle = normalize_handle(row["handle"])
            if handle in by_handle:
                matched += count
            else:
                unmatched[mask_handle(handle)] += count
    except sqlite3.Error as error:
        print(f"Skipped Messages diagnosis: {error}")
    finally:
        conn.close()
    return {
        "available": True,
        "total": total,
        "matched": matched,
        "unmatched": unmatched.most_common(limit),
    }


def build_text_exchange(person_id: str, messages: list[tuple[datetime, bool]], status: str) -> ImportedInteraction:
    started_at = messages[0][0]
    ended_at = messages[-1][0]
    message_count = len(messages)
    first_from_me = messages[0][1]
    duration = max(1.0, (ended_at - started_at).total_seconds() / 60)
    return ImportedInteraction(
        person_id=person_id,
        type="text_exchange",
        direction="outbound" if first_from_me else "inbound",
        initiated_by_person=not first_from_me,
        started_at=started_at,
        ended_at=ended_at,
        duration_minutes=duration,
        message_count=message_count,
        is_group_chat=False,
        source="import",
        status=status,
        notes=f"Imported text exchange metadata only ({message_count} messages, no content).",
    )


def table_columns(conn: sqlite3.Connection, table: str) -> dict[str, str]:
    return {row[1].upper(): row[1] for row in conn.execute(f"PRAGMA table_info({table})")}


def row_value(row: sqlite3.Row, columns: dict[str, str], *names: str) -> Any:
    for name in names:
        column = columns.get(name.upper())
        if column and column in row.keys():
            return row[column]
    return None


def import_calls(
    db_path: Path,
    by_handle: dict[str, Person],
    *,
    status: str,
    since: datetime | None,
) -> list[ImportedInteraction]:
    conn = connect_readonly(db_path)
    if not conn:
        return []

    try:
        tables = {row[0] for row in conn.execute("select name from sqlite_master where type='table'")}
    except sqlite3.Error as error:
        print(f"Skipped call history rows: {error}")
        conn.close()
        return []
    if "ZCALLRECORD" not in tables:
        conn.close()
        return []

    columns = table_columns(conn, "ZCALLRECORD")
    selected = ", ".join(columns.values())
    imported: list[ImportedInteraction] = []

    try:
        for row in conn.execute(f"select {selected} from ZCALLRECORD"):
            handle = normalize_handle(row_value(row, columns, "ZADDRESS", "ZREMOTEID", "ZCALLERID", "ZISO_COUNTRY_CODE"))
            person = by_handle.get(handle)
            if not person:
                continue

            started_at = apple_time_to_datetime(row_value(row, columns, "ZDATE", "ZSTARTDATE"))
            if not started_at or (since and started_at < since):
                continue

            duration_seconds = float(row_value(row, columns, "ZDURATION", "ZCALLDURATION") or 0)
            duration_minutes = max(1.0, duration_seconds / 60) if duration_seconds else 1.0
            ended_at = started_at + timedelta(minutes=duration_minutes)
            originated = row_value(row, columns, "ZORIGINATED", "ZOUTGOING")
            is_outbound = str(originated) in {"1", "true", "True"}
            service = str(row_value(row, columns, "ZSERVICE_PROVIDER", "ZSERVICE", "ZCALLTYPE") or "").lower()
            call_label = "FaceTime" if "facetime" in service or service in {"8", "16"} else "call"

            imported.append(
                ImportedInteraction(
                    person_id=person.id,
                    type="call",
                    direction="outbound" if is_outbound else "inbound",
                    initiated_by_person=not is_outbound,
                    started_at=started_at,
                    ended_at=ended_at,
                    duration_minutes=duration_minutes,
                    message_count=0,
                    is_group_chat=False,
                    source="import",
                    status=status,
                    notes=f"Imported {call_label} metadata from Apple Call History.",
                )
            )
    except sqlite3.Error as error:
        print(f"Skipped call history rows: {error}")
    finally:
        conn.close()

    return imported


def diagnose_calls(db_path: Path, by_handle: dict[str, Person], limit: int) -> dict[str, Any]:
    conn = connect_readonly(db_path)
    if not conn:
        return {"available": False, "total": 0, "matched": 0, "unmatched": []}

    try:
        tables = {row[0] for row in conn.execute("select name from sqlite_master where type='table'")}
    except sqlite3.Error as error:
        print(f"Skipped call history diagnosis: {error}")
        conn.close()
        return {"available": False, "total": 0, "matched": 0, "unmatched": []}
    if "ZCALLRECORD" not in tables:
        conn.close()
        return {"available": False, "total": 0, "matched": 0, "unmatched": []}

    columns = table_columns(conn, "ZCALLRECORD")
    selected = ", ".join(columns.values())
    total = 0
    matched = 0
    unmatched: Counter[str] = Counter()
    try:
        for row in conn.execute(f"select {selected} from ZCALLRECORD"):
            total += 1
            handle = normalize_handle(row_value(row, columns, "ZADDRESS", "ZREMOTEID", "ZCALLERID"))
            if handle in by_handle:
                matched += 1
            elif handle:
                unmatched[mask_handle(handle)] += 1
    except sqlite3.Error as error:
        print(f"Skipped call history diagnosis: {error}")
    finally:
        conn.close()
    return {
        "available": True,
        "total": total,
        "matched": matched,
        "unmatched": unmatched.most_common(limit),
    }


def mask_handle(handle: str) -> str:
    if "@" in handle:
        name, domain = handle.split("@", 1)
        return f"{name[:2]}***@{domain}"
    if len(handle) >= 4:
        return f"***{handle[-4:]}"
    return "***"


def existing_import_keys(client: SupabaseRest) -> set[str]:
    rows = client.select(
        "interactions",
        query={
            "select": "notes",
            "source": "eq.import",
            "notes": "like.*[apple-import:%",
        },
    )
    keys = set()
    for row in rows:
        match = re.search(r"\[apple-import:([a-f0-9]{24})\]", row.get("notes") or "")
        if match:
            keys.add(match.group(1))
    return keys


def score_weight_key(interaction: dict[str, Any]) -> str:
    if interaction["type"] == "call":
        return "call:inbound" if interaction["direction"] == "inbound" else "call:outbound"
    if interaction["type"] == "text_exchange":
        return "text_exchange:person_initiated" if interaction["initiated_by_person"] else "text_exchange:reply"
    return interaction["type"]


def score_interaction(interaction: dict[str, Any], weights: dict[str, dict[str, Any]]) -> dict[str, float]:
    if interaction.get("is_group_chat") or interaction.get("status") != "approved":
        return defaultdict(float)
    weight = weights.get(score_weight_key(interaction))
    if not weight or not weight.get("active"):
        return defaultdict(float)

    raw = (
        float(weight.get("base_points") or 0)
        + float(weight.get("points_per_minute") or 0) * float(interaction.get("duration_minutes") or 0)
        + float(weight.get("points_per_message") or 0) * float(interaction.get("message_count") or 0)
        + (float(weight.get("initiative_bonus") or 0) if interaction.get("initiated_by_person") else 0)
        + (float(weight.get("returned_call_bonus") or 0) if interaction.get("type") == "missed_call_returned" else 0)
    )
    cap = weight.get("cap_per_event")
    total = raw if cap is None else min(raw, float(cap))
    if interaction.get("type") == "admin_penalty":
        total = -abs(total)

    scored = defaultdict(float)
    scored["total_score"] = total
    if interaction["type"] in {"call", "missed_call_returned"}:
        scored["call_score"] = total
    if interaction["type"] == "text_exchange":
        scored["text_score"] = total
    if interaction.get("initiated_by_person"):
        scored["initiative_score"] = float(weight.get("initiative_bonus") or 0)
    if interaction["type"] in {"fortnite", "visit", "manual_activity"}:
        scored["time_together_score"] = total
    if interaction["type"] == "missed_call_returned":
        scored["reliability_score"] = total
    if interaction["type"] in {"birthday_remembered", "life_event", "admin_bonus"}:
        scored["bonus_score"] = max(total, 0)
    if interaction["type"] == "admin_penalty":
        scored["penalty_score"] = total
    return scored


def recalculate_scores(client: SupabaseRest) -> None:
    weights = {
        row["interaction_type"]: row
        for row in client.select(
            "scoring_weights",
            query={"select": "interaction_type,base_points,points_per_minute,points_per_message,cap_per_event,initiative_bonus,returned_call_bonus,active"},
        )
    }
    interactions = client.select(
        "interactions",
        query={
            "select": "person_id,type,direction,initiated_by_person,started_at,duration_minutes,message_count,is_group_chat,status",
            "status": "eq.approved",
        },
    )
    now = datetime.now(timezone.utc)
    period_starts = {
        "week": now - timedelta(days=7),
        "month": now - timedelta(days=30),
        "year": now - timedelta(days=365),
        "all_time": None,
    }

    score_rows: list[dict[str, Any]] = []
    for period, starts_at in period_starts.items():
        by_day: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
        for interaction in interactions:
            started_at = datetime.fromisoformat(interaction["started_at"].replace("Z", "+00:00"))
            if starts_at and started_at < starts_at:
                continue
            by_day[(interaction["person_id"], started_at.date().isoformat())].append(interaction)

        by_person: dict[str, defaultdict[str, float]] = {}
        for (person_id, _day), day_interactions in by_day.items():
            day_total = 0.0
            for interaction in day_interactions:
                scored = score_interaction(interaction, weights)
                remaining = max(0.0, DAILY_SCORE_CAP - day_total)
                allowed_total = min(scored["total_score"], remaining)
                day_total += allowed_total
                ratio = 0.0 if scored["total_score"] == 0 else allowed_total / scored["total_score"]
                person_score = by_person.setdefault(person_id, defaultdict(float))
                for key, value in scored.items():
                    person_score[key] += value * ratio

        for person_id, values in by_person.items():
            score_rows.append(
                {
                    "person_id": person_id,
                    "period": period,
                    "total_score": round(values["total_score"], 1),
                    "call_score": round(values["call_score"], 1),
                    "text_score": round(values["text_score"], 1),
                    "initiative_score": round(values["initiative_score"], 1),
                    "time_together_score": round(values["time_together_score"], 1),
                    "reliability_score": round(values["reliability_score"], 1),
                    "bonus_score": round(values["bonus_score"], 1),
                    "penalty_score": round(values["penalty_score"], 1),
                    "calculated_at": iso(now),
                }
            )

    client.upsert("scores", score_rows, "person_id,period")


def parse_since(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).replace(tzinfo=timezone.utc)
    except ValueError as error:
        raise argparse.ArgumentTypeError("Use --since YYYY-MM-DD") from error


def sign_in_for_access_token(url: str, anon_key: str, email: str, password: str) -> str:
    endpoint = f"{url.rstrip()}/auth/v1/token?grant_type=password"
    payload = json.dumps({"email": email, "password": password}).encode("utf-8")
    request = urllib.request.Request(endpoint, data=payload, method="POST")
    request.add_header("apikey", anon_key)
    request.add_header("Content-Type", "application/json")
    request.add_header("Accept", "application/json")
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8")
        raise RuntimeError(f"Admin sign-in failed: {error.code} {details}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"Could not reach Supabase Auth. Check your internet connection and Supabase URL: {error}") from error
    return data["access_token"]


def main() -> int:
    parser = argparse.ArgumentParser(description="Import Apple call/text metadata into Eric Family Tracker.")
    parser.add_argument("--env", default=".env.local", type=Path, help="Env file with Supabase URL and private import credentials.")
    parser.add_argument("--messages-db", default=Path.home() / "Library/Messages/chat.db", type=Path)
    parser.add_argument("--calls-db", default=Path.home() / "Library/Application Support/CallHistoryDB/CallHistory.storedata", type=Path)
    parser.add_argument("--since", default=None, help="Only import activity on or after YYYY-MM-DD.")
    parser.add_argument("--status", choices=["approved", "pending"], default="approved")
    parser.add_argument("--skip-contacts", action="store_true", help="Do not ask macOS Contacts for extra phone/email matches.")
    parser.add_argument("--active-only", action="store_true", help="Only match approved/active people. By default pending roster members are included too.")
    parser.add_argument("--message-gap-minutes", default=DEFAULT_MESSAGE_GAP_MINUTES, type=int)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--diagnose", action="store_true", help="Print roster and Apple database match diagnostics.")
    args = parser.parse_args()

    load_env(args.env)
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    anon_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    admin_email = os.environ.get("SUPABASE_ADMIN_EMAIL")
    admin_password = os.environ.get("SUPABASE_ADMIN_PASSWORD")
    if not supabase_url:
        print("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local.", file=sys.stderr)
        return 2
    if service_key:
        client = SupabaseRest(supabase_url, service_key)
    elif anon_key and admin_email and admin_password:
        access_token = sign_in_for_access_token(supabase_url, anon_key, admin_email, admin_password)
        client = SupabaseRest(supabase_url, anon_key, access_token)
    else:
        print("Missing credentials in .env.local.", file=sys.stderr)
        print("Use either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ADMIN_EMAIL + SUPABASE_ADMIN_PASSWORD.", file=sys.stderr)
        return 2

    people, by_handle = fetch_people(client, active_only=args.active_only)
    active_count = sum(1 for person in people if person.active)
    pending_count = len(people) - active_count
    print(f"Loaded {len(people)} people for matching ({active_count} active, {pending_count} pending).")
    if not args.skip_contacts:
        added = enrich_handles_from_contacts(people, by_handle)
        print(f"Matched {added} extra handles from macOS Contacts.")

    if args.diagnose:
        print(f"Active people in app: {len(people)}")
        print(f"Phone/email handles available for matching: {len(by_handle)}")
        print("Messages diagnosis:")
        print(json.dumps(diagnose_messages(args.messages_db, by_handle, 12), indent=2))
        print("Calls diagnosis:")
        print(json.dumps(diagnose_calls(args.calls_db, by_handle, 12), indent=2))

    since = parse_since(args.since)
    imported = []
    imported.extend(
        import_text_exchanges(
            args.messages_db,
            by_handle,
            status=args.status,
            since=since,
            gap_minutes=args.message_gap_minutes,
        )
    )
    imported.extend(import_calls(args.calls_db, by_handle, status=args.status, since=since))

    seen_keys = existing_import_keys(client)
    new_rows = [item.to_row() for item in imported if item.import_key not in seen_keys]

    print(f"Found {len(imported)} matching Apple interactions.")
    print(f"{len(new_rows)} are new after duplicate protection.")
    if args.dry_run:
        preview = new_rows[:5]
        print(json.dumps(preview, indent=2))
        print("Dry run only. Nothing was uploaded.")
        return 0

    client.insert("interactions", new_rows)
    if args.status == "approved":
        recalculate_scores(client)
        print("Uploaded interactions and recalculated the leaderboard.")
    else:
        print("Uploaded pending interactions. Approve them in the app to count them.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as error:
        print(error, file=sys.stderr)
        raise SystemExit(1)
