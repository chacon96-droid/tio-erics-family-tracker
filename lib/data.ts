import { createClient } from "@/lib/supabase/server";
import { periodStart } from "@/lib/periods";
import { topCategory } from "@/lib/scoring";
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

export async function getPersonInteractions(personId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("person_id", personId)
    .order("started_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Interaction[];
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

export async function getAppSettings(): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("app_settings").select("*");
  if (error) throw error;
  return Object.fromEntries((data || []).map((row: { key: string; value: unknown }) => [row.key, row.value]));
}
