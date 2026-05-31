type SignupEmailInput = {
  to: string;
  name: string;
  relationship: string;
};

type ApprovalEmailInput = {
  to: string;
  name: string;
  relationship: string;
};

type TemporaryPasswordInput = {
  to: string;
  loginEmail: string;
  temporaryPassword: string;
};

type SignInLinkInput = {
  to: string;
  name: string;
  relationship: string;
  link: string;
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
    subject: "You have been approved for the Tio Eric Leaderboard",
    preview: "The committee has spoken. Unfortunately, the committee is Eric.",
    intro: "You are in.",
    warning:
      "Your application to the Tio Eric Leaderboard has been approved by the Committee of Tio Eric, which is mostly Eric, a database, and an alarming amount of confidence.",
    closer: "Projected inheritance percentages are emotionally binding, legally meaningless, and updated as the data becomes more embarrassing."
  },
  {
    subject: "Is that right? You made the leaderboard.",
    preview: "Abuelito German has been spiritually notified.",
    intro: "Is that right? You are approved.",
    warning:
      "The leaderboard will now track your calls, texts, FaceTimes, and approved quality time with Eric. No message contents are stored, only metadata, because even this family has limits.",
    closer: "If your score is low, the system may assume you are avoiding Eric like Abuelito German avoids his ex-wives. Cold evasiveness will be documented."
  },
  {
    subject: "Your leaderboard era begins now",
    preview: "Legally meaningless. Emotionally devastating.",
    intro: "Congratulations. You have entered the family ranking system.",
    warning:
      "Your score is based on calls, texts, FaceTimes, and approved quality time with Eric. Group chats do not count, because that is cowardice with notifications.",
    closer: "Your projected family trust percentage may rise or fall based on effort, initiative, and whether you remember Eric exists."
  },
  {
    subject: "You could buy everybody here gelato",
    preview: "Approved with suspicious frozen-dessert energy.",
    intro: "You are approved.",
    warning:
      "The Tio Eric Leaderboard has accepted your presence into the arena. Your calls, texts, FaceTimes, and approved quality time now count toward your score.",
    closer: "Manual submissions may be reviewed with the seriousness of Brian being accused of stealing from a gelato shop. Big-a-big shot now? Prove it."
  },
  {
    subject: "approved. cool ig.",
    preview: "Lowercase enthusiasm, officially accepted.",
    intro: "cool ig.",
    warning:
      "You are officially approved for the Tio Eric Leaderboard. Your calls, texts, FaceTimes, and approved quality time with Eric now count.",
    closer: "Group chats do not count, because lowercase enthusiasm still requires direct effort. Do with this information what you will. Ideally, call Eric. But like, casually."
  },
  {
    subject: "Roster approved. Shit maaaaannn.",
    preview: "Actual effort has entered the chat.",
    intro: "Shit maaaaannn, you are approved.",
    warning:
      "From here on out, direct calls, texts, FaceTimes, and approved quality time with Eric can move your leaderboard score. A group chat is not effort. It is a hallway with notifications.",
    closer: "No calls again? Goooooddddammit. A direct text? Is that right? Look at you climbing the board."
  },
  {
    subject: "Approved. Whitey psychos caucus notified.",
    preview: "Abuelito German has entered the minutes.",
    intro: "You are approved. Abuelito German has been briefed.",
    warning:
      "Your direct calls, texts, FaceTimes, and approved quality time now count toward the leaderboard. Group chats still do not count, because that is where accountability goes to wear sunglasses indoors.",
    closer: "If your score collapses, the official explanation may become whitey psychos behavior. The cure is simple: call Eric."
  }
];

function chooseVariant(variants: EmailVariant[]) {
  return variants[Math.floor(Math.random() * variants.length)];
}

function relationshipCopy(relationship: string) {
  const normalized = relationship.toLowerCase();
  if (["dad", "mom", "grandparent"].includes(normalized)) {
    return {
      leaderboardName: "Eric Family Tracker",
      fallbackEricName: "Eric",
      fallbackNudge: "your son",
      relationshipLine: "Eric has logged you as family senior leadership, which is a very formal way of saying he still wants you to call him.",
      callLine: "Calls, FaceTimes, and text exchanges with Eric count toward your score.",
      closingNudge: "Call your son. He built a whole website instead of simply processing his feelings."
    };
  }
  if (["brother", "sister"].includes(normalized)) {
    return {
      leaderboardName: "Eric Family Tracker",
      fallbackEricName: "Eric",
      fallbackNudge: "your brother",
      relationshipLine: "Eric has logged you in the sibling division, where love is real and response time is apparently optional.",
      callLine: "Calls, FaceTimes, and text exchanges with Eric count toward your score.",
      closingNudge: "Text your brother. A two-word reply still counts as movement."
    };
  }
  if (["son", "daughter"].includes(normalized)) {
    return {
      leaderboardName: "Eric Family Tracker",
      fallbackEricName: "Eric",
      fallbackNudge: "Eric",
      relationshipLine: "Eric has logged you in the kid division. The expectations are high, mostly because he controls the spreadsheet.",
      callLine: "Calls, FaceTimes, and text exchanges with Eric count toward your score.",
      closingNudge: "Call Eric. He is pretending this is about data. It is not entirely about data."
    };
  }
  if (["niece", "nephew"].includes(normalized)) {
    return {
      leaderboardName: "Tio Eric Leaderboard",
      fallbackEricName: "Tio Eric",
      fallbackNudge: "your uncle",
      relationshipLine: "You are officially in the Tio Eric zone, where affection has a dashboard and silence has consequences.",
      callLine: "Calls, FaceTimes, and text exchanges with Tio Eric count toward your score.",
      closingNudge: "Call your uncle. Historically, that seems to be where everyone gets cute."
    };
  }
  return {
    leaderboardName: "Eric Family Tracker",
    fallbackEricName: "Eric",
    fallbackNudge: "Eric",
    relationshipLine: "Eric has logged your relationship correctly, or at least confidently, which is almost the same thing in family software.",
    callLine: "Calls, FaceTimes, and text exchanges with Eric count toward your score.",
    closingNudge: "Call Eric. The leaderboard has a long memory and very little shame."
  };
}

function contextualText(value: string, relationship: string) {
  const copy = relationshipCopy(relationship);
  return value
    .replaceAll("Tio Eric Leaderboard", copy.leaderboardName)
    .replaceAll("Tio Eric Headquarters", `${copy.leaderboardName} Headquarters`)
    .replaceAll("Tio Eric's family leaderboard", "Eric's family leaderboard")
    .replaceAll("Tio Eric", copy.fallbackEricName)
    .replaceAll("your uncle", copy.fallbackNudge)
    .replaceAll("calling your uncle", `calling ${copy.fallbackNudge}`)
    .replaceAll("call your uncle", `call ${copy.fallbackNudge}`);
}

function rulesList(relationship: string) {
  const copy = relationshipCopy(relationship);
  return `
    <ul>
      <li>${copy.callLine}</li>
      <li>Group chats do not count. A group chat is not effort. It is a hallway with notifications.</li>
      <li>The leaderboard updates when Eric's Mac runs the sync, currently scheduled nightly at 8 PM.</li>
      <li>You can view weekly, monthly, yearly, and all-time standings.</li>
      <li>You can submit quality time manually if calls, texts, and FaceTime do not cover it.</li>
      <li>Manual quality time requires Eric's approval, because apparently we have standards now.</li>
      <li>The projected inheritance percentage is a non-binding joke. Mostly. Do not test the mostly.</li>
    </ul>
  `;
}

function shellHtml(name: string, relationship: string, variant: EmailVariant) {
  const copy = relationshipCopy(relationship);
  const intro = contextualText(variant.intro, relationship);
  const warning = contextualText(variant.warning, relationship);
  const closer = contextualText(variant.closer, relationship);
  const finalCloser = closer.includes(copy.closingNudge) ? closer : `${closer} ${copy.closingNudge}`;
  return `
    <div style="background:#f3eee2;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#101413;">
      <div style="max-width:620px;margin:0 auto;background:#fffaf0;border:1px solid #c7a45a;border-radius:8px;padding:28px;">
        ${brandHeaderHtml()}
        <p style="margin:0 0 10px;color:#9b6a3b;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;">Official roster correspondence</p>
        <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.05;">${intro}</h1>
        <p style="font-size:16px;line-height:1.55;">Hi ${escapeHtml(name)},</p>
        <p style="font-size:16px;line-height:1.55;">${copy.relationshipLine}</p>
        <p style="font-size:16px;line-height:1.55;">${warning}</p>
        <p style="font-size:16px;line-height:1.55;"><strong>Kidding. Mostly.</strong> You are now part of the ${copy.leaderboardName} ecosystem.</p>
        ${rulesList(relationship)}
        <p style="font-size:16px;line-height:1.55;">${finalCloser}</p>
      </div>
    </div>
  `;
}

function textBody(name: string, relationship: string, variant: EmailVariant) {
  const copy = relationshipCopy(relationship);
  const intro = contextualText(variant.intro, relationship);
  const warning = contextualText(variant.warning, relationship);
  const closer = contextualText(variant.closer, relationship);
  const finalCloser = closer.includes(copy.closingNudge) ? closer : `${closer} ${copy.closingNudge}`;
  return `${intro}

Hi ${name},

${copy.relationshipLine}

${warning}

Kidding. Mostly. You are now part of the ${copy.leaderboardName} ecosystem.

Rules:
- ${copy.callLine}
- Group chats do not count. A group chat is not effort. It is a hallway with notifications.
- The leaderboard updates when Eric's Mac runs the sync, currently scheduled nightly at 8 PM.
- You can view weekly, monthly, yearly, and all-time standings.
- You can submit quality time manually if calls, texts, and FaceTime do not cover it.
- Manual quality time requires Eric's approval, because apparently we have standards now.
- The projected inheritance percentage is a non-binding joke. Mostly. Do not test the mostly.

${finalCloser}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function brandHeaderHtml() {
  return `
    <div style="display:flex;align-items:center;gap:14px;margin:0 0 24px;">
      <div style="width:48px;height:48px;border:1px solid #c7a45a;background:#101413;color:#c7a45a;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;letter-spacing:-.04em;">TE</div>
      <div>
        <p style="margin:0;color:#c7a45a;font-size:10px;font-weight:900;letter-spacing:.28em;text-transform:uppercase;">Call Tio Eric</p>
        <p style="margin:4px 0 0;color:#101413;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:900;line-height:1;">Family Tracker</p>
      </div>
    </div>
  `;
}

async function sendEmail(to: string, subject: string, html: string, text: string, options?: { requireConfigured?: boolean }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Eric Family Tracker <onboarding@resend.dev>";
  if (!apiKey) {
    if (options?.requireConfigured) throw new Error("Email is not configured.");
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

export async function sendSignupWelcomeEmail({ to, name, relationship }: SignupEmailInput) {
  const variant = chooseVariant(signupVariants);
  await sendEmail(to, contextualText(variant.subject, relationship), shellHtml(name, relationship, variant), textBody(name, relationship, variant));
}

export async function sendApprovalEmail({ to, name, relationship }: ApprovalEmailInput) {
  const variant = chooseVariant(approvalVariants);
  await sendEmail(to, contextualText(variant.subject, relationship), shellHtml(name, relationship, variant), textBody(name, relationship, variant));
}

export async function sendTemporaryPasswordEmail({ to, loginEmail, temporaryPassword }: TemporaryPasswordInput) {
  const subject = "Your Eric Family Tracker admin recovery code";
  const html = `
    <div style="background:#f3eee2;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#101413;">
      <div style="max-width:620px;margin:0 auto;background:#fffaf0;border:1px solid #c7a45a;border-radius:8px;padding:28px;">
        ${brandHeaderHtml()}
        <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.05;">Admin access recovered. The keys were under the couch, emotionally.</h1>
        <p style="font-size:16px;line-height:1.55;">Use this admin email under <strong>Admin password sign-in</strong>:</p>
        <p style="font-size:18px;line-height:1.4;background:#f3eee2;border:1px solid #d9cfbd;border-radius:8px;padding:14px;font-weight:800;">${escapeHtml(loginEmail)}</p>
        <p style="font-size:16px;line-height:1.55;">And use this temporary password:</p>
        <p style="font-size:20px;line-height:1.4;background:#f3eee2;border:1px solid #d9cfbd;border-radius:8px;padding:14px;font-weight:800;">${escapeHtml(temporaryPassword)}</p>
        <p style="font-size:16px;line-height:1.55;">After you get back in, change it to something you will remember but a cousin could not guess while holding a Capri Sun.</p>
        <p style="font-size:16px;line-height:1.55;"><a href="https://calltioeric.com/login">Go to Eric Family Tracker</a></p>
      </div>
    </div>
  `;
  const text = `Admin access recovered.

Use this admin email under Admin password sign-in:

${loginEmail}

And use this temporary password:

${temporaryPassword}

Then go to https://calltioeric.com/login and change it after you get back in.`;

  await sendEmail(to, subject, html, text, { requireConfigured: true });
}

export async function sendSignInLinkEmail({ to, name, relationship, link }: SignInLinkInput) {
  const copy = relationshipCopy(relationship);
  const subject = `Your ${copy.leaderboardName} sign-in link`;
  const safeLink = escapeHtml(link);
  const html = `
    <div style="background:#f3eee2;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#101413;">
      <div style="max-width:620px;margin:0 auto;background:#fffaf0;border:1px solid #c7a45a;border-radius:8px;padding:28px;">
        ${brandHeaderHtml()}
        <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.05;">Re-enter the leaderboard. Try to look casual.</h1>
        <p style="font-size:16px;line-height:1.55;">Hi ${escapeHtml(name)},</p>
        <p style="font-size:16px;line-height:1.55;">Here is your private sign-in link for ${copy.leaderboardName}. No password required, because apparently remembering one more thing would be the real family emergency.</p>
        <p style="margin:24px 0;">
          <a href="${safeLink}" style="display:inline-block;background:#101413;color:#c7a45a;text-decoration:none;border:1px solid #c7a45a;border-radius:8px;padding:14px 18px;font-weight:900;">Open the leaderboard</a>
        </p>
        <p style="font-size:14px;line-height:1.55;color:#64706d;">If the button refuses to participate, copy and paste this link:</p>
        <p style="font-size:14px;line-height:1.55;word-break:break-all;">${safeLink}</p>
        <p style="font-size:16px;line-height:1.55;">${copy.closingNudge}</p>
      </div>
    </div>
  `;
  const text = `Hi ${name},

Here is your private sign-in link for ${copy.leaderboardName}:

${link}

${copy.closingNudge}`;

  await sendEmail(to, subject, html, text, { requireConfigured: true });
}
