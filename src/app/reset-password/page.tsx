
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const started = useRef(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function verifyRecoveryLink() {
      setChecking(true);
      setError("");

      try {
        const supabase = createBrowserSupabase();
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        const hashParams = new URLSearchParams(
          url.hash.replace(/^#/, "")
        );

        const hasRecoveryHash =
          hashParams.get("type") === "recovery" &&
          Boolean(hashParams.get("access_token"));

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw new Error(
              "Reset link verify nahi hua. Naya reset link request karo."
            );
          }

          url.searchParams.delete("code");

          window.history.replaceState(
            {},
            "",
            `${url.pathname}${url.search}${url.hash}`
          );
        } else if (!hasRecoveryHash) {
          throw new Error(
            "Valid recovery link se page open nahi hua. Naya reset link request karo."
          );
        }

        const { data, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!data.session) {
          throw new Error(
            "Recovery session establish nahi hui. Naya reset link request karo."
          );
        }

        setRecoveryReady(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Reset link verify nahi ho saka."
        );
      } finally {
        setChecking(false);
      }
    }

    void verifyRecoveryLink();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!recoveryReady) {
      setError("Pehle valid password reset link open karo.");
      return;
    }

    if (password.length < 8) {
      setError("Password kam se kam 8 characters ka hona chahiye.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Dono passwords match nahi kar rahe.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabase();

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      await supabase.auth.signOut();

      router.replace("/admin/login?reset=success");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Password update nahi ho paya."
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
        Set new password
      </h1>

      <p className="mt-3 text-muted">
        Apne admin account ke liye naya password set karo.
      </p>

      {checking ? (
        <p role="status" className="mt-6 text-sm">
          Reset link verify ho raha hai...
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-6 text-sm text-accent">
          {error}
        </p>
      ) : null}

      {recoveryReady && !checking ? (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm">
            New password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full border border-rule bg-white px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            Confirm new password
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 w-full border border-rule bg-white px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      ) : null}

      <p className="mt-6 text-sm">
        <Link
          href="/forgot-password"
          className="underline underline-offset-4"
        >
          Request a new reset link
        </Link>
      </p>

      <p className="mt-3 text-sm">
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
