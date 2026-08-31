import { Crown, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { requireViewer } from "@/lib/auth/viewer";

export const dynamic = "force-dynamic";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await requireViewer("/vault");
  return (
    <>
      <div className="border-b border-[var(--line)] bg-[var(--jade-soft)]">
        <div className="mx-auto flex max-w-[95rem] items-center gap-3 px-5 py-2 text-xs font-bold sm:px-8">
          <ShieldCheck className="text-[var(--jade)]" size={15} />
          Private account space
          <Badge
            className="ml-auto"
            tone={viewer.accessTier === "supporter" ? "saffron" : "jade"}
          >
            {viewer.accessTier === "supporter" ? (
              <Crown className="mr-1" size={11} />
            ) : null}
            {viewer.accessTier}
          </Badge>
        </div>
      </div>
      {children}
    </>
  );
}
