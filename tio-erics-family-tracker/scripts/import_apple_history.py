#!/usr/bin/env python3
import argparse
import csv
import json
import re
import sqlite3
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

APPLE_EPOCH = 978307200


def normalize_handle(value):
    value = (value or "").strip().lower()
    if "@" in value:
        return value
    digits = re.sub(r"\D", "", value)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits


def apple_time_to_iso(value):
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
        return datetime.fromtimestamp(seconds, tz=timezone.utc).date().isoformat()
    except (OverflowError, OSError):
        return None


def read_family(path):
    people = {}
    handle_to_name = {}
    with path.open(newline="", encoding="utf-8") as file:
        for row in csv.DictReader(file):
            name = (row.get("name") or "").strip()
            if not name:
                continue
            people[name] = {
                "name": name,
                "relationship": (row.get("relationship") or "family").strip(),
                "messages": 0,
                "calls": 0,
                "facetime": 0,
                "lastInteraction": None,
            }
            for raw_handle in (row.get("handles") or "").split(";"):
                handle = normalize_handle(raw_handle)
                if handle:
                    handle_to_name[handle] = name
    return people, handle_to_name


def mark_touch(person, field, touched_on):
    person[field] += 1
    if touched_on and (not person["lastInteraction"] or touched_on > person["lastInteraction"]):
        person["lastInteraction"] = touched_on


def import_messages(db_path, people, handle_to_name):
    if not db_path or not db_path.exists():
        return
    try:
        conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    except sqlite3.Error as error:
        print(f"Skipped Messages database: {error}")
        return
    conn.row_factory = sqlite3.Row
    query = """
        SELECT handle.id AS handle, message.date AS message_date
        FROM message
        JOIN handle ON handle.ROWID = message.handle_id
        WHERE message.handle_id IS NOT NULL
    """
    try:
        for row in conn.execute(query):
            name = handle_to_name.get(normalize_handle(row["handle"]))
            if name:
                mark_touch(people[name], "messages", apple_time_to_iso(row["message_date"]))
    except sqlite3.Error as error:
        print(f"Skipped Messages rows: {error}")
    conn.close()


def table_columns(conn, table):
    return {row[1].upper(): row[1] for row in conn.execute(f"PRAGMA table_info({table})")}


def import_calls(db_path, people, handle_to_name):
    if not db_path or not db_path.exists():
        return
    try:
        conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    except sqlite3.Error as error:
        print(f"Skipped call history database: {error}")
        return
    conn.row_factory = sqlite3.Row
    try:
        tables = {row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    except sqlite3.Error as error:
        print(f"Skipped call history rows: {error}")
        conn.close()
        return
    if "ZCALLRECORD" not in tables:
        conn.close()
        return

    columns = table_columns(conn, "ZCALLRECORD")
    address_col = columns.get("ZADDRESS") or columns.get("ZREMOTEID") or columns.get("ZCALLERID")
    date_col = columns.get("ZDATE") or columns.get("ZSTARTDATE")
    service_col = columns.get("ZSERVICE_PROVIDER") or columns.get("ZSERVICE") or columns.get("ZCALLTYPE")
    if not address_col:
        conn.close()
        return

    selected = [address_col]
    if date_col:
        selected.append(date_col)
    if service_col:
        selected.append(service_col)
    query = f"SELECT {', '.join(selected)} FROM ZCALLRECORD"

    for row in conn.execute(query):
        name = handle_to_name.get(normalize_handle(row[address_col]))
        if not name:
            continue
        service = str(row[service_col]).lower() if service_col else ""
        field = "facetime" if "facetime" in service or service in {"8", "16"} else "calls"
        touched_on = apple_time_to_iso(row[date_col]) if date_col else None
        mark_touch(people[name], field, touched_on)
    conn.close()


def main():
    parser = argparse.ArgumentParser(description="Create the Family Ledger leaderboard JSON from local Apple history databases.")
    parser.add_argument("--family", default="data/family_members.csv", type=Path)
    parser.add_argument("--messages-db", default=Path.home() / "Library/Messages/chat.db", type=Path)
    parser.add_argument("--calls-db", default=Path.home() / "Library/Application Support/CallHistoryDB/CallHistory.storedata", type=Path)
    parser.add_argument("--out", default="data/leaderboard.json", type=Path)
    args = parser.parse_args()

    people, handle_to_name = read_family(args.family)
    import_messages(args.messages_db, people, handle_to_name)
    import_calls(args.calls_db, people, handle_to_name)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps({"people": list(people.values())}, indent=2), encoding="utf-8")
    print(f"Wrote {args.out} with {len(people)} family members.")


if __name__ == "__main__":
    main()
