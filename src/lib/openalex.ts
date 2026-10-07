import { OPENALEX_CONCEPTS, TOPICS } from "@/lib/topics";

export type DiscoveredPaper = {
  openalex_id: string;
  title: string;
  authors: string[];
  abstract: string | null;
  doi: string | null;
  source_url: string | null;
  publication_date: string | null;
  venue: string | null;
  field: string;
  keywords: string[];
  cited_by: number;
};

type OpenAlexWork = {
  id?: string;
  display_name?: string;
  doi?: string | null;
  publication_date?: string | null;
  cited_by_count?: number;
  authorships?: { author?: { display_name?: string } }[];
  abstract_inverted_index?: Record<string, number[]> | null;
  primary_location?: { landing_page_url?: string | null; source?: { display_name?: string | null } | null } | null;
  concepts?: { display_name?: string; score?: number }[];
};

function reconstructAbstract(index?: Record<string, number[]> | null) {
  if (!index) return null;
  const slots: string[] = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const pos of positions) slots[pos] = word;
  }
  const text = slots.filter(Boolean).join(" ").trim();
  return text || null;
}

function doiFrom(work: OpenAlexWork) {
  const raw = work.doi || "";
  const cleaned = raw.replace(/^https?:\/\/doi.org\//i, "").trim();
  return cleaned || null;
}

function topicForDay(offset = 0) {
  const idx = (Math.floor(Date.now() / 86400000) + offset) % TOPICS.length;
  return TOPICS[idx];
}

export async function fetchOpenAlexWorks(limit = 8): Promise<DiscoveredPaper[]> {
  const topic = topicForDay();
  const concept = OPENALEX_CONCEPTS[topic.slug];
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10);
  const mailto = process.env.OPENALEX_MAILTO || "pari@localhost";
  const params = new URLSearchParams({
    filter: `from_publication_date:${since},has_abstract:true,type:article,concepts.id:${concept}`,
    sort: "cited_by_count:desc",
    per_page: String(limit),
    select: "id,display_name,doi,publication_date,cited_by_count,authorships,abstract_inverted_index,primary_location,concepts"
  });
  const res = await fetch(`https://api.openalex.org/works?${params.toString()}`, {
    headers: {
      "User-Agent": `PARI/1.0 (mailto:${mailto})`
    },
    next: { revalidate: 0 }
  });
  if (!res.ok) throw new Error(`OpenAlex error ${res.status}`);
  const json = (await res.json()) as { results?: OpenAlexWork[] };
  const works = json.results ?? [];

  return works
    .map((work) => {
      const authors = (work.authorships ?? [])
        .map((a) => a.author?.display_name)
        .filter((n): n is string => Boolean(n));
      const keywords = (work.concepts ?? [])
        .filter((c) => (c.score ?? 0) > 0.4)
        .map((c) => c.display_name)
        .filter((n): n is string => Boolean(n))
        .slice(0, 8);
      const doi = doiFrom(work);
      const landing = work.primary_location?.landing_page_url || (doi ? `https://doi.org/${doi}` : work.id || null);
      return {
        openalex_id: work.id || "",
        title: (work.display_name || "").trim(),
        authors,
        abstract: reconstructAbstract(work.abstract_inverted_index),
        doi,
        source_url: landing,
        publication_date: work.publication_date || null,
        venue: work.primary_location?.source?.display_name || null,
        field: topic.name,
        keywords,
        cited_by: work.cited_by_count ?? 0
      };
    })
    .filter((p) => p.title && p.abstract && p.abstract.length > 200);
}

export function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
