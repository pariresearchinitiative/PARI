import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { hasSupabasePublic } from "@/lib/env";

export { hasSupabasePublic };

export function createBrowserSupabase() {
  return createBrowserClient();
}
