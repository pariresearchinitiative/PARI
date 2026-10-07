"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type QueueRow = {
  id: string;
  title: string;
  category: string;
  importance: number | null;
  confidence: number | null;
  citation: string;
  verification: string;
  createdAt: string;
  status: string;
  briefId: string;
};

export function ReviewDesk({ email, items }: { email: string; items: QueueRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [instruction, setInstruction] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function act(queueId: string, action: string, extra?: Record<string, string>) {
    setBusy(queueId + action);
    setError("");
    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId, action, ...extra })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Action failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  async function runPipeline() {
    setBusy("pipeline");
    setError("");
    try {
      const res = await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pipeline" })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Pipeline failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pipeline failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto max-w-page px-5 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">PARI Admin</p>
          <h1 className="serif mt-2 text-4xl font-semibold">Review queue</h1>
          <p className="mt-2 text-muted">Signed in as {email}. AI drafts; you publish.</p>
        </div>
        <button
          onClick={runPipeline}
          disabled={busy === "pipeline"}
          className="border border-rule px-4 py-2 text-sm hover:border-ink disabled:opacity-60"
        >
          {busy === "pipeline" ? "Running…" : "Run discovery now"}
        </button>
      </div>
      {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-rule text-xs uppercase tracking-[0.12em] text-muted">
              <th className="py-3 pr-3">Title</th>
              <th className="py-3 pr-3">Category</th>
              <th className="py-3 pr-3">Score</th>
              <th className="py-3 pr-3">AI conf.</th>
              <th className="py-3 pr-3">Citations</th>
              <th className="py-3 pr-3">Verification</th>
              <th className="py-3 pr-3">Created</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-rule align-top">
                <td className="py-4 pr-3 font-medium">{item.title}</td>
                <td className="py-4 pr-3">{item.category}</td>
                <td className="py-4 pr-3">{item.importance ?? "—"}</td>
                <td className="py-4 pr-3">{item.confidence != null ? Number(item.confidence).toFixed(2) : "—"}</td>
                <td className="py-4 pr-3">{item.citation}</td>
                <td className="py-4 pr-3">{item.verification}</td>
                <td className="py-4 pr-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="py-4 pr-3">{item.status}</td>
                <td className="py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/briefs/${item.briefId}`} className="border border-rule px-2 py-1">
                      Open
                    </Link>
                    <button
                      className="bg-pine px-2 py-1 text-paper"
                      disabled={!!busy}
                      onClick={() => act(item.id, "approve")}
                    >
                      Approve
                    </button>
                    <button className="border border-rule px-2 py-1" disabled={!!busy} onClick={() => act(item.id, "reject")}>
                      Reject
                    </button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={instruction[item.id] || ""}
                      onChange={(e) => setInstruction((s) => ({ ...s, [item.id]: e.target.value }))}
                      placeholder="Make the methodology simpler."
                      className="w-44 border border-rule bg-white px-2 py-1 text-xs"
                    />
                    <button
                      className="text-xs underline"
                      disabled={!!busy}
                      onClick={() => act(item.id, "request_changes", { instruction: instruction[item.id] || "" })}
                    >
                      Request changes
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length ? <p className="py-10 text-center text-muted">Queue empty. Run discovery or wait for the daily cron.</p> : null}
      </div>
    </main>
  );
}
