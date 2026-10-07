/**
 * Compatibility shim. New code should import from `@/lib/ai`.
 * Gemini is one optional implementation of ResearchAiProvider.
 */
export {
  analyzePaper,
  analyzePaperStructured,
  reviseBrief,
  scoutFilter,
  verifyBrief,
  writeBrief
} from "@/lib/ai";
export type { GeneratedBrief, PaperAnalysis, ScoutJudgement, Verification } from "@/lib/ai";
