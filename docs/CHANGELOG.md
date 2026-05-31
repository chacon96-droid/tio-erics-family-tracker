# Eric Family Tracker Change Log

This log tracks meaningful product and architecture changes in plain English.

## Current MVP State

- Next.js App Router + TypeScript app deployed on Vercel.
- Supabase Auth/Postgres powers users, roster data, interactions, scores, settings, and approvals.
- Admin and family experiences are split.
- Family members can access their own profile and the appropriate leaderboard.
- Family friends are separated from actual family leaderboard views.
- Apple metadata import runs from Eric's Mac, not from the hosted website.
- Text message content is not stored.
- Visible leaderboard scores use normalized `0-100` Favor Scores.

## Recent Changes

### Family-Facing Auth

- Added approved-email/phone access for family members.
- Kept admin password sign-in separate.
- Added admin recovery workflow.
- Added pending roster flow for unapproved signups.

### Roster And Approvals

- Roster signup creates pending people.
- Eric can approve or deny roster requests.
- Eric can remove people from the roster.
- Pending members can be previewed by admin.
- Approval emails are randomized.
- Approval emails can be previewed and test-sent from `/admin/email-previews`.
- Signup, roster approval, admin-created interactions, and activity approval now force a leaderboard data refresh.

### Apple Metadata Sync

- Added local sync script for Messages and CallHistory metadata.
- Matching uses phone and email from roster rows.
- Clarified that signup identifies the person; it does not limit imports to activity after signup.
- Nightly sync/backfill scans from `2026-01-01` so newly added phone numbers can populate historical 2026 activity.
- Optional Contacts lookup can add more handles.
- Group chats are skipped.
- Duplicate import keys prevent inflated scores.
- Imported Apple metadata is auto-approved when configured through the script behavior.
- Nightly LaunchAgent sync can run from Eric's Mac at 8 PM.

### Scoring

- Scoring reads from `scoring_weights`.
- Scores are calculated by week, month, year, and all-time.
- Raw score totals remain stored in the database.
- UI now displays normalized Favor Scores near `0-100`.
- Leaderboard graph is now framed as the Tio Eric Favorability Index / Family Totem Pole, with Favor Score on the y-axis.

### Leaderboard And Analytics

- Added dashboard analytics.
- Added leaderboard intelligence sections.
- Added favorability graph with each person's avatar or initial.
- Added person-level favorability lanes by communication type.
- Added projected inheritance simulator as a joke mode.

### Design

- Moved toward a more editorial, SF-tech-style visual system.
- Added branded `TE`/Call Tio Eric presentation.
- Moved the family-facing UI to the same dark-first system as admin.
- Replaced beige/light panel defaults with darker surfaces and stronger text contrast.
- Added `tone` support to shared components:
  - `StatCard`
  - `LeaderboardTable`
  - `LeaderboardRaceGraph`
  - `InheritanceSimulator`
- Fixed low-contrast text on family profile and family leaderboard pages.

### Inside Jokes And Copy

- Centralized most reusable joke copy in `lib/family-lore.ts`.
- Added person-specific profile roasts and badges.
- Added Abuelito German lines:
  - ex-wives avoidance
  - "Coño, chucha, mierda"
  - "Shit maaaaannn"
  - "Is that right?"
  - "Goooooddddammit"
  - "whitey psychos"
- Added Brian gelato shop jokes.
- Added Zander sock drawer / 57-step routine jokes.
- Added Zander/Eric "Goofy Ahh Doofy Ahh" and "relevant schema" language.
- Added Briana Sour Patch, rotary sushi toy, and selective enforcement jokes.
- Added Luigi shirtless joyride jokes.
- Added Sebastian Thanksgiving fence, Drake glazing, and Aura Theft jokes.
- Added Sebastian/Luigi "wit yo bitch-ass" phrasing for their person-specific copy.
- Added Jessica "what up biiiitch" call-greeting lore.
- Added Lucas/Sebastian nonchalant "cool ig" jokes.
- Added Sebastian-flavored "Goofy Ahh" language plus Aura/Rizz trend and badge copy.
- Added car singing / Olivia Rodrigo / Gracie Abrams references.

## Where To Update Things

- Site joke copy: `lib/family-lore.ts`
- Email variants: `lib/email.ts`
- Approval email previews/test sends: `app/admin/email-previews/page.tsx`
- Score math: `lib/scoring.ts`
- Score display normalization: `lib/display-score.ts`
- Family/friend audience split: `lib/relationships.ts`
- Family access behavior: `lib/family-access.ts`
- Admin actions and approval behavior: `lib/actions.ts`
- Family submissions: `lib/family-actions.ts`
- Apple sync: `scripts/sync_apple_history_to_supabase.py`
- Database schema and policies: `supabase/migrations`
- Design tokens/global styles: `app/globals.css`, `tailwind.config.ts`

## Known Operational Notes

- The hosted website cannot directly connect to iCloud call/text history.
- Eric's Mac must run the sync script for Apple metadata.
- Vercel deploys automatically from GitHub.
- Local typecheck/build require dependencies to be installed with `npm install`.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Do not expose Apple database contents or message text.
