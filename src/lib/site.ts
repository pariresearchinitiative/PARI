export const SITE_NAME = "P.A.R.I.";
export const SITE_FULL_NAME = "Pranav Academic & Research Initiative";
export const SITE_TAGLINE = "Research, made understandable.";

export const SITE_DESCRIPTION =
  "PARI discovers important research and turns it into cited, easy-to-read briefs — for students, researchers, and anyone curious.";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const base = siteUrl();

  if (!path || path === "/") return base;

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
