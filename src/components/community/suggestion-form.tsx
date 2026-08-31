"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function SuggestionForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  return (
    <form
      className="grid gap-5 rounded-3xl border bg-[var(--paper-raised)] p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/community/suggestions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: form.get("title"),
            sourceDeclaration: form.get("sourceDeclaration"),
            context: form.get("context"),
            licenseAccepted: form.get("licenseAccepted") === "on",
          }),
        });
        const result = (await response.json()) as {
          error?: string;
          submissionId?: string;
        };
        setMessage(
          response.ok
            ? `Suggestion ${result.submissionId} entered owner review.`
            : (result.error ?? "Suggestion could not be submitted."),
        );
        if (response.ok) event.currentTarget.reset();
        setBusy(false);
      }}
    >
      <label className="grid gap-2 text-sm font-black">
        Dish or food moment
        <input
          className="min-h-12 rounded-xl border bg-[var(--paper)] px-4 font-normal"
          maxLength={150}
          name="title"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-black">
        Source declaration
        <textarea
          className="min-h-32 rounded-xl border bg-[var(--paper)] p-4 font-normal"
          maxLength={3000}
          minLength={10}
          name="sourceDeclaration"
          placeholder="Name the work and give a precise episode, scene, chapter, quest, or park/menu locator. Do not upload scans or screenshots."
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-black">
        Why it belongs
        <textarea
          className="min-h-28 rounded-xl border bg-[var(--paper)] p-4 font-normal"
          maxLength={2000}
          name="context"
        />
      </label>
      <label className="flex items-start gap-3 rounded-xl border bg-[var(--paper-deep)] p-4 text-xs leading-relaxed">
        <input
          className="mt-1"
          name="licenseAccepted"
          required
          type="checkbox"
        />
        <span>
          I wrote this submission and grant Anime FooDex a non-exclusive license
          to review, edit, publish, display, and remove it. I have not included
          copied instructions, scans, screenshots, franchise artwork, private
          information, or media I do not control.
        </span>
      </label>
      <Button disabled={busy} type="submit" variant="vermilion">
        {busy ? (
          <LoaderCircle className="animate-spin" size={17} />
        ) : (
          <Send size={17} />
        )}{" "}
        Send to owner review
      </Button>
      {message ? (
        <p aria-live="polite" className="text-sm font-bold text-[var(--jade)]">
          {message}
        </p>
      ) : null}
    </form>
  );
}
