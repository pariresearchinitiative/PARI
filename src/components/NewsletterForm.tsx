"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not subscribe");
      setStatus("ok");
      setMessage("You’re on the list. PARI will only write when there is something worth sending.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not subscribe");
    }
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "flex flex-col gap-3 sm:flex-row" : "max-w-md space-y-3"}>
      <label className="sr-only" htmlFor="newsletter-email">
        Email
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full border border-rule bg-white px-4 py-3 text-ink"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="whitespace-nowrap bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-accent disabled:opacity-60"
      >
        {status === "loading" ? "Saving…" : "Subscribe"}
      </button>
      {message ? (
        <p className={`text-sm ${status === "error" ? "text-accent" : "text-muted"} ${compact ? "sm:col-span-2" : ""}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
