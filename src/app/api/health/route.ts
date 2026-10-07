import { NextResponse } from "next/server";
import { getAiProviderName } from "@/lib/ai";

export async function GET() {
  return NextResponse.json({ ok: true, service: "PARI", ai: getAiProviderName() });
}
