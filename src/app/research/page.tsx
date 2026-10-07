import { BriefCard, EmptyResearch } from "@/components/BriefCard";
import { getPublishedBriefs } from "@/lib/briefs";
import { TOPICS } from "@/lib/topics";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research briefs",
  description: "Short, cited explanations of important research papers."
};

export const dynamic = "force-dynamic";

export default async function ResearchPage({
  searchParams
}: {
  searchParams?: { topic?: string };
}) {
  const topic = searchParams?.topic;
  const briefs = await getPublishedBriefs(40, topic);

  return (
    <main className="mx-auto max-w-page px-5 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">PARI Research</p>
      <h1 className="serif mt-3 text-4xl font-semibold">Research briefs</h1>
      <p className="mt-3 max-w-2xl text-muted">Original PARI writing. Every brief links to the paper it explains.</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <a href="/research" className={`border px-3 py-1 text-sm ${!topic ? "border-ink bg-ink text-paper" : "border-rule"}`}>
          All
        </a>
        {TOPICS.map((t) => (
          <a
            key={t.slug}
            href={`/research?topic=${encodeURIComponent(t.name)}`}
            className={`border px-3 py-1 text-sm ${topic === t.name ? "border-ink bg-ink text-paper" : "border-rule"}`}
          >
            {t.name}
          </a>
        ))}
      </div>
      <div className="mt-10">
        {briefs.length ? briefs.map((b) => <BriefCard key={b.id} brief={b} />) : <EmptyResearch message="No published briefs in this view yet." />}
      </div>
    </main>
  );
}
