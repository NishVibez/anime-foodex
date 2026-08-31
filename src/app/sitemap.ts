import type { MetadataRoute } from "next";

import { collections, featuredRecipes } from "@/content/experience";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ).origin;
  const paths = [
    "",
    "/recipes",
    "/collections",
    "/discover",
    "/works",
    "/dishes",
    "/ingredients",
    "/recommend",
    "/pricing",
    "/policies/editorial",
    "/policies/privacy",
    "/policies/terms",
    "/policies/takedown",
    ...collections.map((collection) => `/collections/${collection.key}`),
    ...featuredRecipes.map((recipe) => `/recipes/${recipe.slug}`),
  ];

  return paths.map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: path.startsWith("/recipes/") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/recipes/") ? 0.8 : 0.6,
  }));
}
