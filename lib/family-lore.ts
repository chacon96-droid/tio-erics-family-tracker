import type { Person, Score } from "@/lib/types";

type ScoreSuggestionBreakdown = {
  year: number;
  totalScore: number;
  callScore: number;
  textScore: number;
  timeTogetherScore: number;
  approvedInteractionCount: number;
  pendingInteractionCount: number;
  callCount: number;
  textExchangeCount: number;
  qualityTimeMinutes: number;
  totalMinutes: number;
  messageCount: number;
};

const lowContactLines = [
  "Avoiding Eric like Abuelito German avoids his ex-wives.",
  "Current status: deep cover. Abuelito German would respect the cold evasiveness.",
  "No calls. No texts. Just vibes and legal distance.",
  "Not calling Tio in the big 26? Tragic.",
  "No calls again. Goooooddddammit.",
  "Big-a-big shot now? Too good for a call?",
  "cool ig? Bold response from someone currently doing nothing.",
  "Goofy Ahh absence. Sebastian would have named this immediately.",
  "Goofy Doofy silence, with all relevant schema attached.",
  "Another week of emotional absenteeism. Big-a-big shot behavior.",
  "Low contact, high suspicion. Abuelito German is muttering whitey psychos somewhere.",
  "This score has whitey psychos energy, and not in a productive way."
];

const abuelitoReactionLines = [
  "Coño, chucha, mierda. The leaderboard has updated.",
  "Shit maaaaannn, somebody actually called.",
  "Is that right? A text message? In this economy?",
  "Whitey psychos on the move. The leaderboard has been informed.",
  "Coño, somebody remembered Eric exists.",
  "Shit maaaaannn, that is a real phone call.",
  "Is that right? Look at you climbing the board.",
  "Coño, chucha, mierda. We have movement.",
  "Shit maaaaannn, this one might make the trust.",
  "Is that right? A family member with initiative.",
  "Coño. A call longer than twelve seconds. Historic.",
  "Shit maaaaannn, actual effort detected.",
  "Is that right? Somebody escaped the group chat and texted directly.",
  "A twelve-second text exchange is not a relationship. Goooooddddammit.",
  "They saw the message and vanished. Goooooddddammit.",
  "You made Eric check the leaderboard for this? Goooooddddammit."
];

const steadyTrendLines = [
  "Present, accounted for, and not embarrassing the family.",
  "Respectable effort. The board is watching politely.",
  "Not a dynasty yet, but the phones are not silent.",
  "Some signs of life. The committee will allow it.",
  "Quietly building a case for favorite status.",
  "Mild Aura detected. Not enough to brag, enough to document.",
  "Some Rizz in the communication portfolio. The committee is intrigued.",
  "Direct communication detected. Group chat lawyers are furious.",
  "Stable performance. Not quite whitey psychos behavior, which is growth."
];

const activeTrendLines = [
  "Actually showing up. Shit maaaaannn.",
  "A real campaign is forming. Eric may need to act unimpressed.",
  "This is not casual anymore. Points are being acquired.",
  "Strong movement. Big-a-big shot, but in a productive way.",
  "Momentum with receipts. The leaderboard respects paperwork.",
  "Aura increasing. The chart is trying to stay professional.",
  "Rizz with receipts. Very dangerous in a leaderboard environment.",
  "Somebody wants that imaginary trust percentage.",
  "The whitey psychos caucus has requested a recount."
];

const hotTrendLines = [
  "Running up the score like Briana chasing a tiny gumball-machine toy.",
  "Elite contact rate. The rest of the roster should feel nervous.",
  "This is approaching suspiciously favorite-child behavior.",
  "Dominant performance. Monopoly-level competitiveness detected.",
  "The leaderboard has entered witness protection.",
  "Too much effort to ignore. Eric will pretend to be normal about it.",
  "Aura fully operational. The cousins should be concerned.",
  "Generational Rizz numbers. Someone audit the charm department.",
  "Whitey psychos allegations dismissed due to overwhelming call evidence."
];

const approvalQueueLines = [
  "This alleged quality time is awaiting Eric's extremely fair and legally meaningless judgment.",
  "Pending approval. Evidence will be reviewed with the seriousness of Brian being accused of stealing from a gelato shop.",
  "Eric will approve this once he finishes making the story 27% more dramatic.",
  "Manual activity submitted. The court of Tio Eric is now in session.",
  "This has Briana-at-rotary-sushi levels of unnecessary commitment.",
  "Pending review for possible Rizz inflation.",
  "Quality time claim received. Aura pending verification.",
  "Approval will resume after skincare, sock alignment, existential pacing, and 54 other steps.",
  "Pending review. Abuelito German has not yet determined whether this is whitey psychos behavior."
];

const emptyStateLines = [
  "The phones are silent. The inheritance simulator is unimpressed.",
  "Nobody has called. Somewhere, Monopoly is still causing more damage.",
  "No one has earned points in the big 26 yet. Tragic.",
  "The roster exists. The effort remains theoretical."
];

const inheritanceLines = [
  "Projected family trust share: emotionally binding, legally meaningless.",
  "Allocation based on effort, vibes, and whether you remembered Eric exists.",
  "This may or may not hold up in court, but it definitely holds up in the group chat."
];

const carConcertLines = [
  "Olivia Rodrigo and Gracie Abrams have entered the vehicle.",
  "Quality time confirmed: dramatic car singing counts.",
  "Passenger Seat Pop Star energy detected."
];

const funnyScoreSuggestionLines = [
  "Call Eric before the group chat lawyers get involved.",
  "A direct text counts more than telepathic affection, which remains hard to audit.",
  "Submit Fortnite, dinner, car singing, or anything that proves this relationship exists outside theory.",
  "Remember: silence has consequences. Possibly fake inheritance consequences, but consequences.",
  "If you are losing, try the ancient technique of saying hello.",
  "Avoid Big-a-big shot behavior. The phone has a call button for a reason.",
  "Increase Aura by initiating contact before Eric starts narrating your absence like a documentary.",
  "Quality time claims are welcome. Fraud is discouraged, unless it is extremely funny and still denied.",
  "Skip the group chat. Private communication is where the points live.",
  "A thoughtful check-in can move mountains, or at least this deeply unnecessary chart."
];

function hashSeed(seed: string) {
  return seed.split("").reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
}

export function pickLore(lines: string[], seed = "") {
  return lines[hashSeed(seed) % lines.length];
}

function hasName(person: Pick<Person, "name">, names: string[]) {
  const normalized = person.name.toLowerCase();
  return names.some((name) => normalized.includes(name));
}

export function dashboardReaction(seed = "dashboard") {
  return pickLore(abuelitoReactionLines, seed);
}

export function emptyLeaderboardCopy(seed = "empty") {
  return pickLore(emptyStateLines, seed);
}

export function inheritanceDisclaimer(seed = "inheritance") {
  return pickLore(inheritanceLines, seed);
}

export function approvalQueueCopy(seed = "approval") {
  return pickLore(approvalQueueLines, seed);
}

export function lowContactCopy(seed = "low-contact") {
  return pickLore(lowContactLines, seed);
}

export function trendLore(person: Pick<Person, "id" | "name" | "relationship">, score?: Pick<Score, "total_score">) {
  const total = score?.total_score || 0;
  if (total <= 0) return lowContactCopy(person.name);

  const seed = `${person.id}:${person.name}:${person.relationship}:${total}`;

  if (hasName(person, ["sebastian"])) {
    if (total >= 2500) return "Accelerating like Sebastian into a Thanksgiving fence, wit yo bitch-ass.";
    if (total >= 900) return "cool ig? with suspiciously high Aura, wit yo bitch-ass.";
    return "Goofy Ahh score movement, wit yo bitch-ass.";
  }

  if (hasName(person, ["sebastian", "lucas"])) {
    if (total >= 2500) return "Moved up. Reacted with devastating emotional restraint. cool ig.";
    if (total >= 900) return "Nonchalant Aura detected. Possibly too calm.";
    return "cool ig?";
  }

  if (hasName(person, ["briana"])) {
    if (total >= 2500) return "First sour, then sweet. The leaderboard remains emotionally unprepared.";
    return "Sour Patch Swing";
  }

  if (hasName(person, ["luigi"])) {
    if (total >= 2500) return "This score took off like one of Luigi's shirtless joyrides, wit yo bitch-ass.";
    return "Rapid acceleration detected, wit yo bitch-ass. Hopefully no Amazon trucks nearby.";
  }

  if (hasName(person, ["zander"])) {
    if (total >= 2500) return "Goofy Ahh Doofy Ahh numbers, formally entered into the relevant schema.";
    if (total >= 900) return "Goofy, doofy, and statistically relevant.";
    return "Zander is allegedly on step 43 of his 57-step morning routine, but somehow the score is still moving.";
  }

  if (hasName(person, ["jessica"])) {
    if (total >= 2500) return "what up biiiitch! Jessica is officially on the board.";
    if (total >= 900) return "Jessica answered the call. what up biiiitch energy confirmed.";
    return "Quiet observer, occasional what up biiiitch recipient.";
  }

  if (total >= 2500) return pickLore(hotTrendLines, seed);
  if (total >= 900) return pickLore(activeTrendLines, seed);
  if (total >= 150) return pickLore(steadyTrendLines, seed);
  return pickLore([...steadyTrendLines, ...abuelitoReactionLines], seed);
}

export function profileRoast(person: Pick<Person, "name" | "relationship">, score?: Pick<Score, "total_score">) {
  if (hasName(person, ["zander"])) {
    return "Zander is famous for needing a 57-step morning routine before leaving the house. Somewhere in there he also has to rearrange his sock drawer. Goofy Doofy operations and all relevant schema remain ongoing.";
  }
  if (hasName(person, ["briana"])) {
    return "Briana once ran up a $90 rotary sushi bill for a tiny gumball-machine toy. Commitment like that deserves documentation.";
  }
  if (hasName(person, ["sebastian"])) {
    return "Known risk factors: Drake glazing, dad quips, Goofy Ahh naming rights, and suspiciously familiar one-liners, wit yo bitch-ass. Possible Aura Theft.";
  }
  if (hasName(person, ["lucas"])) {
    return "Quality time, lowercase enthusiasm, and a response style best summarized as cool ig? Nonchalant Aura remains under review.";
  }
  if (hasName(person, ["luigi"])) {
    return "Joyride Energy, wit yo bitch-ass. Shirtless confidence is not currently a scored category, but the committee is aware.";
  }
  if (hasName(person, ["jessica"])) {
    return "Jessica observes everything. Eric calls with a what up biiiitch. Luigi gets consequences. Briana somehow gets funding and transportation.";
  }
  if (hasName(person, ["brian"])) {
    return "Could Buy Everyone Gelato energy. A financial declaration may or may not have been made.";
  }

  if ((score?.total_score || 0) <= 0) return lowContactCopy(person.name);
  return "Communication score calculated with science, suspicion, and mild emotional damage.";
}

export function badgeHints(person: Pick<Person, "name" | "relationship">) {
  if (hasName(person, ["zander"])) return ["57-Step Certified", "Sock Drawer Protocol", "Goofy Doofy Schema"];
  if (hasName(person, ["briana"])) return ["Sweet After Further Review", "$90 Sushi Toy Run"];
  if (hasName(person, ["sebastian"])) return ["Thanksgiving Accelerator", "Aura Theft", "Goofy Ahh Certified"];
  if (hasName(person, ["lucas"])) return ["cool ig?", "Nonchalant Final Boss", "Aura Reserve"];
  if (hasName(person, ["luigi"])) return ["Joyride Energy"];
  if (hasName(person, ["jessica"])) return ["Selective Enforcement", "What Up Biiiitch", "Justice, But Make It Briana-Proof"];
  if (hasName(person, ["brian"])) return ["Could Buy Everyone Gelato"];
  return ["Side Quest Survivor", "Passenger Seat Pop Star", "Rizz Pending"];
}

export function qualityTimeNudge(seed = "quality-time") {
  return pickLore([...approvalQueueLines, ...carConcertLines], seed);
}

export function scoreImprovementSuggestions(person: Pick<Person, "id" | "name" | "relationship">, breakdown?: ScoreSuggestionBreakdown) {
  const seed = `${person.id}:${person.name}:${breakdown?.year || "no-year"}:${breakdown?.totalScore || 0}`;
  const suggestions: string[] = [];

  if (!breakdown || breakdown.approvedInteractionCount === 0) {
    suggestions.push("Start with one real interaction in the big 26: a call, a text exchange, or submitted quality time. The bar is low, which is either generous or tragic.");
  } else {
    const scores = [
      { key: "calls", value: breakdown.callScore },
      { key: "texts", value: breakdown.textScore },
      { key: "quality", value: breakdown.timeTogetherScore }
    ].sort((a, b) => a.value - b.value);

    const weakest = scores[0]?.key;
    if (weakest === "calls") {
      suggestions.push(`Call Eric. You have ${breakdown.callCount} calls logged this year, and the committee is pretending not to stare.`);
    } else if (weakest === "texts") {
      suggestions.push(`Send a real text exchange. ${breakdown.messageCount} messages is the current paper trail, and the paper looks thin.`);
    } else {
      suggestions.push(`Submit quality time: gaming, visits, car concerts, errands, side quests. You have ${Math.round(breakdown.qualityTimeMinutes)} approved minutes so far.`);
    }
  }

  if ((breakdown?.pendingInteractionCount || 0) > 0) {
    suggestions.push("You have pending claims. Eric has them in the tiny courtroom. Do not bribe the judge unless the bribe is calling him.");
  }

  if (hasName(person, ["zander"])) {
    suggestions.push("Finish the famous 57-step morning routine, complete the emergency sock-drawer rearrangement, then call Eric before the window of emotional availability closes.");
  } else if (hasName(person, ["briana"])) {
    suggestions.push("Channel the $90 tiny-toy sushi commitment into one direct check-in. Sour first, sweet after approval.");
  } else if (hasName(person, ["sebastian"])) {
    suggestions.push("Stop stealing Eric's sayings for one minute and use the original source. Call him, wit yo bitch-ass.");
  } else if (hasName(person, ["luigi"])) {
    suggestions.push("No shirtless joyride required. A normal call will score better and involve fewer incident reports, wit yo bitch-ass.");
  } else if (hasName(person, ["jessica"])) {
    suggestions.push("Answer with one clean what up biiiitch and the analytics department will have something to work with.");
  } else if (hasName(person, ["brian"])) {
    suggestions.push("You could buy everyone gelato, allegedly. Or just call Eric, which is cheaper and scores immediately.");
  } else if (hasName(person, ["lucas"])) {
    suggestions.push("The nonchalant strategy is powerful, but the board still needs evidence. A cool ig text is technically a start.");
  }

  suggestions.push(pickLore(funnyScoreSuggestionLines, seed));
  suggestions.push(pickLore(funnyScoreSuggestionLines, `${seed}:bonus`));

  return [...new Set(suggestions)].slice(0, 4);
}
