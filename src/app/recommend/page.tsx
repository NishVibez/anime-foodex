import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";
import { RecommendationStudio } from "@/components/recommendation/recommendation-studio";

export const metadata: Metadata = {
  title: "What should I eat?",
  description:
    "Match your pantry, mood, time, skill, region, and dietary needs with a fandom dish you can cook tonight.",
  alternates: { canonical: "/recommend" },
};

export default function RecommendPage() {
  return (
    <>
      <PageIntro
        description="Add what you have, your mood, your time, and your dietary needs. Get two best matches plus one safe wildcard—and understand why each one fits."
        eyebrow="What should I eat?"
        title="Turn what you have into what you want."
        tone="saffron"
      />
      <section className="mx-auto max-w-[95rem] px-5 py-10 sm:px-8 sm:py-14">
        <RecommendationStudio />
      </section>
    </>
  );
}
