
"use client";

import { FormEvent, useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";

export default function ChangePasswordForm() {
  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const supabase = createBrowserSupabase();
        const { data, error: sessionError } =
          await supabase.auth.getUser();

        if (sessionError) throw sessionError;

        if (!cancelled) {
          setSessionReady(Boolean(data.user));
          if (!data.user) {
            setError(
              "Active login session nahi mili. Pehle apne PARI admin account mein login karo."
            );
          }
        }
      } catch {
        if (!cancelled) {
          setError("Login session verify nahi ho saki. Dobara login karo.");
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

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

      const { data, error: sessionError } =
        await supabase.auth.getUser();

      if (sessionError) throw sessionError;

      if (!data.user) {
        throw new Error(
          "Login session expire ho gayi. Dobara login karo."
        );
      }

      const { error: updateError } =
        await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      setPassword("");
      setConfirmPassword("");
      setMessage(
        "Password successfully update ho gaya! Ab Incognito window mein naye password se login test kar sakte ho."
      );
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

  if (checking) {
    return (
      <p role="status" className="mt-6 text-sm text-muted">
        Login session verify ho rahi hai...
      </p>
    );
  }

  if (!sessionReady) {
    return (
      <div className="mt-6 space-y-4">
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
        <a
          href="/admin/login"
          className="underline underline-offset-4"
        >
          Back to admin login
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}

      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
