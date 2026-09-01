import type { Metadata } from "next";

import { SuggestionForm } from "@/components/community/suggestion-form";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Suggest a recipe",
  robots: { index: false, follow: false },
};

export default function SuggestRecipePage() {
  return (
    <>
      <PageIntro
        description="Spotted a dish we should cover? Tell us the title, where it appears, and why fans remember it. Our editors will verify the moment before anything is published."
        eyebrow="Help grow the FooDex"
        title="What should we cook next?"
      />
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <SuggestionForm />
      </section>
    </>
  );
}
