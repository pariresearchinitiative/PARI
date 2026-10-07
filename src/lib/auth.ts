import { hasSupabasePublic } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function getAdminUser() {
  if (!hasSupabasePublic()) return null;
  const supabase = createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("users").select("id, email, role").eq("id", user.id).maybeSingle();
  const envAdmin = process.env.ADMIN_EMAIL?.toLowerCase();
  const isAdmin = profile?.role === "admin" || (envAdmin && user.email?.toLowerCase() === envAdmin);
  if (!isAdmin) return null;
  return { id: user.id, email: user.email ?? profile?.email ?? "" };
}

export async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  return admin;
}
