import { createClient } from "@/lib/supabase/server";
import { periodStart } from "@/lib/periods";
import { calculateScores, topCategory } from "@/lib/scoring";
import type { Interaction, Person, PersonWithScore, Score, ScorePeriod, ScoringWeight } from "@/lib/types";

export async function getPeople() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data || []) as Person[];
}

export async function getPerson(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("people").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Person | null;
}

export async function getInteractions(period?: ScorePeriod) {
  const supabase = await createClient();
  let query = supabase.from("interactions").select("*").order("started_at", { ascending: false });
  const start = period ? periodStart(period) : null;
  if (start) query = query.gte("started_at", start);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Interaction[];
}

export async function getPersonInteractions(personId: string, period?: ScorePeriod) {
  const supabase = await createClient();
  let query = supabase
    .from("interactions")
    .select("*")
    .eq("person_id", personId)
    .order("started_at", { ascending: false });

  const start = period ? periodStart(period) : null;
  if (start) query = query.gte("started_at", start);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Interaction[];
}

export type PersonYearlyBreakdown = {
  year: number;
  totalScore: number;
  callScore: number;
  textScore: number;
  interactionCount: number;
  approvedInteractionCount: number;
  pendingInteractionCount: number;
  callCount: number;
  textExchangeCount: number;
  qualityTimeMinutes: number;
  totalMinutes: number;
  messageCount: number;
  topCategory: string;
};

export async function getPersonYearlyBreakdowns(personId: string): Promise<PersonYearlyBreakdown[]> {
  const [interactions, weights] = await Promise.all([getPersonInteractions(personId), getScoringWeights()]);
  const years = [...new Set(interactions.map((interaction) => new Date(interaction.started_at).getFullYear()))].sort((a, b) => b - a);

  return years.map((year) => {
    const yearInteractions = interactions.filter((interaction) => new Date(interaction.started_at).getFullYear() === year);
    const score = calculateScores(yearInteractions, weights, "year")[0];
    const qualityTimeMinutes = yearInteractions
      .filter((interaction) => ["fortnite", "visit", "manual_activity"].includes(interaction.type))
      .reduce((sum, interaction) => sum + Number(interaction.duration_minutes || 0), 0);

    return {
      year,
      totalScore: score?.total_score || 0,
      callScore: score?.call_score || 0,
      textScore: score?.text_score || 0,
      interactionCount: yearInteractions.length,
      approvedInteractionCount: yearInteractions.filter((interaction) => interaction.status === "approved").length,
      pendingInteractionCount: yearInteractions.filter((interaction) => interaction.status === "pending").length,
      callCount: yearInteractions.filter((interaction) => ["call", "missed_call_returned"].includes(interaction.type)).length,
      textExchangeCount: yearInteractions.filter((interaction) => interaction.type === "text_exchange").length,
      qualityTimeMinutes,
      totalMinutes: yearInteractions.reduce((sum, interaction) => sum + Number(interaction.duration_minutes || 0), 0),
      messageCount: yearInteractions.reduce((sum, interaction) => sum + Number(interaction.message_count || 0), 0),
      topCategory: topCategory(score)
    };
  });
}

export async function getScoringWeights() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scoring_weights")
    .select("*")
    .order("interaction_type", { ascending: true });
  if (error) throw error;
  return (data || []) as ScoringWeight[];
}

export async function getScores(period: ScorePeriod) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("scores").select("*").eq("period", period);
  if (error) throw error;
  return (data || []) as Score[];
}

export async function getLeaderboard(period: ScorePeriod): Promise<PersonWithScore[]> {
  const [people, scores] = await Promise.all([getPeople(), getScores(period)]);
  const scoreMap = new Map(scores.map((score) => [score.person_id, score]));
  return people
    .filter((person) => person.active)
    .map((person) => {
      const score = scoreMap.get(person.id);
      return {
        ...person,
        score,
        topCategory: topCategory(score),
        trend: "flat" as const
      };
    })
    .sort((a, b) => (b.score?.total_score || 0) - (a.score?.total_score || 0));
}

export async function getPendingInteractions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interactions")
    .select("*, people(name, relationship)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getPendingPeople() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("active", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as Person[];
}

export type PendingWeeklyStat = Person & {
  interactionCount: number;
  pendingInteractionCount: number;
  approvedInteractionCount: number;
  importedInteractionCount: number;
  manualInteractionCount: number;
  callCount: number;
  textExchangeCount: number;
  qualityTimeMinutes: number;
  totalMinutes: number;
  messageCount: number;
  projectedScore: number;
  projectedShare: number;
  topCategory: string;
  latestInteractionAt: string | null;
};

export async function getPendingWeeklyStats(): Promise<PendingWeeklyStat[]> {
  const [pendingPeople, weights] = await Promise.all([getPendingPeople(), getScoringWeights()]);
  if (!pendingPeople.length) return [];

  const supabase = await createClient();
  const start = periodStart("week");
  let query = supabase
    .from("interactions")
    .select("*")
    .in(
      "person_id",
      pendingPeople.map((person) => person.id)
    )
    .neq("status", "denied")
    .order("started_at", { ascending: false });

  if (start) query = query.gte("started_at", start);

  const { data, error } = await query;
  if (error) throw error;

  const interactions = (data || []) as Interaction[];
  const provisionalInteractions = interactions.map((interaction) => ({
    ...interaction,
    status: "approved" as const
  }));
  const scoreMap = new Map(calculateScores(provisionalInteractions, weights, "week").map((score) => [score.person_id, score]));
  const totalProjected = [...scoreMap.values()].reduce((sum, score) => sum + score.total_score, 0);

  return pendingPeople
    .map((person) => {
      const personInteractions = interactions.filter((interaction) => interaction.person_id === person.id);
      const score = scoreMap.get(person.id);
      const qualityTimeMinutes = personInteractions
        .filter((interaction) => ["fortnite", "visit", "manual_activity"].includes(interaction.type))
        .reduce((sum, interaction) => sum + Number(interaction.duration_minutes || 0), 0);

      return {
        ...person,
        interactionCount: personInteractions.length,
        pendingInteractionCount: personInteractions.filter((interaction) => interaction.status === "pending").length,
        approvedInteractionCount: personInteractions.filter((interaction) => interaction.status === "approved").length,
        importedInteractionCount: personInteractions.filter((interaction) => interaction.source === "import").length,
        manualInteractionCount: personInteractions.filter((interaction) => interaction.source === "manual").length,
        callCount: personInteractions.filter((interaction) => ["call", "missed_call_returned"].includes(interaction.type)).length,
        textExchangeCount: personInteractions.filter((interaction) => interaction.type === "text_exchange").length,
        qualityTimeMinutes,
        totalMinutes: personInteractions.reduce((sum, interaction) => sum + Number(interaction.duration_minutes || 0), 0),
        messageCount: personInteractions.reduce((sum, interaction) => sum + Number(interaction.message_count || 0), 0),
        projectedScore: score?.total_score || 0,
        projectedShare: totalProjected ? ((score?.total_score || 0) / totalProjected) * 100 : 0,
        topCategory: topCategory(score),
        latestInteractionAt: personInteractions[0]?.started_at || null
      };
    })
    .sort((a, b) => b.projectedScore - a.projectedScore || b.interactionCount - a.interactionCount);
}

export async function getAppSettings(): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("app_settings").select("*");
  if (error) throw error;
  return Object.fromEntries((data || []).map((row: { key: string; value: unknown }) => [row.key, row.value]));
}
