import Link from "next/link";

import { BriefCard, EmptyResearch } from "@/components/BriefCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getPublishedBriefs } from "@/lib/briefs";
import { SITE_FULL_NAME, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { TOPICS } from "@/lib/topics";

export const dynamic = "force-dynamic";

export default async function Home() {
  const briefs = await getPublishedBriefs(8);
  const featured = briefs[0] ?? null;
  const latest = featured ? briefs.slice(1) : briefs;

  return (
    <main>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-page px-5 py-20 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            P.A.R.I.
          </p>

          <h1 className="serif mt-4 max-w-4xl text-5xl font-semibold leading-[1.08] md:text-7xl">
            {SITE_TAGLINE}
          </h1>

          <p className="mt-5 text-base font-medium tracking-wide text-ink md:text-lg">
            {SITE_FULL_NAME}
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            We discover important research, explain it in plain language, and
            keep every claim tied to the original source. You read the idea.
            The DOI takes you to the evidence.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/research"
              className="bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-accent"
            >
              Explore research
            </Link>

            <Link
              href="/topics"
              className="border border-rule px-5 py-3 text-sm font-semibold hover:border-ink"
            >
              Browse topics
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-paper-2/50">
        <div className="mx-auto max-w-page px-5 py-14 md:py-16">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">
              What is P.A.R.I.?
            </p>

            <h2 className="serif mt-3 text-3xl font-semibold md:text-4xl">
              Pranav Academic & Research Initiative
            </h2>

            <p className="mt-5 text-lg leading-8 text-muted">
              P.A.R.I. stands for{" "}
              <strong className="text-ink">
                Pranav Academic & Research Initiative
              </strong>
              . We believe important research should be easier to discover,
              understand, and explore.
            </p>

            <p className="mt-4 text-lg leading-8 text-muted">
              We find meaningful research, explain the ideas in accessible
              language, and connect every brief back to the original work. We
              do not republish research papers. We make research easier to
              understand.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-page px-5 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Featured research
        </p>

        {featured ? (
          <div className="mt-4 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.16em] text-accent">
              {featured.category}
            </p>

            <h2 className="serif mt-2 text-4xl font-semibold leading-tight">
              <Link
                href={`/research/${featured.slug}`}
                className="hover:text-accent"
              >
                {featured.title}
              </Link>
            </h2>

            <p className="mt-4 text-lg leading-8 text-muted">
              {featured.summary}
            </p>

            <Link
              href={`/research/${featured.slug}`}
              className="mt-5 inline-block text-sm underline underline-offset-4"
            >
              Read the P.A.R.I. brief
            </Link>
          </div>
        ) : (
          <EmptyResearch message="Approved briefs will appear here. Until then, the review queue is the front door." />
        )}
      </section>

      <section className="border-y border-rule bg-paper-2/50">
        <div className="mx-auto max-w-page px-5 py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                Latest research
              </p>

              <h2 className="serif mt-2 text-3xl font-semibold">
                Recently explained
              </h2>
            </div>

            <Link
              href="/research"
              className="text-sm underline underline-offset-4"
            >
              All briefs
            </Link>
          </div>

          <div className="mt-8">
            {latest.length ? (
              latest.map((b) => <BriefCard key={b.id} brief={b} />)
            ) : (
              <EmptyResearch message="No published briefs yet." />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-page px-5 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Browse by topic
        </p>

        <h2 className="serif mt-2 text-3xl font-semibold">
          A map of the sciences
        </h2>

        <div className="mt-8 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => (
            <Link
              key={t.slug}
              href={`/topics#${t.slug}`}
              className="bg-paper p-6 hover:bg-paper-2"
            >
              <p className="font-semibold">{t.name}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{t.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-rule">
        <div className="mx-auto grid max-w-page gap-10 px-5 py-16 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Why Pranav Academic & Research Initiative?
            </p>

            <h2 className="serif mt-2 text-3xl font-semibold">
              Fewer papers. Better understanding.
            </h2>
          </div>

          <ul className="space-y-6 text-[17px] leading-7 text-muted">
            <li>
              <strong className="text-ink">
                We translate research, not just summarise it.
              </strong>{" "}
              Each brief keeps the research question, methods, findings, and
              limits in view.
            </li>

            <li>
              <strong className="text-ink">
                We keep claims attached to sources.
              </strong>{" "}
              Authors, venue, date, and DOI are part of the article, not an
              afterthought.
            </li>

            <li>
              <strong className="text-ink">
                We keep a human in the loop.
              </strong>{" "}
              AI drafts. Nothing scientific is published until it is approved.
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-page px-5 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Newsletter
        </p>

        <h2 className="serif mt-2 text-3xl font-semibold">
          The week’s research, once.
        </h2>

        <p className="mt-3 max-w-xl text-muted">
          No daily drip. Sign up if you want P.A.R.I. in your inbox when
          briefs are published.
        </p>

        <div className="mt-6">
          <NewsletterForm />
        </div>
      </section>
    </main>
  );
}
