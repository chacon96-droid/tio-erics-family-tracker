#!/usr/bin/env python3
import csv
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.environ.get("FAMILY_TRACKER_DATA_DIR", ROOT / "data"))
INPUT = DATA_DIR / "checkins.jsonl"
OUTPUT = ROOT / "outputs" / "family_checkins.csv"
FIELDS = ["createdAt", "name", "relationship", "phone", "email", "birthday", "source"]


def load_rows():
    if not INPUT.exists():
        return []
    rows = []
    with INPUT.open(encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def main():
    rows = load_rows()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in FIELDS})
    print(f"Wrote {OUTPUT} with {len(rows)} check-ins.")


if __name__ == "__main__":
    main()
