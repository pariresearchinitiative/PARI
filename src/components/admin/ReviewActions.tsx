"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewActions({ queueId }: { queueId: string }) {
  const router = useRouter();
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function act(action: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId, action, instruction })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      router.refresh();
      if (action === "approve" || action === "reject") router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 border border-rule p-4">
      <div className="flex flex-wrap gap-2">
        <button disabled={busy} onClick={() => act("approve")} className="bg-pine px-4 py-2 text-sm text-paper">
          Approve
        </button>
        <button disabled={busy} onClick={() => act("reject")} className="border border-rule px-4 py-2 text-sm">
          Reject
        </button>
      </div>
      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="Request changes: Make the methodology simpler."
        className="mt-4 w-full border border-rule bg-white px-3 py-2 text-sm"
        rows={3}
      />
      <button disabled={busy} onClick={() => act("request_changes")} className="mt-2 text-sm underline">
        Request changes
      </button>
      {error ? <p className="mt-2 text-sm text-accent">{error}</p> : null}
    </div>
  );
}
