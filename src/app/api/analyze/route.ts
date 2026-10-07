import { NextResponse } from "next/server";
import { analyzePaper, getAiProviderName } from "@/lib/ai";
import { getAdminUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    const cron = process.env.CRON_SECRET && req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
    if (!admin && !cron) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { text } = await req.json();
    if (!text || typeof text !== "string") return NextResponse.json({ error: "text required" }, { status: 400 });
    const analysis = await analyzePaper(text);
    return NextResponse.json({ ...analysis, ai: getAiProviderName() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
