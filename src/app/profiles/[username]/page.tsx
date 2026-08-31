import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileActions } from "@/components/community/profile-actions";
import { PageIntro } from "@/components/layout/page-intro";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}`, robots: { index: true, follow: true } };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  let profile: {
    user_id: string;
    username: string;
    display_name: string;
    bio: string;
  } | null = null;
  try {
    const result = await (
      await createClient()
    )
      .from("public_profiles")
      .select("user_id,username,display_name,bio")
      .eq("username", username.toLowerCase())
      .maybeSingle();
    profile = result.data;
  } catch {
    profile = null;
  }
  if (!profile) notFound();
  return (
    <>
      <PageIntro
        description={profile.bio || "This cook has not written a bio yet."}
        eyebrow={`@${profile.username}`}
        title={profile.display_name}
        tone="jade"
      />
      <section className="mx-auto grid max-w-4xl gap-6 px-5 py-12 sm:px-8">
        <div className="rounded-3xl border bg-[var(--paper-raised)] p-6">
          <p className="eyebrow text-[var(--ink-faint)]">Public profile</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
            Cook posts, reviews, and shared collections appear here only after
            moderation and according to this profile&apos;s visibility. Age,
            country, email, billing identity, and consent history are never
            public.
          </p>
          <div className="mt-6">
            <ProfileActions userId={profile.user_id} />
          </div>
        </div>
      </section>
    </>
  );
}
