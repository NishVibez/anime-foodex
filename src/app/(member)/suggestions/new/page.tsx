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
        description="Suggest a food moment with a precise source declaration. Every submission is moderated and owner-reviewed; it never publishes directly."
        eyebrow="Editorial intake"
        title="Bring us a lead."
      />
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <SuggestionForm />
      </section>
    </>
  );
}
