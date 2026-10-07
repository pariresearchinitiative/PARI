import { NextResponse } from "next/server";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!hasSupabaseAdmin()) return NextResponse.json({ error: "Database is not configured yet" }, { status: 503 });
    const db = supabaseAdmin();
    const { error } = await db.from("newsletter_subscribers").upsert({ email: email.trim().toLowerCase() }, { onConflict: "email" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Subscribe failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
