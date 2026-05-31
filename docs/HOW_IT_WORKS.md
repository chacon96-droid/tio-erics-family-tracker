# Eric Family Tracker: How It Works

Eric Family Tracker is a private family relationship tracker with a joking leaderboard. It records approved calls, text exchanges, Fortnite/gaming, visits, life events, and manual activities. The public-facing joke is an "inheritance allocation" percentage, but the app does not store or display real net worth.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Vercel deployment

The app uses the Next.js App Router because it is the current file-system router for React Server Components.

## Roles

### Admin

Eric is the admin. Admin users can:

- Create and edit people
- Create interactions directly
- Approve or deny family submissions
- Edit scoring weights
- Recalculate scores
- Toggle app settings
- Export leaderboard CSV

Admin access is controlled through the `profiles.role = 'admin'` row in Supabase.

### Family member

Family members can:

- Sign in
- View their own profile
- Submit manual activities
- View their submission approval status
- View limited leaderboard data if enabled

RLS policies ensure family users can only read their own person/profile rows and their own related interactions/scores.

## Main Pages

- `/dashboard`: Admin/family overview
- `/leaderboard`: Scoreboard with week, month, year, and all-time filters
- `/people`: People list and admin person creation
- `/people/[id]`: Person profile, stats, and activity
- `/interactions/new`: Manual interaction submission
- `/submissions`: Submission approval status
- `/admin/weights`: Edit scoring formula and recalculate scores
- `/admin/approvals`: Approve or deny pending submissions
- `/admin/email-previews`: Preview and send test approval emails
- `/admin/settings`: Toggle leaderboard and joke simulator settings
- `/export/leaderboard.csv`: Admin-only CSV export
- `/family/me`: Family-facing personal profile
- `/family/leaderboard`: Family-facing leaderboard, split by family vs family friends

## Database Model

The core requested tables are present:

- `people`
- `interactions`
- `scoring_weights`
- `scores`
- `badges`
- `person_badges`

The MVP also adds:

- `profiles`: maps Supabase Auth users to admin/family roles
- `app_settings`: stores feature toggles

`people.user_id` links a family member's Supabase login to their person profile.

## Privacy Model

The app is private by default.

It does not store text message content. Interactions store only metadata:

- Type
- Direction
- Date/time
- Duration
- Message count
- Whether it was a group chat
- Approval status
- Notes

Group chats always score zero.

Supabase RLS is enabled on all app tables. Admins can access all rows. Family members can only access rows tied to their own `people.user_id`.

## Scoring

Scoring is separated from the UI. The UI never hard-codes point values.

The scoring engine reads `scoring_weights`, then calculates `scores`.

The database stores raw score totals. The visible website usually displays a normalized `0-100` Tio Eric Aura Index from `lib/display-score.ts` so the leaderboard feels understandable instead of showing giant raw point totals.

Important rules:

- Group chats score `0`
- Denied interactions score `0`
- Pending interactions do not count
- Inbound interactions are weighted higher than outbound interactions
- Person-initiated interactions can earn an initiative bonus
- Returned missed calls can earn a special bonus
- Text exchanges use duration and message count, not individual spam messages
- Manual activities require approval unless entered by admin
- Daily cap prevents gaming
- Recent activity can be viewed separately from all-time score

Default scoring weights are seeded in `supabase/migrations/001_initial_schema.sql`.

## Score Recalculation

Admin can recalculate scores from `/admin/weights`.

The app also forces a score refresh when:

- Someone joins the roster
- Eric approves a roster request
- Eric creates an approved interaction
- Eric approves or denies an activity claim

The app recalculates scores for:

- Week
- Month
- Year
- All-time

Calculated rows are stored in `scores`.

## Manual Submissions

Family members submit manual activity from `/interactions/new`.

Non-admin submissions are created as:

```text
source = manual
status = pending
```

Admin can approve or deny them from `/admin/approvals`.

## Phone And Text Import

A hosted website cannot directly read iPhone calls, iMessages, FaceTime history, or Apple Contacts. Apple does not expose that data to ordinary websites.

The app uses a private local importer instead:

```bash
python3 scripts/sync_apple_history_to_supabase.py --since 2026-01-01 --dry-run
python3 scripts/sync_apple_history_to_supabase.py --since 2026-01-01
```

The importer:

- Reads family profile phone/email values from Supabase
- Optionally asks macOS Contacts for extra matching phone/email handles
- Reads local Messages and CallHistory metadata from Eric's Mac
- Skips group chats
- Uploads only metadata: dates, duration, message count, direction, and type
- Stores duplicate import keys so rerunning it does not inflate the leaderboard
- Recalculates scores after approved imports

The importer needs either `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ADMIN_EMAIL` plus `SUPABASE_ADMIN_PASSWORD` in `.env.local` on Eric's Mac. Those values must stay private and must never be exposed to browser code.

To install the nightly Mac sync:

```bash
scripts/install_apple_sync_launch_agent.sh
```

That creates a LaunchAgent that runs the importer every night at 8 PM and writes logs to `outputs/apple-sync.log` and `outputs/apple-sync.err.log`.

## App Structure

The main structure is documented in:

```text
docs/ARCHITECTURE.md
```

Short version:

- `app/`: Next.js pages and route handlers
- `components/`: shared UI
- `lib/`: auth, actions, Supabase access, scoring, display helpers, emails, and family lore
- `scripts/`: local Mac Apple metadata sync
- `supabase/migrations/`: database schema and RLS
- `docs/`: human documentation

## Humor And Inside Jokes

Reusable joke copy lives mostly in:

```text
lib/family-lore.ts
```

Email variants live in:

```text
lib/email.ts
```

This keeps inside jokes, roasts, approval lines, trend labels, and email copy easy to review without digging through UI components.

Short family slang like "cool ig", "Goofy Ahh", Aura, and Rizz is also centralized there so the site can reuse those jokes consistently across trends, profile copy, badges, and approval states.

## Family Vs Family Friends

The app separates actual family from family friends with relationship logic in:

```text
lib/relationships.ts
```

Family members see the family leaderboard. Family friends see the friends leaderboard. Admin can still see and manage everything.

## Environment Variables

Required on Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_NAME
```

The service role key should only be used in trusted server-side code. Do not expose it to the browser.

## Supabase Setup

1. Create a Supabase project
2. Run the migrations in `supabase/migrations`
3. Create Eric's auth user
4. Set Eric's profile role:

```sql
update public.profiles
set role = 'admin'
where id = '<ERIC_AUTH_USER_ID>';
```

5. Add family users through Supabase Auth or an invite flow
6. Link each family auth user to a row in `people.user_id`

## Vercel Deployment

1. Push the repo to GitHub
2. Import the repo in Vercel
3. Add the environment variables
4. Deploy
5. Visit `/login`

## CSV Export

Admin can download:

```text
/export/leaderboard.csv
```

The export includes rank, name, relationship, total score, phone, and email.

## What Not To Do

- Do not store message content
- Do not expose real financial information
- Do not let family members see private rows that are not theirs
- Do not count group chats
- Do not hard-code scoring values in the UI
