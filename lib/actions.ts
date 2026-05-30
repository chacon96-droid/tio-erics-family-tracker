"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireApprovedUser } from "@/lib/auth";
import { getInteractions, getScoringWeights } from "@/lib/data";
import { sendApprovalEmail, sendSignupWelcomeEmail } from "@/lib/email";
import { periods } from "@/lib/periods";
import { calculateScores } from "@/lib/scoring";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { ApprovalStatus, InteractionDirection, InteractionSource, InteractionType } from "@/lib/types";

const personSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  relationship: z.string().min(1),
  birthday: z.string().optional().nullable(),
  age_bracket: z.enum(["kid", "teen", "adult", "unknown"]).default("unknown"),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  avatar_url: z.string().url().optional().or(z.literal("")).nullable()
});

const signupSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().min(1),
  birthday: z.string().optional().nullable(),
  age_bracket: z.enum(["kid", "teen", "adult", "unknown"]).default("unknown"),
  phone: z.string().optional().nullable(),
  email: z.string().email(),
  password: z.string().min(8)
});

const interactionSchema = z.object({
  person_id: z.string().uuid(),
  type: z.string().min(1),
  direction: z.enum(["inbound", "outbound", "mutual"]),
  initiated_by_person: z.coerce.boolean().default(false),
  started_at: z.string().min(1),
  ended_at: z.string().optional().nullable(),
  duration_minutes: z.coerce.number().min(0).default(0),
  message_count: z.coerce.number().int().min(0).default(0),
  is_group_chat: z.coerce.boolean().default(false),
  notes: z.string().optional().nullable()
});

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  const { data: profile } = await supabase.from("profiles").select("role").maybeSingle();
  if (profile?.role === "pending") redirect("/pending");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const parsed = signupSchema.parse(Object.fromEntries(formData));
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const signupMetadata = {
    name: parsed.name,
    signup_role: "pending"
  };
  if (adminSupabase) {
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: parsed.email,
      password: parsed.password,
      email_confirm: true,
      user_metadata: signupMetadata
    });
    if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);

    const userId = data.user?.id;
    if (!userId) redirect(`/signup?error=${encodeURIComponent("Could not create roster account")}`);

    const { error: personError } = await adminSupabase.rpc("create_pending_person", {
      target_user_id: userId,
      person_name: parsed.name,
      person_relationship: parsed.relationship,
      person_birthday: parsed.birthday || null,
      person_age_bracket: parsed.age_bracket,
      person_phone: parsed.phone || null,
      person_email: parsed.email
    });
    if (personError) redirect(`/signup?error=${encodeURIComponent(personError.message)}`);
  } else {
    const { error: personError } = await supabase.rpc("create_public_roster_request", {
      person_name: parsed.name,
      person_relationship: parsed.relationship,
      person_birthday: parsed.birthday || null,
      person_age_bracket: parsed.age_bracket,
      person_phone: parsed.phone || null,
      person_email: parsed.email
    });
    if (personError) redirect(`/signup?error=${encodeURIComponent(personError.message)}`);
  }

  try {
    await sendSignupWelcomeEmail({ to: parsed.email, name: parsed.name, relationship: parsed.relationship });
  } catch (emailError) {
    console.error("Signup welcome email failed", emailError);
  }

  redirect("/pending");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function savePerson(formData: FormData) {
  await requireAdmin();
  const parsed = personSchema.parse(Object.fromEntries(formData));
  const supabase = await createClient();
  const payload = {
    ...parsed,
    birthday: parsed.birthday || null,
    email: parsed.email || null,
    phone: parsed.phone || null,
    avatar_url: parsed.avatar_url || null,
    active: formData.get("active") === "on"
  };

  if (parsed.id) {
    const { error } = await supabase.from("people").update(payload).eq("id", parsed.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("people").insert(payload);
    if (error) throw error;
  }
  revalidatePath("/people");
  redirect("/people");
}

export async function deletePerson(formData: FormData) {
  await requireAdmin();
  const personId = String(formData.get("person_id") || "");
  if (!personId) throw new Error("Missing person id");

  const supabase = await createClient();
  const { data: person, error: personError } = await supabase
    .from("people")
    .select("id,user_id,name")
    .eq("id", personId)
    .maybeSingle();
  if (personError) throw personError;
  if (!person) redirect("/people");

  if (person.user_id) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", person.user_id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role === "admin") {
      throw new Error("Admin profiles cannot be removed from the roster.");
    }
  }

  const { error } = await supabase.from("people").delete().eq("id", personId);
  if (error) throw error;

  if (person.user_id) {
    const adminSupabase = createAdminClient();
    if (adminSupabase) {
      const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(person.user_id);
      if (deleteUserError) throw deleteUserError;
    } else {
      const { error: profileUpdateError } = await supabase.from("profiles").update({ role: "pending" }).eq("id", person.user_id);
      if (profileUpdateError) throw profileUpdateError;
    }
  }

  revalidatePath("/people");
  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  revalidatePath("/admin/approvals");
  redirect("/people");
}

export async function createInteraction(formData: FormData) {
  const user = await requireApprovedUser();
  const supabase = await createClient();
  const parsed = interactionSchema.parse(Object.fromEntries(formData));

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = profile?.role === "admin";
  const payload = {
    ...parsed,
    type: parsed.type as InteractionType,
    direction: parsed.direction as InteractionDirection,
    source: (isAdmin ? "admin" : "manual") as InteractionSource,
    status: (isAdmin ? "approved" : "pending") as ApprovalStatus,
    created_by: user.id,
    ended_at: parsed.ended_at || null,
    notes: parsed.notes || null
  };

  const { error } = await supabase.from("interactions").insert(payload);
  if (error) throw error;
  revalidatePath("/submissions");
  redirect(isAdmin ? "/leaderboard" : "/submissions");
}

export async function approveFamilyMember(formData: FormData) {
  await requireAdmin();
  const personId = String(formData.get("person_id"));
  const userId = String(formData.get("user_id"));
  const supabase = await createClient();
  const { data: person } = await supabase.from("people").select("name,email,relationship").eq("id", personId).maybeSingle();
  if (userId) {
    const { error: profileError } = await supabase.from("profiles").update({ role: "family" }).eq("id", userId);
    if (profileError) throw profileError;
  }
  const { error } = await supabase.from("people").update({ active: true }).eq("id", personId);
  if (error) throw error;
  if (person?.email) {
    try {
      await sendApprovalEmail({ to: person.email, name: person.name, relationship: person.relationship });
    } catch (emailError) {
      console.error("Approval email failed", emailError);
    }
  }
  revalidatePath("/people");
  revalidatePath("/admin/approvals");
}

export async function setInteractionStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ApprovalStatus;
  if (!["approved", "denied", "pending"].includes(status)) throw new Error("Invalid status");
  const supabase = await createClient();
  const { error } = await supabase.from("interactions").update({ status }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/approvals");
  revalidatePath("/submissions");
}

export async function updateWeight(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const payload = {
    base_points: Number(formData.get("base_points") || 0),
    points_per_minute: Number(formData.get("points_per_minute") || 0),
    points_per_message: Number(formData.get("points_per_message") || 0),
    cap_per_event: formData.get("cap_per_event") ? Number(formData.get("cap_per_event")) : null,
    initiative_bonus: Number(formData.get("initiative_bonus") || 0),
    returned_call_bonus: Number(formData.get("returned_call_bonus") || 0),
    active: formData.get("active") === "on"
  };
  const { error } = await supabase.from("scoring_weights").update(payload).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/weights");
}

export async function recalculateScores() {
  await requireAdmin();
  const supabase = await createClient();
  const weights = await getScoringWeights();

  for (const period of periods) {
    const interactions = await getInteractions(period.value);
    const scores = calculateScores(interactions, weights, period.value);
    await supabase.from("scores").delete().eq("period", period.value);
    if (scores.length) {
      const { error } = await supabase.from("scores").upsert(scores);
      if (error) throw error;
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath("/people");
}

export async function updateSetting(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const key = String(formData.get("key"));
  const value = formData.get("value") === "on";
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
  revalidatePath("/admin/settings");
}
