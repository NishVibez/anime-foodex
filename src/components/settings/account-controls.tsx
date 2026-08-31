"use client";

import { Download, LoaderCircle, LogOut, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { purgePrivateOfflineData } from "@/lib/offline/store";

export function AccountControls() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function downloadExport() {
    setBusy("export");
    const response = await fetch("/api/account/export", { method: "POST" });
    if (!response.ok) setMessage("Your export could not be generated.");
    else {
      const href = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = href;
      link.download = `anime-foodex-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(href);
      setMessage("Your private JSON export was generated locally.");
    }
    setBusy(null);
  }

  async function signOut() {
    setBusy("logout");
    const response = await fetch("/api/account/logout", { method: "POST" });
    if (!response.ok) {
      setMessage("Sign out could not be completed.");
      setBusy(null);
      return;
    }
    await purgePrivateOfflineData();
    router.replace("/");
    router.refresh();
  }

  async function requestDeletion() {
    if (
      !window.confirm(
        "Request account deletion? Your public content will be hidden immediately and you will be signed out.",
      )
    )
      return;
    setBusy("delete");
    const response = await fetch("/api/account/delete", { method: "POST" });
    if (!response.ok) {
      setMessage("The deletion request could not be recorded.");
      setBusy(null);
      return;
    }
    await purgePrivateOfflineData();
    router.replace("/login?deleted=requested");
    router.refresh();
  }

  async function withdrawAds() {
    setBusy("consent");
    const response = await fetch("/api/account/ad-consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ granted: false }),
    });
    setMessage(
      response.ok
        ? "Personalized-ad consent is withdrawn. Contextual ads may still appear for free accounts."
        : "The consent change could not be recorded.",
    );
    setBusy(null);
  }

  return (
    <div className="grid gap-4">
      <section className="flex items-start gap-4 rounded-2xl border bg-[var(--paper-raised)] p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--wash)]">
          <Shield size={18} />
        </span>
        <div>
          <h2 className="font-black">Advertising consent</h2>
          <p className="mt-1 text-xs text-[var(--ink-faint)]">
            Withdrawal is append-only and takes effect on the next ad decision.
          </p>
        </div>
        <Button
          className="ml-auto"
          disabled={Boolean(busy)}
          onClick={() => void withdrawAds()}
          size="sm"
          variant="outline"
        >
          Withdraw
        </Button>
      </section>
      <section className="grid gap-4 rounded-2xl border bg-[var(--paper-raised)] p-5 sm:grid-cols-2">
        <div>
          <h2 className="font-black">Your data</h2>
          <p className="mt-2 text-xs leading-relaxed text-[var(--ink-faint)]">
            Export is generated from your authenticated records. Deletion hides
            public content and enters the audited provider-cleanup queue.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-2 sm:justify-end">
          <Button
            disabled={Boolean(busy)}
            onClick={() => void downloadExport()}
            variant="outline"
          >
            {busy === "export" ? (
              <LoaderCircle className="animate-spin" size={16} />
            ) : (
              <Download size={16} />
            )}{" "}
            Export
          </Button>
          <Button
            disabled={Boolean(busy)}
            onClick={() => void signOut()}
            variant="ghost"
          >
            {busy === "logout" ? (
              <LoaderCircle className="animate-spin" size={16} />
            ) : (
              <LogOut size={16} />
            )}{" "}
            Sign out
          </Button>
          <Button
            disabled={Boolean(busy)}
            onClick={() => void requestDeletion()}
            variant="ghost"
          >
            {busy === "delete" ? (
              <LoaderCircle className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} />
            )}{" "}
            Request deletion
          </Button>
        </div>
      </section>
      {message ? (
        <p
          aria-live="polite"
          className="text-center text-sm font-bold text-[var(--jade)]"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
