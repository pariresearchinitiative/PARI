
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const supabase = createBrowserSupabase();

      const callbackUrl = new URL(
        "/auth/callback",
        window.location.origin
      );

      callbackUrl.searchParams.set("next", "/reset-password");

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: callbackUrl.toString(),
        });

      if (resetError) {
        throw resetError;
      }

      setMessage(
        "Agar is email ka account hai, toh password reset email bhej diya gaya hai. Apna inbox aur spam folder check karo."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Password reset email nahi bheja ja saka."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">
        P.A.R.I. Admin
      </p>

      <h1 className="serif mt-3 text-4xl font-semibold">
        Reset password
      </h1>

      <p className="mt-3 text-muted">
        Apna admin email enter karo. Hum password reset link bhejne
        ki request karenge.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full border border-rule bg-white px-3 py-2"
            placeholder="Enter your admin email"
          />
        </label>

        {message ? (
          <p role="status" className="text-sm">
            {message}
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-accent">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-sm">
        <Link
          href="/admin/login"
          className="underline underline-offset-4"
        >
          Back to admin login
        </Link>
      </p>
    </main>
  );
}
