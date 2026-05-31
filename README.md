# Eric Family Tracker

An MVP private family relationship tracker with a humorous leaderboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres/Auth
- Supabase Row Level Security
- Vercel

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add Supabase values to `.env.local`.

For randomized welcome/approval emails, add:

```text
RESEND_API_KEY
EMAIL_FROM
```

For family signup without Supabase's built-in confirmation email/rate limit, also add:

```text
SUPABASE_SERVICE_ROLE_KEY
```

That key must stay server-side only. It lets the app create pending family accounts as already email-confirmed, while admin approval still controls who can use the tracker.

## Supabase

Run the migrations in:

```text
supabase/migrations
```

Then create Eric's user in Supabase Auth and mark him admin:

```sql
update public.profiles
set role = 'admin'
where id = '<ERIC_AUTH_USER_ID>';
```

## Main Routes

- `/dashboard`
- `/leaderboard`
- `/people`
- `/people/[id]`
- `/interactions/new`
- `/submissions`
- `/admin/weights`
- `/admin/approvals`
- `/admin/settings`
- `/export/leaderboard.csv`

## Documentation

Read the human-facing project explainer:

[docs/HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md)

Architecture map and change log:

[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

[docs/CHANGELOG.md](docs/CHANGELOG.md)

Email copy for Supabase/Auth templates lives here:

[docs/EMAIL_TEMPLATES.md](docs/EMAIL_TEMPLATES.md)

## Apple Call/Text Sync

The local importer matches approved and pending family profiles by phone/email, optionally checks your Mac Contacts for extra handles, imports call/text metadata only, and recalculates scores. By default, approved people get approved imports and pending people get pending imports.

The signup date is not the scoring start date. Signup only tells the tracker which phone/email belongs to that person. Every Apple sync re-scans from the requested historical start date, so a new roster member can be matched against older calls/texts already on Eric's Mac. The current nightly setup uses `--since 2026-01-01`, which means a person who signs up later can still get their 2026 history populated once their phone/email is on the roster.

```bash
python3 scripts/sync_apple_history_to_supabase.py --since 2026-01-01 --dry-run --diagnose
python3 scripts/sync_apple_history_to_supabase.py --since 2026-01-01
```

You need either `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ADMIN_EMAIL` plus `SUPABASE_ADMIN_PASSWORD` in `.env.local` on your Mac for this script. Keep those private.

To run it automatically every night at 8 PM on your Mac:

```bash
scripts/install_apple_sync_launch_agent.sh
```

If someone signs up and their old data looks missing, check that their roster phone number is the same number that appears in Messages/Call History, then run:

```bash
python3 scripts/sync_apple_history_to_supabase.py --since 2026-01-01 --status approved --skip-contacts
```

That forces a full 2026 metadata backfill for every known roster phone/email without importing message contents.
