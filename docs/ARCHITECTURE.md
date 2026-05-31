# Eric Family Tracker Architecture

This document explains how the app is organized so another human can safely change it without reverse-engineering the whole family court system.

## Product Shape

Eric Family Tracker is a private Next.js app with two main experiences:

- Admin experience: Eric manages people, approvals, scoring, settings, imports, and exports.
- Family experience: approved family or family friends can sign in with an approved email or phone, view their own profile, submit quality time, and see the relevant leaderboard.

The app intentionally separates raw interaction data from scoring rules and display math.

## Main Folders

```text
app/
  Next.js App Router pages, route handlers, and layouts.

components/
  Shared UI components used by admin and family routes.

lib/
  Server actions, Supabase access, scoring logic, email copy, family access, and display helpers.

scripts/
  Local Mac scripts for Apple Messages/CallHistory import and scheduled sync.

supabase/migrations/
  Database schema, RLS policies, auth helper functions, and seeded scoring weights.

docs/
  Human-facing documentation.
```

## Route Map

Admin routes:

- `/dashboard`: admin overview and analytics
- `/leaderboard`: admin leaderboard
- `/people`: CRUD roster
- `/people/[id]`: admin profile detail
- `/interactions/new`: admin/manual interaction entry
- `/submissions`: submission status
- `/admin/approvals`: approve or deny pending roster/activity items
- `/admin/pending`: provisional stats for pending people
- `/admin/preview/[id]`: admin preview of what a person will see
- `/admin/settings`: app settings
- `/admin/weights`: scoring weights and recalculation
- `/export/leaderboard.csv`: CSV export

Family routes:

- `/family/me`: signed-in family member profile
- `/family/leaderboard`: family-facing leaderboard

Auth routes:

- `/login`: approved-email/phone access plus admin password access
- `/signup`: roster request form
- `/forgot-password`: admin recovery flow
- `/auth/callback`: Supabase auth callback

## Core Modules

`lib/actions.ts`

- Admin sign-in
- Roster signup
- Approval and denial actions
- Admin person and interaction CRUD
- Sign-in link generation
- Admin password recovery

`lib/family-actions.ts`

- Family-facing activity submission
- Family session/access helpers

`lib/family-access.ts`

- Resolves the currently signed-in family member
- Matches email or phone to approved people
- Fetches family-scoped profile, leaderboard, interactions, and yearly breakdowns

`lib/scoring.ts`

- Reads `scoring_weights`
- Scores approved interactions
- Excludes group chats, pending, and denied rows
- Applies caps and period calculations
- Writes rows to `scores`

`lib/display-score.ts`

- Converts raw score totals into visible `0-100` Favor Scores
- Keeps raw points available internally while making the UI easier to read

`lib/family-lore.ts`

- Rotating inside-joke copy
- Profile roasts
- Badge hints
- Leaderboard trend lines
- Approval queue flavor text

`lib/email.ts`

- Resend email sender
- Randomized signup emails
- Randomized approval emails
- Sign-in link emails
- Admin recovery emails

`lib/relationships.ts`

- Relationship categories
- Audience split between actual family and family friends
- Relationship-aware naming in emails and dashboards

## Data Model

Core tables:

- `people`: roster profiles, contact info, active/approved state, avatar URL
- `interactions`: calls, text exchanges, FaceTimes, Fortnite, visits, life events, manual activities
- `scoring_weights`: editable formula values
- `scores`: calculated weekly, monthly, yearly, and all-time scores
- `badges`: badge definitions
- `person_badges`: person-to-badge mapping

Support tables:

- `profiles`: Supabase Auth profile and role, including admin role
- `app_settings`: feature toggles and site settings

## Privacy Rules

The app should never store text message content.

Allowed interaction metadata:

- Contact/person
- Interaction type
- Direction
- Start and end time
- Duration
- Message count
- Group chat flag
- Source
- Approval status
- Notes for manual submissions

Group chats score zero. Pending and denied interactions do not count.

Supabase Row Level Security is expected on app tables. Admin can access all rows. Family users should only see their own allowed data plus the limited leaderboard for their audience.

## Family vs Family Friends

Family and family friends are separated by relationship logic in `lib/relationships.ts`.

- Actual family sees the family leaderboard.
- Family friends see the friends leaderboard.
- Admin sees everything.

This prevents family friends from being ranked directly against nieces/nephews/siblings unless Eric changes the relationship rules.

## Scoring And Display

There are two score concepts:

- Raw score: calculated from `scoring_weights` and stored in `scores.total_score`.
- Favor Score: UI-normalized score from `lib/display-score.ts`, shown as `0-100`.

The raw score is useful for detailed math and historical comparisons. The Favor Score is easier for people to understand on the website.

Do not hard-code point values in UI components. Edit `scoring_weights` or the scoring engine instead.

## Apple Metadata Sync

The website cannot directly read iCloud, iMessage, FaceTime, or iPhone call logs.

The local Mac script handles that:

```bash
python3 scripts/sync_apple_history_to_supabase.py --since 2026-01-01 --dry-run --diagnose
python3 scripts/sync_apple_history_to_supabase.py --since 2026-01-01
```

The script:

- Reads approved and pending people from Supabase
- Matches by phone and email
- Optionally checks macOS Contacts for extra handles
- Reads local Apple Messages and CallHistory databases
- Skips group chats
- Uploads metadata only
- Uses duplicate keys so repeated syncs do not inflate scores
- Recalculates scores

Nightly sync is installed with:

```bash
scripts/install_apple_sync_launch_agent.sh
```

Default schedule: every night at 8 PM on Eric's Mac.

## UI Structure

`components/AppShell.tsx`

- Main admin shell
- Dark editorial dashboard styling

`components/FamilyShell.tsx`

- Family-facing shell
- Light branded experience
- Used by `/family/me` and `/family/leaderboard`

Shared components with tone support:

- `StatCard`
- `LeaderboardTable`
- `LeaderboardRaceGraph`
- `InheritanceSimulator`

These components accept a `tone` prop so admin routes can stay dark and family routes can stay readable on light backgrounds.

Analytics components:

- `DashboardAnalytics`: admin analytics panels
- `LeaderboardIntelligence`: leaderboard insights
- `LeaderboardRaceGraph`: photo race line graph with rank x-axis and Favor Score y-axis
- `TurtleRaceBreakdown`: person-level breakdown by communication type

## Humor And Inside Jokes

Most reusable joke copy lives in `lib/family-lore.ts`.

Current categories:

- Low-contact lines
- Abuelito German reactions
- Steady/active/hot trend lines
- Approval queue lines
- Empty state lines
- Inheritance simulator disclaimers
- Car-concert lines
- Person-specific profile roasts and badges

Approval and signup email variants live in `lib/email.ts`.

When adding jokes:

- Prefer rotating arrays instead of one hard-coded line everywhere.
- Keep jokes short enough for mobile.
- Keep profile-specific jokes in `profileRoast` or `badgeHints`.
- Keep email jokes in `lib/email.ts`.
- Avoid adding jokes directly inside UI components unless the joke is truly specific to that component.

## Email System

Emails use Resend when configured:

```text
RESEND_API_KEY
EMAIL_FROM
```

Email types:

- Signup welcome email
- Approval email
- Custom sign-in link email
- Admin recovery email

If `RESEND_API_KEY` is missing, signup and approval still work, but extra emails are skipped. Sign-in link and recovery emails require email configuration.

## Deployment

Production deploys through Vercel from GitHub.

Main domain:

```text
https://calltioeric.com
```

Required Vercel environment variables are listed in `README.md` and `docs/HOW_IT_WORKS.md`.

## Common Change Guide

Add a new joke:

1. Edit `lib/family-lore.ts` for site copy or `lib/email.ts` for email copy.
2. Keep the line short.
3. Commit and deploy.

Change scoring:

1. Prefer editing `scoring_weights` through `/admin/weights`.
2. If engine behavior changes, edit `lib/scoring.ts`.
3. Recalculate scores.

Change family access:

1. Review `lib/family-access.ts`.
2. Review RLS policies in `supabase/migrations/002_rls_policies.sql`.
3. Test with a non-admin family profile.

Change visual style:

1. Check `app/globals.css` and `tailwind.config.ts`.
2. Use existing shared components before adding new ones.
3. Verify mobile contrast on family pages.
