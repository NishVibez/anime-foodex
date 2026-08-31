"use client";

import { Flag, LoaderCircle, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ProfileActions({ userId }: { userId: string }) {
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function action(payload: Record<string, unknown>) {
    setBusy(true);
    const response = await fetch("/api/community/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!response.ok)
      setMessage(
        "Sign in with a socially eligible account to use this action.",
      );
    return response.ok;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        disabled={busy}
        onClick={async () => {
          const next = !following;
          if (await action({ kind: "follow", targetId: userId, active: next }))
            setFollowing(next);
        }}
        variant={following ? "outline" : "jade"}
      >
        {busy ? (
          <LoaderCircle className="animate-spin" size={16} />
        ) : following ? (
          <UserMinus size={16} />
        ) : (
          <UserPlus size={16} />
        )}
        {following ? "Following" : "Follow"}
      </Button>
      <Button
        disabled={busy}
        onClick={async () => {
          if (
            !window.confirm(
              "Block this profile and remove follows in both directions?",
            )
          )
            return;
          if (await action({ kind: "block", targetId: userId, active: true }))
            setMessage("Profile blocked.");
        }}
        variant="outline"
      >
        Block
      </Button>
      <Button
        disabled={busy}
        onClick={async () => {
          if (
            await action({
              kind: "report",
              targetId: userId,
              targetType: "profile",
              reason: "other",
              detail: "Profile submitted for owner review.",
            })
          )
            setMessage("Report sent to the owner queue.");
        }}
        variant="ghost"
      >
        <Flag size={16} /> Report
      </Button>
      {message ? (
        <p
          aria-live="polite"
          className="w-full text-xs font-bold text-[var(--ink-faint)]"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
