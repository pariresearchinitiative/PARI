import { createClient } from "@supabase/supabase-js";
import { supabaseFetch } from "@/lib/supabase-fetch";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin environment variables missing");
  return createClient(url, key, {
    global: { fetch: supabaseFetch },
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export function hasSupabaseAdmin() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
