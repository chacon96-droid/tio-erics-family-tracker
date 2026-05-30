import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

function redirectWithMessage(request: NextRequest, path: string, key: "removed" | "error", message: string) {
  const url = new URL(path, request.url);
  url.searchParams.set(key, message);
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const personId = String(formData.get("person_id") || "");
  const returnTo = String(formData.get("return_to") || "/people");

  if (!personId) {
    return redirectWithMessage(request, returnTo, "error", "Missing person id.");
  }

  const sessionSupabase = await createClient();
  const { data: authData } = await sessionSupabase.auth.getUser();
  const user = authData.user;
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const adminSupabase = createAdminClient();
  const db = adminSupabase || sessionSupabase;
  const { data: adminProfile } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (adminProfile?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const { data: person, error: personError } = await db
    .from("people")
    .select("id,user_id,name")
    .eq("id", personId)
    .maybeSingle();
  if (personError) {
    return redirectWithMessage(request, returnTo, "error", personError.message);
  }
  if (!person) {
    return redirectWithMessage(request, returnTo, "error", "That profile already left the roster.");
  }

  if (person.user_id) {
    const { data: linkedProfile, error: linkedProfileError } = await db
      .from("profiles")
      .select("role")
      .eq("id", person.user_id)
      .maybeSingle();
    if (linkedProfileError) {
      return redirectWithMessage(request, returnTo, "error", linkedProfileError.message);
    }
    if (linkedProfile?.role === "admin") {
      return redirectWithMessage(request, returnTo, "error", "Admin profiles cannot be removed from the roster.");
    }
  }

  const { error } = await db.from("people").delete().eq("id", personId);
  if (error) {
    return redirectWithMessage(request, returnTo, "error", error.message);
  }

  return redirectWithMessage(request, returnTo, "removed", person.name);
}
