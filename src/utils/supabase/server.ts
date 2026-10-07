import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublishableKey, supabaseUrl } from "@/lib/env";
import { supabaseFetch } from "@/lib/supabase-fetch";

export function createClient(cookieStore?: ReturnType<typeof cookies>) {
  const store = cookieStore ?? cookies();
  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    global: { fetch: supabaseFetch },
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component; middleware refreshes the session.
        }
      }
    }
  });
}
