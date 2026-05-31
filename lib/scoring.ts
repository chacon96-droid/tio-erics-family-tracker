import type { Interaction, ScoringWeight, Score, ScorePeriod } from "@/lib/types";

export type InteractionScore = {
  total: number;
  call: number;
  text: number;
  initiative: number;
  timeTogether: number;
  reliability: number;
  bonus: number;
  penalty: number;
};

const zeroScore: InteractionScore = {
  total: 0,
  call: 0,
  text: 0,
  initiative: 0,
  timeTogether: 0,
  reliability: 0,
  bonus: 0,
  penalty: 0
};

export function weightKey(interaction: Pick<Interaction, "type" | "direction" | "initiated_by_person">) {
  if (interaction.type === "call") {
    return interaction.direction === "inbound" ? "call:inbound" : "call:outbound";
  }
  if (interaction.type === "text_exchange") {
    return interaction.initiated_by_person ? "text_exchange:person_initiated" : "text_exchange:reply";
  }
  return interaction.type;
}

export function scoreInteraction(interaction: Interaction, weights: ScoringWeight[]): InteractionScore {
  if (interaction.is_group_chat || interaction.status !== "approved") return { ...zeroScore };

  const weight = weights.find((item) => item.active && item.interaction_type === weightKey(interaction));
  if (!weight) return { ...zeroScore };

  const raw =
    Number(weight.base_points) +
    Number(weight.points_per_minute) * Number(interaction.duration_minutes || 0) +
    Number(weight.points_per_message) * Number(interaction.message_count || 0) +
    (interaction.initiated_by_person ? Number(weight.initiative_bonus) : 0) +
    (interaction.type === "missed_call_returned" ? Number(weight.returned_call_bonus) : 0);

  const capped = weight.cap_per_event === null ? raw : Math.min(raw, Number(weight.cap_per_event));
  const total = interaction.type === "admin_penalty" ? -Math.abs(capped) : capped;

  return {
    total,
    call: ["call", "missed_call_returned"].includes(interaction.type) ? total : 0,
    text: interaction.type === "text_exchange" ? total : 0,
    initiative: interaction.initiated_by_person ? Number(weight.initiative_bonus) : 0,
    timeTogether: ["fortnite", "visit", "manual_activity"].includes(interaction.type) ? total : 0,
    reliability: interaction.type === "missed_call_returned" ? total : 0,
    bonus: ["birthday_remembered", "life_event", "admin_bonus"].includes(interaction.type) ? Math.max(total, 0) : 0,
    penalty: interaction.type === "admin_penalty" ? total : 0
  };
}

export function dailyCappedInteractions(interactions: Interaction[]) {
  const byPersonDay = new Map<string, Interaction[]>();
  interactions.forEach((interaction) => {
    const day = interaction.started_at.slice(0, 10);
    const key = `${interaction.person_id}:${day}`;
    byPersonDay.set(key, [...(byPersonDay.get(key) || []), interaction]);
  });
  return byPersonDay;
}

export function calculateScores(
  interactions: Interaction[],
  weights: ScoringWeight[],
  period: ScorePeriod
): Score[] {
  const dailyCap = 600;
  const byPerson = new Map<string, Score>();

  for (const [, dayInteractions] of dailyCappedInteractions(interactions)) {
    let dayTotal = 0;
    for (const interaction of dayInteractions) {
      const scored = scoreInteraction(interaction, weights);
      const remaining = Math.max(0, dailyCap - dayTotal);
      const allowedTotal = Math.min(scored.total, remaining);
      dayTotal += allowedTotal;

      const existing = byPerson.get(interaction.person_id) || {
        person_id: interaction.person_id,
        total_score: 0,
        call_score: 0,
        text_score: 0,
        initiative_score: 0,
        time_together_score: 0,
        reliability_score: 0,
        bonus_score: 0,
        penalty_score: 0,
        period,
        calculated_at: new Date().toISOString()
      };

      const ratio = scored.total === 0 ? 0 : allowedTotal / scored.total;
      existing.total_score += allowedTotal;
      existing.call_score += scored.call * ratio;
      existing.text_score += scored.text * ratio;
      existing.initiative_score += scored.initiative * ratio;
      existing.time_together_score += scored.timeTogether * ratio;
      existing.reliability_score += scored.reliability * ratio;
      existing.bonus_score += scored.bonus * ratio;
      existing.penalty_score += scored.penalty * ratio;
      byPerson.set(interaction.person_id, existing);
    }
  }

  return [...byPerson.values()].map((score) => ({
    ...score,
    total_score: Math.round(score.total_score * 10) / 10
  }));
}

export function topCategory(score?: Score) {
  if (!score) return "No scored activity. Tragic.";
  const entries: Array<[string, number]> = [
    ["Calls", score.call_score],
    ["Texts", score.text_score],
    ["Initiative", score.initiative_score],
    ["Time together", score.time_together_score],
    ["Reliability", score.reliability_score],
    ["Bonus", score.bonus_score]
  ];
  return entries.sort((a, b) => b[1] - a[1])[0]?.[0] || "No scored activity. Tragic.";
}

export function scoreMomentumLabel(score?: Score) {
  const total = score?.total_score || 0;
  if (total <= 0) return "Currently a rumor";
  if (total >= 20000) return "Clearly campaigning";
  if (total >= 10000) return "Making a case";
  if (total >= 2500) return "Putting in minutes";

  const category = topCategory(score);
  if (category === "Calls") return "Picking up the phone";
  if (category === "Texts") return "Typing with intent";
  if (category === "Time together") return "Clocking quality time";
  if (category === "Initiative") return "Showing initiative";
  if (category === "Reliability") return "Returning calls, somehow";
  return "On the board";
}
