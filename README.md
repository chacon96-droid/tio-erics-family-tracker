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

Email copy for Supabase/Auth templates lives here:

[docs/EMAIL_TEMPLATES.md](docs/EMAIL_TEMPLATES.md)

## Apple Call/Text Sync

The local importer matches approved family profiles by phone/email, optionally checks your Mac Contacts for extra handles, imports call/text metadata only, and recalculates scores.

```bash
python3 scripts/sync_apple_history_to_supabase.py --since 2026-01-01 --dry-run
python3 scripts/sync_apple_history_to_supabase.py --since 2026-01-01
```

You need either `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ADMIN_EMAIL` plus `SUPABASE_ADMIN_PASSWORD` in `.env.local` on your Mac for this script. Keep those private.

To run it automatically every night at 8 PM on your Mac:

```bash
scripts/install_apple_sync_launch_agent.sh
```
