import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { calculateScores, topCategory } from "@/lib/scoring";
import { createAdminClient } from "@/lib/supabase/server";
import type { Interaction, Person, PersonWithScore, Score, ScoringWeight } from "@/lib/types";

export const familyAccessCookie = "eric_family_person_id";

export function normalizePhone(value: string | null | undefined) {
  return String(value || "").replace(/\D/g, "");
}

export function identifiersMatch(input: string, person: Pick<Person, "email" | "phone">) {
  const normalizedInput = input.trim().toLowerCase();
  const inputPhone = normalizePhone(normalizedInput);
  const emailMatches = person.email?.toLowerCase() === normalizedInput;
  const phoneMatches = inputPhone.length >= 7 && normalizePhone(person.phone).endsWith(inputPhone.slice(-10));
  return Boolean(emailMatches || phoneMatches);
}

export async function getFamilyAccessPerson() {
  const cookieStore = await cookies();
  const personId = cookieStore.get(familyAccessCookie)?.value;
  if (!personId) return null;

  const supabase = createAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("people").select("*").eq("id", personId).eq("active", true).maybeSingle();
  if (error) throw error;
  return data as Person | null;
}

export async function requireFamilyAccessPerson() {
  const person = await getFamilyAccessPerson();
  if (!person) redirect("/login");
  return person;
}

export async function getFamilyPersonInteractions(personId: string) {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("person_id", personId)
    .order("started_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Interaction[];
}

export async function getFamilyScoringWeights() {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("scoring_weights").select("*").order("interaction_type", { ascending: true });
  if (error) throw error;
  return (data || []) as ScoringWeight[];
}

export async function getFamilyYearlyBreakdowns(personId: string) {
  const [interactions, weights] = await Promise.all([getFamilyPersonInteractions(personId), getFamilyScoringWeights()]);
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
      timeTogetherScore: score?.time_together_score || 0,
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

export async function getFamilyLeaderboard(period: "week" | "month" | "year" | "all_time") {
  const supabase = createAdminClient();
  if (!supabase) return [];

  const [{ data: people, error: peopleError }, { data: scores, error: scoresError }] = await Promise.all([
    supabase.from("people").select("*").eq("active", true).order("name", { ascending: true }),
    supabase.from("scores").select("*").eq("period", period)
  ]);
  if (peopleError) throw peopleError;
  if (scoresError) throw scoresError;

  const scoreMap = new Map((scores || []).map((score) => [score.person_id, score as Score]));
  return ((people || []) as Person[])
    .map((person): PersonWithScore => {
      const score = scoreMap.get(person.id);
      return {
        ...person,
        score,
        topCategory: topCategory(score),
        trend: "flat"
      };
    })
    .sort((a, b) => (b.score?.total_score || 0) - (a.score?.total_score || 0));
}
