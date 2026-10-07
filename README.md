# PARI — Pranav Academic & Research Initiative

AI-first research translation platform: discover papers, turn them into cited research briefs, verify claims, and send them to a human review queue before publishing.

## Stack
- Next.js 14 / TypeScript / Tailwind CSS
- Supabase (Postgres + Auth + RLS)
- Gemini API when `GEMINI_API_KEY` is set; otherwise a built-in MOCK provider so the app still runs
- OpenAlex (free paper discovery)
- Vercel

## Operating model
You should not run PARI by hand every day.

1. Vercel Cron hits `/api/cron/scout` once a day.
2. OpenAlex papers are filtered, analyzed, written, and verified by the active AI provider (Gemini, or MOCK if no key).
3. Drafts land in `/admin` as a review queue.
4. You approve, reject, or request changes when you have time.
5. Approved briefs publish automatically to the public site.

AI never publishes scientific content on its own.

## Quick start
1. Install Node.js LTS (this machine did not have `npm` on PATH when V1 was built).
2. Copy `.env.example` to `.env.local`
3. Create a free Supabase project and run `supabase/schema.sql` in the SQL editor
4. In Supabase Auth, create your editor user (email + password)
5. Set `ADMIN_EMAIL` to that same email
6. Gemini is optional. Without `GEMINI_API_KEY`, PARI uses MOCK mode (review-queue drafts are clearly labelled and still need human approval).
7. `npm.cmd install` then `npm.cmd run dev`

Open http://localhost:3000

## Environment variables
See `.env.example`. Never put `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in client code.

## Production
Deploy to Vercel, paste the same env vars, and keep the daily cron in `vercel.json`. Protect `/api/cron/scout` with `CRON_SECRET`.

Hobby-plan functions are short-lived, so each cron run scouts several papers and fully processes up to two. The queue fills across days. Use **Run discovery now** in `/admin` if you want a catch-up batch.

## Important
PARI publishes original explanatory writing and links to the original source/DOI. It does not republish papers. Respect publisher licenses and source terms.
