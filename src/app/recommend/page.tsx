import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";
import { RecommendationStudio } from "@/components/recommendation/recommendation-studio";

export const metadata: Metadata = {
  title: "What should I eat?",
  description:
    "Get deterministic, safety-constrained fandom food recommendations from your pantry, mood, time, skill, and region.",
  alternates: { canonical: "/recommend" },
};

export default function RecommendPage() {
  return (
    <>
      <PageIntro
        description="A deterministic recommendation—not a generated recipe. Safety constraints remove unsuitable dishes; pantry fit, mood, time, skill, and regional availability rank what remains."
        eyebrow="What should I eat?"
        title="Your pantry has a plot twist."
        tone="saffron"
      />
      <section className="mx-auto max-w-[95rem] px-5 py-10 sm:px-8 sm:py-14">
        <RecommendationStudio />
      </section>
    </>
  );
}
