import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function loginRedirect(requestUrl: URL, message: string) {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, requestUrl.origin));
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const authError = requestUrl.searchParams.get("error_description") || requestUrl.searchParams.get("error");

  if (authError) {
    return loginRedirect(requestUrl, `That sign-in link did not work: ${authError}. Ask for a fresh one and give it the stern little tap it deserves.`);
  }

  if (!code) {
    return loginRedirect(requestUrl, "That sign-in link was missing its code. Ask for a fresh one; this one arrived wearing a tiny fake mustache.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return loginRedirect(requestUrl, `That sign-in link could not be verified: ${error.message}. Ask for a fresh one.`);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
