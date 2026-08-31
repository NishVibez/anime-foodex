"use client";

import { ImagePlus, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function PostForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/community/posts", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });
    const result = (await response.json()) as {
      state?: string;
      error?: string;
      ownerReview?: boolean;
    };
    setMessage(
      response.ok
        ? `Post saved as ${result.state}${result.ownerReview ? " · owner review required" : ""}.`
        : (result.error ?? "Post could not be submitted."),
    );
    setLoading(false);
  }
  return (
    <form
      className="rounded-3xl border border-[var(--ink)] bg-[var(--paper-raised)] p-6 shadow-[6px_6px_0_var(--ink)]"
      onSubmit={(event) => void submit(event)}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-[var(--jade)] text-white">
          <ShieldCheck size={20} />
        </span>
        <div>
          <h1 className="font-black">Share a cook</h1>
          <p className="text-xs text-[var(--ink-faint)]">
            Every photo is quarantined, re-encoded, and moderated.
          </p>
        </div>
      </div>
      <label className="mt-6 block">
        <span className="sr-only">Post text</span>
        <textarea
          className="min-h-36 w-full resize-y rounded-xl border bg-[var(--paper)] p-4 outline-none focus:border-[var(--ink)]"
          maxLength={2000}
          name="body"
          placeholder="What did you cook? Add a useful note…"
          required
        />
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex min-h-12 items-center gap-2 rounded-xl border bg-[var(--paper)] px-4 text-sm font-bold">
          <ImagePlus size={17} /> Photo{" "}
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            name="photo"
            type="file"
          />
        </label>
        <label>
          <span className="sr-only">Visibility</span>
          <select
            className="min-h-12 w-full rounded-xl border bg-[var(--paper)] px-4 font-bold"
            name="visibility"
          >
            <option value="public">Public</option>
            <option value="followers">Followers</option>
            <option value="private">Private</option>
          </select>
        </label>
      </div>
      <label className="mt-3 block">
        <span className="sr-only">Photo description</span>
        <input
          className="min-h-11 w-full rounded-xl border bg-[var(--paper)] px-4 text-sm"
          maxLength={300}
          name="altText"
          placeholder="Describe the food photo for accessibility"
        />
      </label>
      <Button
        className="mt-5 w-full"
        disabled={loading}
        type="submit"
        variant="vermilion"
      >
        {loading ? (
          <LoaderCircle className="animate-spin" size={17} />
        ) : (
          <Send size={17} />
        )}{" "}
        Submit for moderation
      </Button>
      {message ? (
        <p aria-live="polite" className="mt-4 text-center text-sm font-bold">
          {message}
        </p>
      ) : null}
    </form>
  );
}
