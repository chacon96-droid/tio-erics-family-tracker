# Eric Family Tracker Email Templates

These templates can be pasted into Supabase Auth email templates or used later with a transactional email service like Resend.

The app now sends randomized signup and approval emails through Resend when these environment variables are set:

```text
RESEND_API_KEY
EMAIL_FROM
```

If `RESEND_API_KEY` is missing, signup and approval still work; the app just skips the extra email.

The live randomized email copy is implemented in:

```text
lib/email.ts
```

This file includes signup, approval, sign-in link, and admin recovery emails. The examples below are reference copy, not the only variants.

## Signup Confirmation

Subject:

```text
You have entered the Tio Eric Leaderboard
```

HTML body:

```html
<h2>Congratulations. You have entered the third circle of family accountability.</h2>

<p>
  Your information has not been sold to a mysterious offshore server farm,
  harvested for suspicious bot activity, or traded for a suspiciously specific
  amount of gas station rewards points.
</p>

<p>
  Kidding. Mostly. You are now in the <strong>Tio Eric Leaderboard</strong>.
</p>

<p>
  Here are the rules:
</p>

<ul>
  <li>Calls, FaceTimes, and text exchanges with Eric count toward your score.</li>
  <li>Group chats do not count. A group chat is not effort. It is a hallway with notifications.</li>
  <li>The leaderboard updates when Eric's Mac runs the sync, currently scheduled nightly at 8 PM.</li>
  <li>You can view weekly, monthly, yearly, and all-time standings.</li>
  <li>You may submit your own quality time, such as Fortnite, visits, or heroic acts of nephew/niece excellence.</li>
  <li>Manual quality time requires Eric's approval, because this is a family leaderboard, not a vibes-based accounting scandal.</li>
  <li>The projected inheritance percentage is a joke, legally speaking. Emotionally, behave accordingly.</li>
</ul>

<p>
  Confirm your email and await roster approval:
</p>

<p>
  <a href="{{ .ConfirmationURL }}">Confirm my email</a>
</p>

<p>
  Welcome to the board. Try calling your uncle. Historically, that seems to be where everyone gets cute.
</p>
```

Plain text body:

```text
Congratulations. You have entered the third circle of family accountability.

Your information has not been sold to a mysterious offshore server farm, harvested for suspicious bot activity, or traded for a suspiciously specific amount of gas station rewards points.

Kidding. Mostly. You are now in the Tio Eric Leaderboard.

Rules:
- Calls, FaceTimes, and text exchanges with Eric count toward your score.
- Group chats do not count. A group chat is not effort. It is a hallway with notifications.
- The leaderboard updates when Eric's Mac runs the sync, currently scheduled nightly at 8 PM.
- You can view weekly, monthly, yearly, and all-time standings.
- You may submit your own quality time, such as Fortnite, visits, or heroic acts of nephew/niece excellence.
- Manual quality time requires Eric's approval, because this is a family leaderboard, not a vibes-based accounting scandal.
- The projected inheritance percentage is a joke, legally speaking. Emotionally, behave accordingly.

Confirm your email:
{{ .ConfirmationURL }}

Welcome to the board. Try calling your uncle. Historically, that seems to be where everyone gets cute.
```

## Approval Emails

The app randomizes approval emails when Eric approves a roster request. The live variants include:

```text
You have been approved for the Tio Eric Leaderboard
Is that right? You made the leaderboard.
Your leaderboard era begins now
You could buy everybody here gelato
approved. cool ig.
Roster approved. Shit maaaaannn.
Approved. Whitey psychos caucus notified.
```

Approval emails use their own mobile-safe HTML shell in `lib/email.ts`: the headline is always `Roster approved.`, the randomized joke appears as a smaller subline, rules appear in a boxed section, and the email includes an `Open the leaderboard` button.

All approval emails still explain the important rules: direct calls, texts, FaceTimes, and approved quality time count; group chats do not count; message contents are not stored; the inheritance percentage is a non-binding joke.

The actual approval email implementation lives in `lib/email.ts`. Update that file when adding or removing randomized approval copy.
