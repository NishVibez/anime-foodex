import type { Metadata } from "next";

import { PostForm } from "@/components/community/post-form";

export const metadata: Metadata = {
  title: "Share a cook",
  robots: { index: false, follow: false },
};

export default function NewPostPage() {
  return (
    <section className="paper-grid min-h-[75dvh] px-5 py-12">
      <div className="mx-auto max-w-xl">
        <PostForm />
        <p className="mt-6 text-center text-xs leading-relaxed text-[var(--ink-faint)]">
          Do not upload franchise artwork, screenshots, cookbook pages,
          identifiable minors, private information, or media you do not own. The
          first three contributions always require owner approval.
        </p>
      </div>
    </section>
  );
}
