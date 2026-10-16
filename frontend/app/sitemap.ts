import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://complynext.nevinbali.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/login", "/signup", "/privacy"];
  return pages.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: p === "/" ? 1 : 0.6,
  }));
}
