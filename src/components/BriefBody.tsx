import type { ReactNode } from "react";
import type { BriefContent } from "@/lib/types";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-rule py-8">
      <h2 className="serif text-2xl font-semibold">{title}</h2>
      <div className="mt-3 text-[17.5px] leading-8 text-ink/90">{children}</div>
    </section>
  );
}

export function BriefBody({ content }: { content: BriefContent }) {
  const source = content.original_research ?? {
    authors: [] as string[],
    journal: null,
    publication_date: null,
    doi: null,
    source_url: null
  };
  const doiUrl = source.doi ? `https://doi.org/${source.doi.replace(/^https?:\/\/doi.org\//i, "")}` : source.source_url;

  return (
    <div>
      <Section title="What happened?">
        <p>{content.what_happened}</p>
      </Section>
      <Section title="The research question">
        <p>{content.research_question}</p>
      </Section>
      <Section title="In simple words">
        <p>{content.in_simple_words}</p>
      </Section>
      <Section title="How did researchers study it?">
        <p>{content.methodology}</p>
      </Section>
      <Section title="Key findings">
        <ul className="list-disc space-y-2 pl-6">
          {(content.key_findings ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
      <Section title="Limitations">
        <ul className="list-disc space-y-2 pl-6">
          {(content.limitations ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
      <Section title="Why does it matter?">
        <p>{content.why_it_matters}</p>
      </Section>
      <Section title="Original research">
        <dl className="grid gap-3 text-base sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">Authors</dt>
            <dd className="mt-1">{source.authors?.length ? source.authors.join(", ") : "Not listed in source metadata"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">Journal / venue</dt>
            <dd className="mt-1">{source.journal || "Not listed in source metadata"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">Publication date</dt>
            <dd className="mt-1">{source.publication_date || "Not listed in source metadata"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">DOI</dt>
            <dd className="mt-1">{source.doi || "Not listed in source metadata"}</dd>
          </div>
        </dl>
        {doiUrl ? (
          <p className="mt-6">
            <a href={doiUrl} className="text-accent underline underline-offset-4" target="_blank" rel="noreferrer">
              Read the original paper
            </a>
          </p>
        ) : null}
      </Section>
    </div>
  );
}
