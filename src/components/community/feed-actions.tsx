"use client";

import { Flag, Heart } from "lucide-react";
import { useState } from "react";

export function FeedActions({
  postId,
  initialReactions,
}: {
  postId: string;
  initialReactions: number;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialReactions);
  const [message, setMessage] = useState<string | null>(null);
  async function send(payload: Record<string, unknown>) {
    return fetch("/api/community/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
  return (
    <div className="flex items-center gap-4">
      <button
        className="flex items-center gap-2"
        onClick={async () => {
          const next = !liked;
          const response = await send({
            kind: "react",
            targetId: postId,
            reaction: "like",
            active: next,
          });
          if (response.ok) {
            setLiked(next);
            setCount((value) => Math.max(0, value + (next ? 1 : -1)));
          }
        }}
        type="button"
      >
        <Heart fill={liked ? "currentColor" : "none"} size={17} /> {count}
      </button>
      <button
        className="ml-auto flex items-center gap-2 text-[var(--ink-faint)]"
        onClick={async () => {
          const response = await send({
            kind: "report",
            targetId: postId,
            targetType: "post",
            reason: "other",
            detail: "Post submitted for owner review.",
          });
          setMessage(response.ok ? "Reported" : "Unavailable");
        }}
        type="button"
      >
        <Flag size={15} /> {message ?? "Report"}
      </button>
    </div>
  );
}
