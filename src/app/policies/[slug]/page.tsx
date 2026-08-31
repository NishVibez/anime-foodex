import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCheck2, Mail } from "lucide-react";
import { notFound } from "next/navigation";

import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { policies, type PolicySlug } from "@/content/policies";

type PolicyPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = policies[slug as PolicySlug];
  if (!policy) return {};
  return {
    title: policy.title,
    description: policy.summary,
    alternates: { canonical: `/policies/${slug}` },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = policies[slug as PolicySlug];
  if (!policy) notFound();
  return (
    <>
      <PageIntro
        description={policy.summary}
        eyebrow="Trust center"
        title={policy.title}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article className="space-y-10">
          <div className="flex flex-wrap gap-2">
            <Badge tone="paper">Version 0.1</Badge>
            <Badge tone="saffron">Counsel review required before GA</Badge>
          </div>
          {policy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="display text-3xl">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--ink-muted)]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {"bullets" in section && section.bullets ? (
                  <ul className="grid gap-3">
                    {section.bullets.map((bullet) => (
                      <li className="flex items-start gap-3" key={bullet}>
                        <FileCheck2
                          className="mt-1 shrink-0 text-[var(--jade)]"
                          size={16}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </article>
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border bg-[var(--paper-raised)] p-5">
            <Mail className="text-[var(--vermilion)]" />
            <p className="mt-4 text-sm font-black">Need to contact us?</p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--ink-faint)]">
              The monitored support and legal address is a launch prerequisite
              and is not invented in this build.
            </p>
            <Link
              className="mt-4 inline-flex items-center gap-1 text-xs font-black underline"
              href="/studio"
            >
              Open request workflow <ArrowRight size={13} />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
