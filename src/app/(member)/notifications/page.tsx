import type { Metadata } from "next";

import { NotificationButton } from "@/components/community/notification-button";
import { PageIntro } from "@/components/layout/page-intro";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const { data } = await (
    await createClient()
  )
    .from("my_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return (
    <>
      <PageIntro
        description="Catch up on reactions, cooking milestones, quest rewards, account updates, and anything else that happened while you were away."
        eyebrow="What you missed"
        title="Notifications"
        tone="saffron"
      />
      <section className="mx-auto grid max-w-4xl gap-3 px-5 py-12 sm:px-8">
        {(data ?? []).map((item) => (
          <article
            className="flex items-start gap-4 rounded-2xl border bg-[var(--paper-raised)] p-5"
            key={item.id}
          >
            <div>
              <p className="font-black capitalize">
                {item.kind.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-faint)]">
                {item.object_type} ·{" "}
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
            <div className="ml-auto">
              <NotificationButton
                initiallyRead={Boolean(item.read_at)}
                notificationId={item.id}
              />
            </div>
          </article>
        ))}
        {!data?.length ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-[var(--ink-faint)]">
            Nothing needs your attention.
          </p>
        ) : null}
      </section>
    </>
  );
}
