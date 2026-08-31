import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Utensils } from "lucide-react";

import { FeedActions } from "@/components/community/feed-actions";
import { PageIntro } from "@/components/layout/page-intro";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Following feed",
  robots: { index: false, follow: false },
};

export default async function FeedPage() {
  const { data } = await (
    await createClient()
  )
    .from("following_feed")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return (
    <>
      <PageIntro
        description="A reverse-chronological feed from people you follow. No algorithmic outrage loop, DMs, live chat, or unreviewed recipe publishing."
        eyebrow="Community"
        title="Around your table"
        tone="jade"
      />
      <section className="mx-auto grid max-w-4xl gap-5 px-5 py-12 sm:px-8">
        {(data ?? []).map((item) => (
          <article
            className="overflow-hidden rounded-3xl border bg-[var(--paper-raised)]"
            key={item.id}
          >
            <header className="flex items-center gap-3 p-5">
              <span className="grid size-11 place-items-center rounded-full border border-[var(--ink)] bg-[var(--jade)] font-black text-white">
                {item.display_name[0]}
              </span>
              <div>
                <Link
                  className="font-black hover:underline"
                  href={`/profiles/${item.username}`}
                >
                  @{item.username}
                </Link>
                <p className="text-xs text-[var(--ink-faint)]">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </header>
            <div className="halftone grid min-h-52 place-items-center border-y bg-[var(--paper-deep)] p-8">
              <span className="grid size-24 place-items-center rounded-full border-2 border-[var(--ink)] bg-[var(--paper-raised)] shadow-[6px_6px_0_var(--ink)]">
                <Utensils size={36} />
              </span>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed">{item.body}</p>
              <div className="mt-5 border-t pt-4 text-xs font-bold">
                <div className="mb-3 flex items-center gap-2 text-[var(--ink-faint)]">
                  <MessageCircle size={15} /> {item.comment_count} comments
                </div>
                <FeedActions
                  initialReactions={item.reaction_count}
                  postId={item.id}
                />
              </div>
            </div>
          </article>
        ))}
        {!data?.length ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="display text-3xl">Your table is quiet.</p>
            <p className="mt-2 text-sm text-[var(--ink-faint)]">
              Follow eligible public profiles or publish an approved cook post
              to begin.
            </p>
          </div>
        ) : null}
      </section>
    </>
  );
}
