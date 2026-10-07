export const TOPICS = [
  { slug: "ai-ml", name: "AI & ML", blurb: "Models, methods, and what they actually change." },
  { slug: "medicine-biology", name: "Medicine & Biology", blurb: "Clinical findings and living systems, explained plainly." },
  { slug: "climate-environment", name: "Climate & Environment", blurb: "Earth systems, measurements, and policy-relevant science." },
  { slug: "physics-space", name: "Physics & Space", blurb: "From lab benches to telescopes." },
  { slug: "psychology", name: "Psychology", blurb: "Mind, behaviour, and the limits of the evidence." },
  { slug: "economics", name: "Economics", blurb: "How people, markets, and institutions actually behave." },
  { slug: "materials-science", name: "Materials Science", blurb: "New substances and why they matter." },
  { slug: "robotics", name: "Robotics", blurb: "Machines that sense, move, and decide." },
  { slug: "neuroscience", name: "Neuroscience", blurb: "Brains, circuits, and careful claims." }
] as const;

export type TopicSlug = (typeof TOPICS)[number]["slug"];

export const OPENALEX_CONCEPTS: Record<string, string> = {
  "ai-ml": "C119857082",
  "medicine-biology": "C71924100",
  "climate-environment": "C18903297",
  "physics-space": "C121332964",
  psychology: "C15744967",
  economics: "C162324750",
  "materials-science": "C192562407",
  robotics: "C114614502",
  neuroscience: "C127413603"
};

export function topicByName(name?: string | null) {
  return TOPICS.find((t) => t.name === name) ?? null;
}

export function topicBySlug(slug?: string | null) {
  return TOPICS.find((t) => t.slug === slug) ?? null;
}
