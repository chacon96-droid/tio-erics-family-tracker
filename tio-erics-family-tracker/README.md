# Tio Eric's Family Tracker

A private phone-friendly family tracker, based on how often you interact with younger family members.

## How it works

1. Add siblings, nieces, and nephews to `data/family_members.csv`.
2. Run the local importer to create `data/leaderboard.json`.
3. Open the app in a browser and add it to your phone home screen.

The app does not need message contents. The importer only counts matching message, call, and FaceTime metadata for the handles you put in the CSV.

## Import

```bash
python3 scripts/import_apple_history.py
```

If macOS blocks direct access to Messages or call history, copy the databases somewhere inside this folder first, then run:

```bash
python3 scripts/import_apple_history.py \
  --messages-db ./chat.db \
  --calls-db ./CallHistory.storedata
```

Common source locations:

- `~/Library/Messages/chat.db`
- `~/Library/Application Support/CallHistoryDB/CallHistory.storedata`

## Open Locally

```bash
python3 server.py
```

Then open `http://localhost:4173`.

Family check-in page:

```text
http://localhost:4173/checkin.html
```

Submissions are saved locally to `data/checkins.jsonl`. PINs are stored as hashes, not plain text.

Export check-ins to a spreadsheet-ready CSV:

```bash
python3 scripts/export_checkins_csv.py
```

The export is written to `outputs/family_checkins.csv`.

## Add To iPhone

1. Keep the local server running on your Mac.
2. Make sure your iPhone is on the same Wi-Fi.
3. On your iPhone, open `http://10.0.0.148:4173` in Safari.
4. Tap Share, then Add to Home Screen.

For the family check-in page, send them:

```text
http://10.0.0.148:4173/checkin.html
```

## Launch Publicly

To make the form work from anywhere, deploy this folder as a Python web service.

Recommended Render settings:

- Service type: Web Service
- Runtime: Python
- Build command: `true`
- Start command: `python3 server.py`
- Health check path: `/health`
- Persistent disk mount path: `/opt/render/project/src/storage`
- Environment variable: `FAMILY_TRACKER_DATA_DIR=/opt/render/project/src/storage`

After deploy, send family the hosted check-in URL:

```text
https://YOUR-SERVICE.onrender.com/checkin.html
```

If your Mac's Wi-Fi address changes, run this on the Mac to get the new phone URL:

```bash
ifconfig | awk '/inet / && $2 !~ /^127\./ {print "http://" $2 ":4173"; exit}'
```

## Refresh Data

After editing `data/family_members.csv`, refresh the leaderboard with:

```bash
scripts/refresh_leaderboard.sh
```

For fully automatic imports, the app that runs this script needs macOS privacy access to Messages and call history. If macOS blocks it, copy these two databases into this folder and rerun the refresh:

- `~/Library/Messages/chat.db`
- `~/Library/Application Support/CallHistoryDB/CallHistory.storedata`

## Scoring

- Message: 1 point
- Phone call: 4 points
- FaceTime: 5 points

Each person's inheritance percentage is their score divided by the family total for the selected time period.
