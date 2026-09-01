import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageIntro } from "@/components/layout/page-intro";
import { CatalogExplorer } from "@/components/recipes/catalog-explorer";
import {
  collections,
  featuredRecipes,
  type CollectionKey,
} from "@/content/experience";

type CollectionPageProps = PageProps<"/collections/[kind]">;

export function generateStaticParams() {
  return collections.map(({ key }) => ({ kind: key }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { kind } = await params;
  const collection = collections.find((item) => item.key === kind);
  if (!collection) return {};
  return {
    title: collection.label,
    description: `${collection.label} recipes and verified food appearances in Anime FooDex.`,
    alternates: { canonical: `/collections/${collection.key}` },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { kind } = await params;
  const collection = collections.find((item) => item.key === kind);
  if (!collection) notFound();

  const recipes = featuredRecipes.filter(
    (recipe) => recipe.kind === (kind as CollectionKey),
  );

  return (
    <>
      <PageIntro
        description={`${collection.eyebrow}. Browse the featured dishes, see the world each one comes from, and sort your next cooking adventure by time or difficulty.`}
        eyebrow="Explore the collection"
        title={collection.label}
      />
      <section className="mx-auto max-w-[95rem] px-5 py-12 sm:px-8 sm:py-16">
        <CatalogExplorer recipes={recipes} />
      </section>
    </>
  );
}
