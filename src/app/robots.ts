import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/recipes/",
        "/collections/",
        "/discover",
        "/works",
        "/dishes",
        "/ingredients",
        "/policies/",
      ],
      disallow: [
        "/api/",
        "/auth/",
        "/billing/",
        "/cook/",
        "/feed",
        "/post/",
        "/quests",
        "/settings",
        "/studio",
        "/vault",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
