import { createClient } from "@/utils/supabase/server";

export function createServerSupabase() {
  return createClient();
}
