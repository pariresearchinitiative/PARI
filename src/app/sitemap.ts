import type { MetadataRoute } from "next";
import { getPublishedBriefs } from "@/lib/briefs";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const briefs = await getPublishedBriefs(200);
  const staticRoutes = ["", "/research", "/topics", "/search", "/newsletter"].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: new Date()
  }));
  return [
    ...staticRoutes,
    ...briefs.map((b) => ({
      url: absoluteUrl(`/research/${b.slug}`),
      lastModified: b.published_at ? new Date(b.published_at) : new Date()
    }))
  ];
}
