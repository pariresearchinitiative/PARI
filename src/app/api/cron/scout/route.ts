import { NextResponse } from "next/server";
import { processNextPapers, runDailyPipeline } from "@/lib/pipeline";
import { hasSupabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasSupabaseAdmin()) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });

  try {
    const result = await runDailyPipeline();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("PARI CRON ERROR:", e);
    const message = e instanceof Error ? e.message : "Scout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await processNextPapers(1);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Process failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
