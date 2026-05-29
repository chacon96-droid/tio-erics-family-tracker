#!/usr/bin/env python3
import hashlib
import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
DATA_DIR = Path(os.environ.get("FAMILY_TRACKER_DATA_DIR", ROOT / "data"))
CHECKINS_PATH = DATA_DIR / "checkins.jsonl"


class FamilyLedgerHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            body = b'{"ok":true}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if self.path != "/api/checkins":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            data = json.loads(self.rfile.read(length))
        except (ValueError, json.JSONDecodeError):
            self.send_error(400)
            return

        allowed = {"name", "relationship", "phone", "email", "birthday", "pin", "consent", "createdAt"}
        record = {key: str(data.get(key, "")).strip() for key in allowed}
        if not record["name"] or not record["relationship"] or not record["phone"] or not record["pin"]:
            self.send_error(422)
            return

        record["pinHash"] = hashlib.sha256(record.pop("pin").encode("utf-8")).hexdigest()
        record["source"] = self.client_address[0]

        CHECKINS_PATH.parent.mkdir(parents=True, exist_ok=True)
        with CHECKINS_PATH.open("a", encoding="utf-8") as file:
            file.write(json.dumps(record, sort_keys=True) + "\n")

        body = b'{"ok":true}'
        self.send_response(201)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    port = int(os.environ.get("PORT", "4173"))
    server = ThreadingHTTPServer(("0.0.0.0", port), FamilyLedgerHandler)
    print(f"Serving Tio Eric's Family Tracker on http://0.0.0.0:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
