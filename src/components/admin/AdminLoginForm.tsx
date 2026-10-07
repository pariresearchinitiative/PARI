"use client";

import { createBrowserSupabase } from "@/lib/supabase";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
        throw new Error("Supabase public keys are not set.");
      }
      const supabase = createBrowserSupabase();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      await fetch("/api/admin/bootstrap", { method: "POST" });
      const next = params.get("next");
      const dest = next && next.startsWith("/admin") ? next : "/admin";
      router.replace(dest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">PARI Admin</p>
      <h1 className="serif mt-3 text-4xl font-semibold">Sign in</h1>
      <p className="mt-3 text-muted">Only the reviewing editor can approve briefs.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-rule bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-rule bg-white px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        <button disabled={loading} className="w-full bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-60">
          {loading ? "Signing in…" : "Enter review desk"}
        </button>
      </form>
    </main>
  );
}
