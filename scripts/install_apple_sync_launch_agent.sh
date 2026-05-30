#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$PLIST_DIR/com.eric.family-tracker.apple-sync.plist"
PYTHON_BIN="$(command -v python3)"

mkdir -p "$PLIST_DIR" "$ROOT_DIR/outputs"

cat > "$PLIST_PATH" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.eric.family-tracker.apple-sync</string>
  <key>ProgramArguments</key>
  <array>
    <string>$PYTHON_BIN</string>
    <string>$ROOT_DIR/scripts/sync_apple_history_to_supabase.py</string>
    <string>--since</string>
    <string>2026-01-01</string>
    <string>--status</string>
    <string>approved</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$ROOT_DIR</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>20</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>$ROOT_DIR/outputs/apple-sync.log</string>
  <key>StandardErrorPath</key>
  <string>$ROOT_DIR/outputs/apple-sync.err.log</string>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
PLIST

launchctl unload "$PLIST_PATH" >/dev/null 2>&1 || true
launchctl load "$PLIST_PATH"

echo "Installed nightly Apple sync: $PLIST_PATH"
echo "Logs: $ROOT_DIR/outputs/apple-sync.log and $ROOT_DIR/outputs/apple-sync.err.log"
