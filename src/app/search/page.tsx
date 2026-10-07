import { BriefCard, EmptyResearch } from "@/components/BriefCard";
import { searchPublishedBriefs } from "@/lib/briefs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search published PARI research briefs."
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q ?? "";
  const results = q ? await searchPublishedBriefs(q) : [];

  return (
    <main className="mx-auto max-w-page px-5 py-16">
      <h1 className="serif text-4xl font-semibold">Search</h1>
      <p className="mt-3 text-muted">Find published briefs by title, summary, or field.</p>
      <form className="mt-8 flex max-w-xl gap-2" action="/search">
        <label className="sr-only" htmlFor="q">
          Query
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="transformer, climate, memory…"
          className="w-full border border-rule bg-white px-4 py-3"
        />
        <button className="bg-ink px-5 py-3 text-sm font-semibold text-paper" type="submit">
          Search
        </button>
      </form>
      <div className="mt-10">
        {q && !results.length ? <EmptyResearch message="No published briefs matched that search." /> : null}
        {results.map((b) => (
          <BriefCard key={b.id} brief={b} />
        ))}
      </div>
    </main>
  );
}
