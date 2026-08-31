"use client";

import { FolderPlus, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CollectionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  if (!open)
    return (
      <Button onClick={() => setOpen(true)} variant="outline">
        <FolderPlus size={16} /> New private collection
      </Button>
    );
  return (
    <form
      className="grid gap-3 rounded-2xl border bg-[var(--paper-raised)] p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/community/collections", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: form.get("title"),
            description: form.get("description"),
          }),
        });
        const result = (await response.json()) as { error?: string };
        setMessage(
          response.ok
            ? "Collection created."
            : (result.error ?? "Collection could not be created."),
        );
        setBusy(false);
        if (response.ok) {
          event.currentTarget.reset();
          router.refresh();
        }
      }}
    >
      <label className="grid gap-1 text-xs font-black">
        Title
        <input
          className="min-h-11 rounded-xl border bg-[var(--paper)] px-3 text-sm font-normal"
          maxLength={100}
          name="title"
          required
        />
      </label>
      <label className="grid gap-1 text-xs font-black">
        Description
        <textarea
          className="min-h-20 rounded-xl border bg-[var(--paper)] p-3 text-sm font-normal"
          maxLength={1000}
          name="description"
        />
      </label>
      <div className="flex gap-2">
        <Button disabled={busy} type="submit" variant="jade">
          {busy ? (
            <LoaderCircle className="animate-spin" size={16} />
          ) : (
            <FolderPlus size={16} />
          )}{" "}
          Create
        </Button>
        <Button onClick={() => setOpen(false)} type="button" variant="ghost">
          Cancel
        </Button>
      </div>
      {message ? (
        <p
          aria-live="polite"
          className="text-xs font-bold text-[var(--ink-faint)]"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
