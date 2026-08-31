import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CookingMode } from "@/components/cooking/cooking-mode";
import { requireViewer } from "@/lib/auth/viewer";
import { getAuthorizedRecipe } from "@/lib/catalog/authorized-recipe";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cooking mode",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function CookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const viewer = await requireViewer(`/cook/${encodeURIComponent(slug)}`);
  const recipe = await getAuthorizedRecipe(slug);
  if (!recipe) notFound();
  return <CookingMode ownerId={viewer.id} recipe={recipe} />;
}
