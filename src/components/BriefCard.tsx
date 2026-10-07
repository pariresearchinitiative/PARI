import Link from "next/link";
import type { Brief } from "@/lib/types";

export function BriefCard({ brief }: { brief: Brief }) {
  return (
    <article className="border-b border-rule py-6 first:pt-0">
      <p className="text-xs uppercase tracking-[0.18em] text-accent">{brief.category || "Research"}</p>
      <h3 className="serif mt-2 text-2xl font-semibold leading-snug">
        <Link href={`/research/${brief.slug}`} className="hover:text-accent">
          {brief.title}
        </Link>
      </h3>
      {brief.summary ? <p className="mt-2 max-w-2xl text-[17px] leading-7 text-muted">{brief.summary}</p> : null}
      <p className="mt-3 text-sm text-muted">
        <Link href={`/research/${brief.slug}`} className="underline decoration-rule underline-offset-4 hover:text-ink">
          Read the brief
        </Link>
      </p>
    </article>
  );
}

export function EmptyResearch({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-rule px-6 py-12 text-center">
      <p className="text-muted">{message}</p>
    </div>
  );
}
