import { BriefBody } from "@/components/BriefBody";
import { getPublishedBrief, paperFrom } from "@/lib/briefs";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const brief = await getPublishedBrief(params.slug);
  if (!brief) return { title: "Brief not found" };
  const title = brief.seo_title || brief.title;
  const description = brief.seo_description || brief.summary || "";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: absoluteUrl(`/research/${brief.slug}`)
    }
  };
}

export default async function BriefPage({ params }: { params: { slug: string } }) {
  const brief = await getPublishedBrief(params.slug);
  if (!brief || !brief.content) notFound();
  const paper = paperFrom(brief);
  const authors = brief.content.original_research?.authors ?? [];
  const doi = brief.content.original_research?.doi;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: brief.title,
    description: brief.summary,
    datePublished: brief.published_at,
    author: authors.map((name) => ({ "@type": "Person", name })),
    publisher: { "@type": "Organization", name: SITE_NAME },
    identifier: doi,
    url: absoluteUrl(`/research/${brief.slug}`),
    about: paper?.title,
    isBasedOn: doi ? `https://doi.org/${doi}` : brief.content.original_research?.source_url
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/research" className="text-sm text-muted hover:text-ink">
        ← All research
      </Link>
      <article className="mt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-accent">{brief.category}</p>
        <h1 className="serif mt-3 text-4xl font-semibold leading-tight md:text-5xl">{brief.title}</h1>
        <p className="mt-5 text-xl leading-8 text-muted">{brief.content.one_line_summary || brief.summary}</p>
        <BriefBody content={brief.content} />
      </article>
    </main>
  );
}
