import { geminiProvider } from "@/lib/ai/gemini";
import { mockProvider } from "@/lib/ai/mock";
import type { ResearchAiProvider } from "@/lib/ai/provider";
import type { PaperAnalysis, PaperInput } from "@/lib/ai/types";

export type { GeneratedBrief, PaperAnalysis, ScoutJudgement, Verification } from "@/lib/ai/types";
export type { ResearchAiProvider } from "@/lib/ai/provider";

/**
 * Resolves the active AI backend.
 *
 * Plug in a real provider later by:
 * - setting GEMINI_API_KEY, or
 * - setting AI_PROVIDER=gemini, or
 * - adding another adapter next to `gemini.ts` and returning it from this function.
 *
 * GEMINI_API_KEY stays server-side. Never prefix it with NEXT_PUBLIC_.
 */
export function getAiProvider(): ResearchAiProvider {
  const forced = (process.env.AI_PROVIDER || "auto").toLowerCase();
  if (forced === "mock") return mockProvider;
  if (forced === "gemini") return geminiProvider;
  if (process.env.GEMINI_API_KEY) return geminiProvider;
  return mockProvider;
}

export function getAiProviderName() {
  return getAiProvider().name;
}

export const scoutFilter: ResearchAiProvider["scoutFilter"] = (paper) => getAiProvider().scoutFilter(paper);
export const analyzePaperStructured: ResearchAiProvider["analyzePaperStructured"] = (paper) =>
  getAiProvider().analyzePaperStructured(paper);
export const writeBrief: ResearchAiProvider["writeBrief"] = (input) => getAiProvider().writeBrief(input);
export const verifyBrief: ResearchAiProvider["verifyBrief"] = (input) => getAiProvider().verifyBrief(input);
export const reviseBrief: ResearchAiProvider["reviseBrief"] = (input) => getAiProvider().reviseBrief(input);

export async function analyzePaper(input: string): Promise<PaperAnalysis> {
  const paper: PaperInput = { title: "Untitled source", authors: [], abstract: input };
  return analyzePaperStructured(paper);
}
