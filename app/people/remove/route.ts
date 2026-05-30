import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

function wantsJson(request: NextRequest) {
  return request.headers.get("accept")?.includes("application/json") || request.headers.get("x-requested-with") === "fetch";
}

function jsonOrRedirect(request: NextRequest, path: string, key: "removed" | "error", message: string) {
  const url = new URL(path, request.url);
  url.searchParams.set(key, message);

  if (wantsJson(request)) {
    return NextResponse.json({
      ok: key === "removed",
      redirectTo: `${url.pathname}${url.search}`,
      message
    });
  }

  return NextResponse.redirect(url, { status: 303 });
}

function redirectWithMessage(request: NextRequest, path: string, key: "removed" | "error", message: string) {
  return jsonOrRedirect(request, path, key, message);
}

async function removePerson(request: NextRequest, personId: string, returnTo: string) {
  if (!personId) {
    return redirectWithMessage(request, returnTo, "error", "Missing person id.");
  }

  const sessionSupabase = await createClient();
  const { data: authData } = await sessionSupabase.auth.getUser();
  const user = authData.user;
  if (!user) {
    if (wantsJson(request)) {
      return NextResponse.json({ ok: false, redirectTo: "/login", message: "Please sign in again." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  }

  const adminSupabase = createAdminClient();
  const db = adminSupabase || sessionSupabase;
  const { data: adminProfile } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (adminProfile?.role !== "admin") {
    if (wantsJson(request)) {
      return NextResponse.json({ ok: false, redirectTo: "/dashboard", message: "Only Eric can remove people from the roster." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
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

export async function GET(request: NextRequest) {
  const personId = request.nextUrl.searchParams.get("person_id") || "";
  const returnTo = request.nextUrl.searchParams.get("return_to") || "/people";
  return removePerson(request, personId, returnTo);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const personId = String(formData.get("person_id") || "");
  const returnTo = String(formData.get("return_to") || "/people");
  return removePerson(request, personId, returnTo);
}
