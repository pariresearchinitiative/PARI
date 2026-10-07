export function slugify(input: string) {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return base || "research-brief";
}

export function uniqueSlug(title: string, id: string) {
  return `${slugify(title)}-${id.slice(0, 8)}`;
}
