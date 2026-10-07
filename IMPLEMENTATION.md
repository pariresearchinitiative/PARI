# PARI implementation roadmap

## V1 included
- Public site: `/`, `/research`, `/research/[slug]`, `/topics`, `/search`, `/newsletter`
- Admin review desk at `/admin` with Supabase Auth
- Approve / Reject / Request Changes (natural-language revision)
- Supabase schema + RLS (unpublished briefs are not public)
- Provider-agnostic AI (`src/lib/ai`): MOCK when `GEMINI_API_KEY` is missing; Gemini adapter when a key is set
- OpenAlex discovery + DOI/title dedupe
- Daily Vercel cron pipeline (never auto-publishes)
- SEO: metadata, Open Graph, JSON-LD, sitemap, robots.txt

## Later
- Full-text/PDF extraction where legally allowed
- Newsletter sending (Resend or similar when budget exists)
- Crossref/arXiv adapters
- Topics/researchers/institutions graphs
- Saved research and analytics UI
