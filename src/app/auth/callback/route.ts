
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");

  const next =
    requestedNext?.startsWith("/") &&
    !requestedNext.startsWith("//")
      ? requestedNext
      : "/reset-password";

  if (!code) {
    return NextResponse.redirect(
      new URL("/reset-password?error=missing_code", url.origin)
    );
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/reset-password?error=callback_failed", url.origin)
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
