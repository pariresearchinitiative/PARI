import type {
  GeneratedBrief,
  PaperAnalysis,
  PaperInput,
  ReviseInput,
  ScoutInput,
  ScoutJudgement,
  Verification
} from "@/lib/ai/types";

/**
 * Provider-agnostic research AI.
 *
 * To add a real model later:
 * 1. Implement this interface (see `gemini.ts` for the Gemini adapter).
 * 2. Register it in `src/lib/ai/index.ts`.
 * 3. Do not change pipeline or admin routes — they only talk to this interface.
 */
export interface ResearchAiProvider {
  readonly name: "mock" | "gemini";
  scoutFilter(paper: ScoutInput): Promise<ScoutJudgement>;
  analyzePaperStructured(paper: PaperInput): Promise<PaperAnalysis>;
  writeBrief(input: { paper: Record<string, unknown>; analysis: PaperAnalysis }): Promise<GeneratedBrief>;
  verifyBrief(input: {
    paper: Record<string, unknown>;
    analysis: PaperAnalysis;
    brief: GeneratedBrief;
  }): Promise<Verification>;
  reviseBrief(input: ReviseInput): Promise<GeneratedBrief>;
}
