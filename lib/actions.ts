"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireApprovedUser } from "@/lib/auth";
import { sendApprovalEmail, sendApprovalEmailPreview, sendSignInLinkEmail, sendSignupWelcomeEmail, sendTemporaryPasswordEmail } from "@/lib/email";
import { periods, periodStart } from "@/lib/periods";
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
  email: z.string().email()
});

const adminLoginEmail = "ericschacon@gmail.com";
const adminRecoveryAliases = new Set([adminLoginEmail, "chacon96@icloud.com", "ericchacon@icloud.com"]);

async function getAuthRedirectOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configuredOrigin && !configuredOrigin.includes("localhost") && !configuredOrigin.includes("127.0.0.1")) {
    return configuredOrigin.replace(/\/$/, "");
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "https";
  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${protocol}://${host}`;
  }

  return "https://calltioeric.com";
}

async function uploadProfilePhoto(formData: FormData, personId: string) {
  const file = formData.get("avatar_file");
  if (!(file instanceof File) || file.size === 0) return null;
  const allowedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  if (!allowedPhotoTypes.has(file.type)) {
    throw new Error("Use a JPG, PNG, WebP, or GIF under 5MB. iPhone HEIC photos need to be saved as JPG first.");
  }
  if (file.size > 5 * 1024 * 1024) throw new Error("Profile photo must be under 5MB.");

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Photo upload is not configured yet.");

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${personId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from("profile-photos").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: true
  });
  if (error) throw error;

  const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
  return data.publicUrl;
}

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

async function findAuthUserIdByEmail(email: string) {
  const adminSupabase = createAdminClient();
  if (!adminSupabase) return null;

  const { data, error } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;

  const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  return match?.id || null;
}

async function repairAuthUserTokens(email: string) {
  const adminSupabase = createAdminClient();
  if (!adminSupabase) return;
  const { error } = await adminSupabase.rpc("repair_auth_user_tokens", { target_email: email });
  if (error) console.error("Could not repair auth tokens", error);
}

async function ensureRosterLogin(email: string) {
  const adminSupabase = createAdminClient();
  if (!adminSupabase) return null;

  const { data: person, error: personError } = await adminSupabase
    .from("people")
    .select("id,user_id,name,email,relationship,active")
    .ilike("email", email)
    .order("active", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (personError) throw personError;
  if (!person) return null;

  let userId = person.user_id || (await findAuthUserIdByEmail(email));
  if (!userId) {
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password: randomUUID() + randomUUID(),
      email_confirm: true,
      user_metadata: {
        name: person.name,
        signup_role: person.active ? "family" : "pending"
      }
    });
    if (error) throw error;
    userId = data.user?.id || null;
  }

  if (!userId) return;
  await repairAuthUserTokens(email);

  const role = person.active ? "family" : "pending";
  await adminSupabase.from("profiles").upsert({
    id: userId,
    role,
    display_name: person.name
  });

  if (!person.user_id) {
    await adminSupabase.from("people").update({ user_id: userId }).eq("id", person.id);
  }

  return { ...person, user_id: userId };
}

async function refreshLeaderboardData(paths: string[] = []) {
  const db = createAdminClient() || (await createClient());
  const { data: weightRows, error: weightsError } = await db
    .from("scoring_weights")
    .select("*")
    .order("interaction_type", { ascending: true });
  if (weightsError) throw weightsError;
  const weights = weightRows || [];
  let refreshedRows = 0;

  for (const period of periods) {
    let interactionQuery = db.from("interactions").select("*").order("started_at", { ascending: false });
    const start = periodStart(period.value);
    if (start) interactionQuery = interactionQuery.gte("started_at", start);
    const { data: interactionRows, error: interactionsError } = await interactionQuery;
    if (interactionsError) throw interactionsError;
    const interactions = interactionRows || [];
    const scores = calculateScores(interactions, weights, period.value);
    const { error: deleteError } = await db.from("scores").delete().eq("period", period.value);
    if (deleteError) throw deleteError;

    if (scores.length) {
      const { error } = await db.from("scores").upsert(scores);
      if (error) throw error;
      refreshedRows += scores.length;
    }
  }

  [
    "/dashboard",
    "/leaderboard",
    "/people",
    "/family/me",
    "/family/leaderboard",
    "/admin/approvals",
    "/admin/pending",
    "/admin/weights",
    ...paths
  ].forEach((path) => revalidatePath(path));

  return refreshedRows;
}

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

export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) redirect("/login?error=Enter%20your%20email%20first.%20Bold%20strategy,%20but%20the%20internet%20needs%20a%20destination.");

  let rosterPerson: Awaited<ReturnType<typeof ensureRosterLogin>> = null;
  try {
    rosterPerson = await ensureRosterLogin(email);
  } catch (loginRepairError) {
    console.error("Could not prepare passwordless login", loginRepairError);
  }

  if (rosterPerson && !rosterPerson.active) {
    redirect(`/login?error=${encodeURIComponent("You are on the roster, but still pending Eric approval. Very exclusive. Very municipal.")}`);
  }

  const adminSupabase = createAdminClient();
  if (adminSupabase && rosterPerson?.active) {
    const origin = await getAuthRedirectOrigin();
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`
      }
    });

    if (!error && data.properties?.action_link) {
      try {
        await sendSignInLinkEmail({
          to: email,
          name: rosterPerson.name,
          relationship: rosterPerson.relationship,
          link: data.properties.action_link
        });
      } catch (emailError) {
        console.error("Custom magic link email failed", emailError);
        redirect(`/login?error=${encodeURIComponent("I made the sign-in link, but the email sender fumbled it. Eric has been emotionally notified.")}`);
      }
      redirect(`/login?message=${encodeURIComponent("Sign-in link sent. Check your email and tap the button like the chosen one.")}`);
    }

    if (error) {
      console.error("Admin magic link generation failed", error);
      redirect(`/login?error=${encodeURIComponent(`That email is approved, but I could not make the sign-in link yet: ${error.message}`)}`);
    }
  }

  const origin = await getAuthRedirectOrigin();
  await repairAuthUserTokens(email);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`
    }
  });
  if (error) {
    const lowered = error.message.toLowerCase();
    const message =
      lowered.includes("signups not allowed") || lowered.includes("database error finding user")
        ? "That email is not ready for sign-in yet. Join the roster first, then Eric can approve you for the leaderboard."
        : error.message;
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  redirect(`/login?message=${encodeURIComponent("Sign-in link sent. Check your email and tap the button like the chosen one.")}`);
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
      password: randomUUID() + randomUUID(),
      email_confirm: true,
      user_metadata: signupMetadata
    });

    let userId = data.user?.id || null;
    if (error) {
      userId = await findAuthUserIdByEmail(parsed.email);
      if (!userId) redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }

    if (!userId) redirect(`/signup?error=${encodeURIComponent("Could not create roster account")}`);
    await repairAuthUserTokens(parsed.email);

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

    let { data: person } = await adminSupabase.from("people").select("id").eq("user_id", userId).maybeSingle();
    if (!person) {
      const { data: emailPerson } = await adminSupabase
        .from("people")
        .select("id")
        .eq("email", parsed.email.toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      person = emailPerson;
    }
    if (person?.id) {
      try {
        const avatarUrl = await uploadProfilePhoto(formData, person.id);
        if (avatarUrl) {
          const { error: photoError } = await adminSupabase.from("people").update({ avatar_url: avatarUrl }).eq("id", person.id);
          if (photoError) throw photoError;
        }
      } catch (photoError) {
        console.error("Signup profile photo upload failed", photoError);
      }
    }
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

  try {
    await refreshLeaderboardData(["/pending"]);
  } catch (scoreError) {
    console.error("Signup data refresh failed", scoreError);
  }

  redirect("/pending");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) redirect("/forgot-password?error=Enter%20your%20email%20first.%20The%20app%20is%20dramatic,%20not%20psychic.");

  const normalizedEmail = email.toLowerCase();
  const adminSupabase = createAdminClient();
  if (adminSupabase) {
    const lookupEmail = adminRecoveryAliases.has(normalizedEmail) ? adminLoginEmail : email;
    const userId = await findAuthUserIdByEmail(lookupEmail);
    if (userId) {
      const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      if (profile?.role === "admin") {
        const temporaryPassword = `Eric-${randomUUID().replaceAll("-", "").slice(0, 16)}`;
        const { error: updateError } = await adminSupabase.auth.admin.updateUserById(userId, {
          password: temporaryPassword
        });
        if (updateError) redirect(`/forgot-password?error=${encodeURIComponent(updateError.message)}`);

        try {
          await sendTemporaryPasswordEmail({ to: email, loginEmail: lookupEmail, temporaryPassword });
        } catch (emailError) {
          console.error("Temporary password email failed", emailError);
          redirect("/forgot-password?error=I%20made%20a%20temporary%20password,%20but%20the%20email%20did%20not%20send.%20Rude%20of%20the%20internet.");
        }

        redirect(`/forgot-password?sent=${encodeURIComponent(email)}`);
      }
    }
  }

  redirect(
    `/forgot-password?error=${encodeURIComponent(
      "That email is not set up as the admin account. Family members do not need password recovery; they use the email sign-in link on the login page."
    )}`
  );
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");
  if (password.length < 8) redirect("/reset-password?error=Password%20needs%20at%20least%208%20characters.");
  if (password !== confirmPassword) redirect("/reset-password?error=Passwords%20do%20not%20match.%20A%20classic%20tiny%20betrayal.");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);

  await supabase.auth.signOut();
  redirect("/login?message=Password%20updated.%20You%20may%20now%20re-enter%20the%20arena.");
}

export async function savePerson(formData: FormData) {
  await requireAdmin();
  const parsed = personSchema.parse(Object.fromEntries(formData));
  const supabase = await createClient();
  let avatarUrl = parsed.avatar_url || null;
  if (parsed.id) {
    try {
      avatarUrl = (await uploadProfilePhoto(formData, parsed.id)) || avatarUrl;
    } catch (photoError) {
      const message = photoError instanceof Error ? photoError.message : "Profile photo did not upload.";
      redirect(`/people/${parsed.id}?error=${encodeURIComponent(message)}`);
    }
  }

  const payload = {
    ...parsed,
    birthday: parsed.birthday || null,
    email: parsed.email || null,
    phone: parsed.phone || null,
    avatar_url: avatarUrl,
    active: formData.get("active") === "on"
  };

  if (parsed.id) {
    const { error } = await supabase.from("people").update(payload).eq("id", parsed.id);
    if (error) redirect(`/people/${parsed.id}?error=${encodeURIComponent(error.message)}`);
  } else {
    const { data, error } = await supabase.from("people").insert(payload).select("id").single();
    if (error) throw error;
    try {
      const avatarUrl = await uploadProfilePhoto(formData, data.id);
      if (avatarUrl) {
        const { error: photoError } = await supabase.from("people").update({ avatar_url: avatarUrl }).eq("id", data.id);
        if (photoError) throw photoError;
      }
    } catch (photoError) {
      const message = photoError instanceof Error ? photoError.message : "Profile photo did not upload.";
      redirect(`/people/${data.id}?error=${encodeURIComponent(message)}`);
    }
  }
  revalidatePath("/people");
  redirect("/people");
}

export async function updateMyProfilePhoto(formData: FormData) {
  const user = await requireApprovedUser();
  const personId = String(formData.get("person_id") || "");
  if (!personId) throw new Error("Missing person id");

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const personQuery = supabase.from("people").select("id,user_id").eq("id", personId);
  if (profile?.role !== "admin") personQuery.eq("user_id", user.id);
  const { data: person, error: personError } = await personQuery.maybeSingle();
  if (personError) throw personError;
  if (!person) throw new Error("You can only update your own leaderboard mugshot.");

  let avatarUrl: string | null = null;
  try {
    avatarUrl = await uploadProfilePhoto(formData, person.id);
  } catch (photoError) {
    const message = photoError instanceof Error ? photoError.message : "Profile photo did not upload.";
    redirect(`/family/me?error=${encodeURIComponent(message)}`);
  }
  if (!avatarUrl) redirect("/family/me?error=Choose%20a%20photo%20first.");

  const { error } = await supabase.from("people").update({ avatar_url: avatarUrl }).eq("id", person.id);
  if (error) redirect(`/family/me?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/people/${person.id}`);
  revalidatePath("/people");
  revalidatePath("/family/me");
  redirect("/family/me?photo=1");
}

export async function deletePerson(formData: FormData) {
  await requireAdmin();
  const personId = String(formData.get("person_id") || "");
  if (!personId) throw new Error("Missing person id");

  const fallbackSupabase = await createClient();
  const adminSupabase = createAdminClient();
  const db = adminSupabase || fallbackSupabase;

  const { data: person, error: personError } = await db
    .from("people")
    .select("id,user_id,name")
    .eq("id", personId)
    .maybeSingle();
  if (personError) redirect(`/people?error=${encodeURIComponent(personError.message)}`);
  if (!person) redirect("/people");

  if (person.user_id) {
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("role")
      .eq("id", person.user_id)
      .maybeSingle();
    if (profileError) redirect(`/people?error=${encodeURIComponent(profileError.message)}`);
    if (profile?.role === "admin") {
      redirect("/people?error=Admin%20profiles%20cannot%20be%20removed%20from%20the%20roster.");
    }
  }

  const { error } = await db.from("people").delete().eq("id", personId);
  if (error) redirect(`/people?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/people");
  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  revalidatePath("/admin/approvals");
  redirect(`/people?removed=${encodeURIComponent(person.name)}`);
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
  if (isAdmin) {
    await refreshLeaderboardData(["/submissions"]);
  } else {
    revalidatePath("/submissions");
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/pending");
  }
  redirect(isAdmin ? "/leaderboard" : "/submissions");
}

export async function approveFamilyMember(formData: FormData) {
  await requireAdmin();
  const personId = String(formData.get("person_id"));
  const userId = String(formData.get("user_id"));
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const db = adminSupabase || supabase;
  const { data: person, error: personError } = await db
    .from("people")
    .select("name,email,relationship,user_id")
    .eq("id", personId)
    .maybeSingle();
  if (personError) redirect(`/admin/approvals?error=${encodeURIComponent(personError.message)}`);
  if (!person) redirect("/admin/approvals?error=That%20roster%20request%20already%20left%20the%20building.");

  let approvedUserId = userId || person?.user_id || "";

  if (!approvedUserId && person?.email && adminSupabase) {
    approvedUserId = (await findAuthUserIdByEmail(person.email)) || "";
    if (!approvedUserId) {
      const { data: createdUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
        email: person.email,
        password: randomUUID() + randomUUID(),
        email_confirm: true,
        user_metadata: {
          name: person.name,
          signup_role: "family"
        }
      });
      if (createUserError) {
        approvedUserId = (await findAuthUserIdByEmail(person.email)) || "";
        if (!approvedUserId) redirect(`/admin/approvals?error=${encodeURIComponent(createUserError.message)}`);
      } else {
        approvedUserId = createdUser.user?.id || "";
      }
    }
  }

  if (approvedUserId) {
    const { error: profileError } = await db.from("profiles").upsert({
      id: approvedUserId,
      role: "family",
      display_name: person?.name || person?.email || "Family"
    });
    if (profileError) redirect(`/admin/approvals?error=${encodeURIComponent(profileError.message)}`);
  }

  const updatePayload: { active: boolean; user_id?: string } = { active: true };
  if (approvedUserId) updatePayload.user_id = approvedUserId;
  const { error } = await db.from("people").update(updatePayload).eq("id", personId);
  if (error) redirect(`/admin/approvals?error=${encodeURIComponent(error.message)}`);
  if (person?.email) {
    try {
      await sendApprovalEmail({ to: person.email, name: person.name, relationship: person.relationship });
    } catch (emailError) {
      console.error("Approval email failed", emailError);
    }
  }
  try {
    await refreshLeaderboardData([`/people/${personId}`]);
  } catch (scoreError) {
    console.error("Approval score refresh failed", scoreError);
  }
  redirect(`/admin/approvals?approved=${encodeURIComponent(person?.name || "Family member")}`);
}

export async function setInteractionStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ApprovalStatus;
  if (!["approved", "denied", "pending"].includes(status)) throw new Error("Invalid status");
  const supabase = await createClient();
  const { error } = await supabase.from("interactions").update({ status }).eq("id", id);
  if (error) throw error;
  await refreshLeaderboardData(["/submissions"]);
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
  const refreshedRows = await refreshLeaderboardData();
  redirect(`/admin/weights?recalculated=1&rows=${refreshedRows}&at=${Date.now()}`);
}

export async function sendTestApprovalEmail(formData: FormData) {
  await requireAdmin();
  const to = String(formData.get("to") || "").trim();
  const name = String(formData.get("name") || "Zander").trim();
  const relationship = String(formData.get("relationship") || "nephew").trim();
  const variantId = String(formData.get("variant_id") || "0");

  if (!to) redirect("/admin/email-previews?error=Add%20the%20email%20address%20first.%20Even%20a%20joke%20needs%20a%20recipient.");

  try {
    await sendApprovalEmailPreview({ to, name, relationship, variantId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email did not send.";
    redirect(`/admin/email-previews?error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/email-previews?sent=${encodeURIComponent(to)}&variant=${encodeURIComponent(variantId)}`);
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
