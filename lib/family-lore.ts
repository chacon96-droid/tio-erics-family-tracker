import type { Person, Score } from "@/lib/types";

const lowContactLines = [
  "Avoiding Eric like Abuelito German avoids his ex-wives.",
  "Current status: deep cover. Abuelito German would respect the cold evasiveness.",
  "No calls. No texts. Just vibes and legal distance.",
  "No calls again. Goooooddddammit.",
  "Big-a-big shot now? Too good for a call?",
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
  "Direct communication detected. Group chat lawyers are furious.",
  "Stable performance. Not quite whitey psychos behavior, which is growth."
];

const activeTrendLines = [
  "Actually showing up. Shit maaaaannn.",
  "A real campaign is forming. Eric may need to act unimpressed.",
  "This is not casual anymore. Points are being acquired.",
  "Strong movement. Big-a-big shot, but in a productive way.",
  "Momentum with receipts. The leaderboard respects paperwork.",
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
  "Whitey psychos allegations dismissed due to overwhelming call evidence."
];

const approvalQueueLines = [
  "This alleged quality time is awaiting Eric's extremely fair and legally meaningless judgment.",
  "Pending approval. Evidence will be reviewed with the seriousness of Brian being accused of stealing from a gelato shop.",
  "Eric will approve this once he finishes making the story 27% more dramatic.",
  "Manual activity submitted. The court of Tio Eric is now in session.",
  "This has Briana-at-rotary-sushi levels of unnecessary commitment.",
  "Approval will resume after skincare, sock alignment, existential pacing, and 54 other steps.",
  "Pending review. Abuelito German has not yet determined whether this is whitey psychos behavior."
];

const emptyStateLines = [
  "The phones are silent. The inheritance simulator is unimpressed.",
  "Nobody has called. Somewhere, Monopoly is still causing more damage.",
  "No one has earned points yet. Tragic, honestly.",
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
    if (total >= 2500) return "Accelerating like Sebastian into a Thanksgiving fence.";
    return "cool ig, with mild Aura Theft risk.";
  }

  if (hasName(person, ["sebastian", "lucas"])) {
    if (total >= 2500) return "Moved up. Reacted with devastating emotional restraint.";
    return "cool ig";
  }

  if (hasName(person, ["briana"])) {
    if (total >= 2500) return "First sour, then sweet. The leaderboard remains emotionally unprepared.";
    return "Sour Patch Swing";
  }

  if (hasName(person, ["luigi"])) {
    if (total >= 2500) return "This score took off like one of Luigi's shirtless joyrides.";
    return "Rapid acceleration detected. Hopefully no Amazon trucks nearby.";
  }

  if (hasName(person, ["zander"])) return "Step 43 of 57, somehow still moving.";

  if (total >= 2500) return pickLore(hotTrendLines, seed);
  if (total >= 900) return pickLore(activeTrendLines, seed);
  if (total >= 150) return pickLore(steadyTrendLines, seed);
  return pickLore([...steadyTrendLines, ...abuelitoReactionLines], seed);
}

export function profileRoast(person: Pick<Person, "name" | "relationship">, score?: Pick<Score, "total_score">) {
  if (hasName(person, ["zander"])) {
    return "Zander has to rearrange his sock drawer before this can proceed. Emergency routine operations remain ongoing.";
  }
  if (hasName(person, ["briana"])) {
    return "Briana once ran up a $90 rotary sushi bill for a tiny gumball-machine toy. Commitment like that deserves documentation.";
  }
  if (hasName(person, ["sebastian"])) {
    return "Known risk factors: Drake glazing, dad quips, and suspiciously familiar one-liners. Possible Aura Theft.";
  }
  if (hasName(person, ["lucas"])) {
    return "Quality time, lowercase enthusiasm, and a response style best summarized as cool ig.";
  }
  if (hasName(person, ["luigi"])) {
    return "Joyride Energy. Shirtless confidence is not currently a scored category, but the committee is aware.";
  }
  if (hasName(person, ["jessica"])) {
    return "Jessica observes everything. Luigi gets consequences. Briana somehow gets funding and transportation.";
  }
  if (hasName(person, ["brian"])) {
    return "Could Buy Everyone Gelato energy. A financial declaration may or may not have been made.";
  }

  if ((score?.total_score || 0) <= 0) return lowContactCopy(person.name);
  return "Communication score calculated with science, suspicion, and mild emotional damage.";
}

export function badgeHints(person: Pick<Person, "name" | "relationship">) {
  if (hasName(person, ["zander"])) return ["57-Step Certified", "Sock Drawer Protocol"];
  if (hasName(person, ["briana"])) return ["Sweet After Further Review", "$90 Sushi Toy Run"];
  if (hasName(person, ["sebastian"])) return ["Thanksgiving Accelerator", "Aura Theft"];
  if (hasName(person, ["lucas"])) return ["cool ig", "Nonchalant Final Boss"];
  if (hasName(person, ["luigi"])) return ["Joyride Energy"];
  if (hasName(person, ["jessica"])) return ["Selective Enforcement", "Justice, But Make It Briana-Proof"];
  if (hasName(person, ["brian"])) return ["Could Buy Everyone Gelato"];
  return ["Side Quest Survivor", "Passenger Seat Pop Star"];
}

export function qualityTimeNudge(seed = "quality-time") {
  return pickLore([...approvalQueueLines, ...carConcertLines], seed);
}
