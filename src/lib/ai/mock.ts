import type { ResearchAiProvider } from "@/lib/ai/provider";
import type {
  GeneratedBrief,
  PaperAnalysis,
  PaperInput,
  ReviseInput,
  ScoutInput,
  ScoutJudgement,
  Verification
} from "@/lib/ai/types";

const FIELDS = [
  "AI & ML",
  "Medicine & Biology",
  "Climate & Environment",
  "Physics & Space",
  "Psychology",
  "Economics",
  "Materials Science",
  "Robotics",
  "Neuroscience",
  "Other"
];

function pickField(field?: string | null) {
  if (field && FIELDS.includes(field)) return field;
  return "Other";
}

function clip(text: string, n: number) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1).trim()}...`;
}

function sentences(abstract?: string | null) {
  if (!abstract) return [];

  return abstract
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40)
    .slice(0, 4);
}

function paperBits(paper: Record<string, unknown> | PaperInput) {
  const title = String(
    (paper as { title?: unknown }).title || "Untitled research"
  );

  const authors = Array.isArray(
    (paper as { authors?: unknown }).authors
  )
    ? ((paper as { authors: unknown[] }).authors as unknown[]).map(String)
    : [];

  const abstract =
    ((paper as { abstract?: unknown }).abstract as string | null) || null;

  const field = pickField(
    ((paper as { field?: unknown }).field as string | null) || null
  );

  const venue =
    ((paper as { venue?: unknown }).venue as string | null) || null;

  const doi =
    ((paper as { doi?: unknown }).doi as string | null) || null;

  return {
    title,
    authors,
    abstract,
    field,
    venue,
    doi
  };
}

export const mockResearchAiProvider: ResearchAiProvider = {
  name: "mock",

  async scoutFilter(paper: ScoutInput): Promise<ScoutJudgement> {
    const field = pickField(paper.field);
    const abstract = paper.abstract || "";
    const citedBy = paper.cited_by ?? 0;

    const keep = abstract.length >= 200;

    const importanceScore = Math.min(
      95,
      Math.max(
        45,
        45 +
          Math.min(25, Math.floor(citedBy / 10)) +
          Math.min(20, Math.floor(abstract.length / 500))
      )
    );

    return {
      keep,
      field,
      reason: keep
        ? "Mock screening passed because the paper has a usable abstract and enough research context."
        : "Mock screening rejected the paper because the abstract is too short.",
      importance_score: importanceScore
    };
  },

  async analyzePaperStructured(
    paper: PaperInput
  ): Promise<PaperAnalysis> {
    const abstractSentences = sentences(paper.abstract);

    const firstSentence =
      abstractSentences[0] ||
      "The available abstract does not provide enough detail for a full analysis.";

    const secondSentence =
      abstractSentences[1] ||
      "The study reports findings based on the methodology described by the authors.";

    return {
      research_question: `What does this research investigate about "${paper.title}"?`,

      methodology:
        "The paper uses the research methodology described in its abstract. A detailed methodological assessment requires the full paper.",

      findings: [
        firstSentence,
        secondSentence
      ],

      limitations: [
        "This is a MOCK analysis and has not independently checked the full research paper.",
        "The analysis is based primarily on the available abstract."
      ],

      evidence: [
        paper.doi
          ? `Original research DOI: ${paper.doi}`
          : "No DOI was provided in the available paper metadata.",
        paper.venue
          ? `Published venue: ${paper.venue}`
          : "No publication venue was provided."
      ],

      why_it_matters:
        "The research may be useful for understanding developments in this field, but its real-world significance should be judged from the full paper and independent evidence.",

      novelty_score: 60,
      importance_score: 60,
      confidence_score: 55
    };
  },

  async writeBrief(input): Promise<GeneratedBrief> {
    const paper = paperBits(input.paper);
    const analysis = input.analysis;

    const title = `Research Brief: ${paper.title}`;

    const summary =
      analysis.findings[0] ||
      `A research study in ${paper.field} examining ${paper.title}.`;

    return {
      title,
      summary,

      seo_title: `${paper.title} | PARI Research Brief`,

      seo_description: clip(
        `An easy-to-understand PARI research brief explaining ${paper.title}.`,
        155
      ),

      category: paper.field,

      content: {
        one_line_summary: summary,

        what_happened:
          `Researchers investigated "${paper.title}". The available research information was analyzed in a simplified format for PARI readers.`,

        research_question: analysis.research_question,

        in_simple_words:
          `${analysis.findings[0] || "The study explores a research question and reports evidence related to it."} This explanation is generated in MOCK mode and should not be treated as an independent scientific review.`,

        methodology: analysis.methodology,

        key_findings:
          analysis.findings.length > 0
            ? analysis.findings
            : ["No specific findings were available from the supplied abstract."],

        limitations: analysis.limitations,

        why_it_matters: analysis.why_it_matters
      },

      social_draft:
        `New PARI research brief: ${paper.title}. Read the research explained in simple language, with the original source kept attached.`
    };
  },

  async verifyBrief(input): Promise<Verification> {
    const paper = paperBits(input.paper);
    const hasSource = Boolean(paper.doi);

    return {
      citation_status: hasSource ? "passed" : "insufficient_source",

      verifier_status: hasSource ? "passed" : "flagged",

      notes: hasSource
        ? [
            "MOCK verification: DOI/source metadata is present.",
            "Full independent fact-checking is not performed in MOCK mode."
          ]
        : [
            "MOCK verification: no DOI was available.",
            "A human review is recommended before publication."
          ],

      confidence: hasSource ? 75 : 45
    };
  },

  async reviseBrief(input: ReviseInput): Promise<GeneratedBrief> {
    const current = input.brief as GeneratedBrief;
    const instruction = input.instruction.trim();

    return {
      ...current,

      summary:
        current.summary ||
        "This research brief was revised in MOCK mode.",

      content: {
        ...current.content,

        methodology:
          `${current.content.methodology}\n\n` +
          `Editor instruction (MOCK revision, no live model): ${instruction}`,

        in_simple_words:
          `${current.content.in_simple_words} ` +
          `The editor requested this revision: ${clip(instruction, 120)}`
      },

      social_draft:
        `${current.social_draft}\n\n` +
        `MOCK editor revision: ${clip(instruction, 120)}`
    };
  }
};

export const mockProvider = mockResearchAiProvider;
