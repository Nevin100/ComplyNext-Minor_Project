import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://complynext.nevinbali.me";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/signup", "/privacy"],
      // app ke andar ke pages login ke peeche hain — crawler ka wahan kaam nahi
      disallow: [
        "/dashboard",
        "/classify",
        "/circulars",
        "/search",
        "/policy-check",
        "/audit",
        "/company",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
