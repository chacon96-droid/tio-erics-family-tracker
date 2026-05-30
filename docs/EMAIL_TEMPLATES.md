# Eric Family Tracker Email Templates

These templates can be pasted into Supabase Auth email templates or used later with a transactional email service like Resend.

The app now sends randomized signup and approval emails through Resend when these environment variables are set:

```text
RESEND_API_KEY
EMAIL_FROM
```

If `RESEND_API_KEY` is missing, signup and approval still work; the app just skips the extra email.

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

## Approval Email

Use this later if the app adds transactional approval emails.

Subject:

```text
Roster approved. The leaderboard sees you now.
```

Body:

```text
You have been approved for the Tio Eric Leaderboard.

Calls, FaceTimes, and text exchanges with Eric now count toward your score. The sync is currently scheduled nightly at 8 PM from Eric's Mac.

You can also submit quality time manually for approval if the algorithm fails to appreciate your emotional labor, Fortnite excellence, or actual in-person presence.

The inheritance simulator is a joke. Unless it motivates you to call. Then it is public service.
```
