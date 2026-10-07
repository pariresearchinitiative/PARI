import { getPublishedBriefs } from "@/lib/briefs";
import { TOPICS } from "@/lib/topics";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Topics",
  description: "Browse PARI research briefs by scientific field."
};

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const briefs = await getPublishedBriefs(100);
  const counts = Object.fromEntries(TOPICS.map((t) => [t.name, briefs.filter((b) => b.category === t.name).length]));

  return (
    <main className="mx-auto max-w-page px-5 py-16">
      <h1 className="serif text-4xl font-semibold">Topics</h1>
      <p className="mt-3 max-w-2xl text-muted">PARI covers the major sciences. Counts reflect published briefs only.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {TOPICS.map((t) => (
          <section id={t.slug} key={t.slug} className="scroll-mt-8 border border-rule p-6">
            <h2 className="serif text-2xl font-semibold">{t.name}</h2>
            <p className="mt-2 text-muted">{t.blurb}</p>
            <p className="mt-4 text-sm text-muted">{counts[t.name] || 0} published</p>
            <Link href={`/research?topic=${encodeURIComponent(t.name)}`} className="mt-4 inline-block text-sm underline underline-offset-4">
              View briefs
            </Link>
          </section>
        ))}
      </div>
    </main>
  );
}
