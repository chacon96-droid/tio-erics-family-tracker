type SignupEmailInput = {
  to: string;
  name: string;
};

type ApprovalEmailInput = {
  to: string;
  name: string;
};

type EmailVariant = {
  subject: string;
  preview: string;
  intro: string;
  warning: string;
  closer: string;
};

const signupVariants: EmailVariant[] = [
  {
    subject: "You have entered the Tio Eric Leaderboard",
    preview: "Congratulations. Family accountability has located you.",
    intro: "Congratulations. You have entered the third circle of family accountability.",
    warning:
      "Your information has not been sold to a mysterious offshore server farm, harvested for suspicious bot activity, or traded for a suspiciously specific amount of gas station rewards points.",
    closer: "Welcome to the board. Try calling your uncle. Historically, that seems to be where everyone gets cute."
  },
  {
    subject: "Roster request received. The committee is pretending to deliberate.",
    preview: "Your application to be judged by phone etiquette has arrived.",
    intro: "Your roster request has been received by Tio Eric Headquarters, a very serious institution with one employee and suspiciously strong opinions.",
    warning:
      "No, your data is not being shipped to a villainous bunker. It is being used for something far more intimate and alarming: measuring whether you call your uncle.",
    closer: "You are pending approval. Use this time to reflect, hydrate, and consider sending a text that is not just 'lol'."
  },
  {
    subject: "Welcome to the leaderboard. Please remain emotionally available.",
    preview: "You are now eligible for points, judgment, and fictional inheritance pressure.",
    intro: "You have joined the Tio Eric Leaderboard, where love is real, math is weaponized, and silence has consequences.",
    warning:
      "Your information is safe. It is not funding robot propaganda, international intrigue, or a suspiciously cheap streaming service. Kidding aside, this app tracks only metadata, not message content.",
    closer: "May your calls be answered, your FaceTimes intentional, and your score just high enough to make the cousins nervous."
  },
  {
    subject: "Your family ranking era begins now",
    preview: "Nothing says love like a dashboard with filters.",
    intro: "You are now on the runway for Tio Eric's family leaderboard. Yes, this is ridiculous. No, that will not save you.",
    warning:
      "Despite several excellent jokes available to us, your information is not being sold, leaked, cursed, or used to train a bot that says 'wyd' at 2:13 AM.",
    closer: "Approval comes next. After that, the leaderboard will begin quietly judging your communications portfolio."
  }
];

const approvalVariants: EmailVariant[] = [
  {
    subject: "Roster approved. The leaderboard sees you now.",
    preview: "You are officially eligible for points and fictional trust allocation.",
    intro: "You have been approved for the Tio Eric Leaderboard.",
    warning:
      "This means calls, FaceTimes, and text exchanges with Eric can now count toward your score. Group chats remain worthless here, as nature intended.",
    closer: "The inheritance simulator is a joke, legally speaking. Emotionally, behave accordingly."
  },
  {
    subject: "Approved. Your silence is now measurable.",
    preview: "Welcome to the ranked portion of family affection.",
    intro: "Good news: Eric approved your roster request.",
    warning:
      "The leaderboard updates when Eric's Mac syncs call and text metadata, currently scheduled nightly at 8 PM. Message content is not stored. Just the facts. Cold, devastating facts.",
    closer: "You can also submit quality time manually if Fortnite, visits, or actual human effort deserve credit."
  },
  {
    subject: "You are officially on the board",
    preview: "The family trust percentage remains fake. The leaderboard is real enough.",
    intro: "Your Tio Eric Leaderboard profile has been approved.",
    warning:
      "Weekly, monthly, yearly, and all-time rankings are available. This is either a bonding exercise or a very polished cry for attention. Possibly both.",
    closer: "Call your uncle. The algorithm is listening, but in a metadata-only way."
  }
];

function chooseVariant(variants: EmailVariant[]) {
  return variants[Math.floor(Math.random() * variants.length)];
}

function rulesList() {
  return `
    <ul>
      <li>Calls, FaceTimes, and text exchanges with Eric count toward your score.</li>
      <li>Group chats do not count. A group chat is not effort. It is a hallway with notifications.</li>
      <li>The leaderboard updates when Eric's Mac runs the sync, currently scheduled nightly at 8 PM.</li>
      <li>You can view weekly, monthly, yearly, and all-time standings.</li>
      <li>You can submit quality time manually if calls, texts, and FaceTime do not cover it.</li>
      <li>Manual quality time requires Eric's approval, because apparently we have standards now.</li>
      <li>The projected inheritance percentage is a non-binding joke. Mostly. Do not test the mostly.</li>
    </ul>
  `;
}

function shellHtml(name: string, variant: EmailVariant) {
  return `
    <div style="background:#f4efe7;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#1f2928;">
      <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #d9cfc0;border-radius:8px;padding:28px;">
        <p style="margin:0 0 10px;color:#b86f4b;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Eric Family Tracker</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;">${variant.intro}</h1>
        <p style="font-size:16px;line-height:1.55;">Hi ${escapeHtml(name)},</p>
        <p style="font-size:16px;line-height:1.55;">${variant.warning}</p>
        <p style="font-size:16px;line-height:1.55;"><strong>Kidding. Mostly.</strong> You are now part of the Tio Eric Leaderboard ecosystem.</p>
        ${rulesList()}
        <p style="font-size:16px;line-height:1.55;">${variant.closer}</p>
      </div>
    </div>
  `;
}

function textBody(name: string, variant: EmailVariant) {
  return `${variant.intro}

Hi ${name},

${variant.warning}

Kidding. Mostly. You are now part of the Tio Eric Leaderboard ecosystem.

Rules:
- Calls, FaceTimes, and text exchanges with Eric count toward your score.
- Group chats do not count. A group chat is not effort. It is a hallway with notifications.
- The leaderboard updates when Eric's Mac runs the sync, currently scheduled nightly at 8 PM.
- You can view weekly, monthly, yearly, and all-time standings.
- You can submit quality time manually if calls, texts, and FaceTime do not cover it.
- Manual quality time requires Eric's approval, because apparently we have standards now.
- The projected inheritance percentage is a non-binding joke. Mostly. Do not test the mostly.

${variant.closer}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendEmail(to: string, subject: string, html: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Eric Family Tracker <onboarding@resend.dev>";
  if (!apiKey) {
    console.info("Skipping email because RESEND_API_KEY is not configured.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to, subject, html, text })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Email send failed: ${response.status} ${details}`);
  }
}

export async function sendSignupWelcomeEmail({ to, name }: SignupEmailInput) {
  const variant = chooseVariant(signupVariants);
  await sendEmail(to, variant.subject, shellHtml(name, variant), textBody(name, variant));
}

export async function sendApprovalEmail({ to, name }: ApprovalEmailInput) {
  const variant = chooseVariant(approvalVariants);
  await sendEmail(to, variant.subject, shellHtml(name, variant), textBody(name, variant));
}
