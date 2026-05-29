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
