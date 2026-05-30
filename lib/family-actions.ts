"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { familyAccessCookie, identifiersMatch, requireFamilyAccessPerson } from "@/lib/family-access";
import { createAdminClient } from "@/lib/supabase/server";
import type { InteractionType } from "@/lib/types";

export async function familyQuickAccess(formData: FormData) {
  const identifier = String(formData.get("identifier") || "").trim();
  if (!identifier) redirect("/login?error=Email%20or%20phone%20first.%20The%20leaderboard%20is%20petty,%20not%20clairvoyant.");

  const supabase = createAdminClient();
  if (!supabase) {
    redirect("/login?error=Family%20access%20is%20not%20configured%20yet.%20Eric%20has%20one%20job,%20apparently.");
  }

  const { data, error } = await supabase.from("people").select("*").eq("active", true);
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  const person = (data || []).find((candidate) => identifiersMatch(identifier, candidate));
  if (!person) {
    redirect(`/login?error=${encodeURIComponent("That email or phone is not approved yet. Join the roster first, then Eric can let the judging begin.")}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(familyAccessCookie, person.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  redirect("/family/me");
}

export async function familySignOut() {
  const cookieStore = await cookies();
  cookieStore.delete(familyAccessCookie);
  redirect("/login");
}

export async function submitFamilyActivity(formData: FormData) {
  const person = await requireFamilyAccessPerson();
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Family activity submission is not configured yet.");

  const type = String(formData.get("type") || "manual_activity") as InteractionType;
  const startedAt = String(formData.get("started_at") || "");
  const durationMinutes = Number(formData.get("duration_minutes") || 0);
  const notes = String(formData.get("notes") || "").trim();

  if (!startedAt) redirect("/family/me?error=Pick%20when%20this%20alleged%20quality%20time%20happened.");
  if (durationMinutes < 0) redirect("/family/me?error=Negative%20minutes%20is%20emotionally%20bold,%20but%20mathematically%20illegal.");

  const { error } = await supabase.from("interactions").insert({
    person_id: person.id,
    type,
    direction: "mutual",
    initiated_by_person: true,
    started_at: startedAt,
    ended_at: null,
    duration_minutes: durationMinutes,
    message_count: 0,
    is_group_chat: false,
    source: "manual",
    status: "pending",
    notes: notes || null,
    created_by: null
  });
  if (error) throw error;

  revalidatePath("/family/me");
  revalidatePath("/admin/approvals");
  redirect("/family/me?submitted=1");
}
