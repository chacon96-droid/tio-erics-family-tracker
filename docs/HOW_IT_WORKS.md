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
- `/admin/settings`: Toggle leaderboard and joke simulator settings
- `/export/leaderboard.csv`: Admin-only CSV export

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

Phone/text import is intentionally a later integration.

A hosted website cannot directly read iPhone calls, iMessages, FaceTime history, or Apple Contacts. Apple does not expose that data to ordinary websites.

The safe future path is:

1. Family members provide phone/email in the app
2. Eric approves the person
3. A private local importer on Eric's Mac reads Apple metadata if macOS permissions allow it
4. The importer creates metadata-only `interactions`
5. Scores are recalculated

Group chats should be marked `is_group_chat = true`, which makes them score zero.

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
