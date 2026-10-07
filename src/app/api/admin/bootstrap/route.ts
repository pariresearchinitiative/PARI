import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anon) return NextResponse.json({ error: "Auth is not configured" }, { status: 500 });

  const { createServerSupabase } = await import("@/lib/supabase-server");
  const supabase = createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!adminEmail || user.email.toLowerCase() !== adminEmail) {
    return NextResponse.json({ ok: true, role: "viewer" });
  }

  const db = supabaseAdmin();
  const { error } = await db.from("users").upsert({ id: user.id, email: user.email, role: "admin" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, role: "admin" });
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ admin: false }, { status: 401 });
  return NextResponse.json({ admin: true, email: admin.email });
}
