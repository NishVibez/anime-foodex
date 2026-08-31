"use client";

import { Check } from "lucide-react";
import { useState } from "react";

export function NotificationButton({
  notificationId,
  initiallyRead,
}: {
  notificationId: string;
  initiallyRead: boolean;
}) {
  const [read, setRead] = useState(initiallyRead);
  return (
    <button
      className="rounded-full border px-3 py-1.5 text-xs font-black disabled:opacity-50"
      disabled={read}
      onClick={async () => {
        const response = await fetch("/api/community/actions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            kind: "notification_read",
            targetId: notificationId,
          }),
        });
        if (response.ok) setRead(true);
      }}
      type="button"
    >
      <Check className="mr-1 inline" size={13} /> {read ? "Read" : "Mark read"}
    </button>
  );
}
