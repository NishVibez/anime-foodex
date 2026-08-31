"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/browser";
import {
  bindOfflineEntitlement,
  bindOfflineOwner,
  pendingProgressEvents,
  purgePrivateOfflineData,
  removeProgressEvent,
} from "@/lib/offline/store";

let syncing = false;

async function refreshOfflineContext(ownerId: string) {
  const response = await fetch("/api/account/offline-context", {
    cache: "no-store",
  });
  if (!response.ok) {
    await purgePrivateOfflineData();
    return null;
  }
  const context = (await response.json()) as {
    ownerId: string;
    entitlementId: string;
  };
  if (context.ownerId !== ownerId) {
    await purgePrivateOfflineData();
    return null;
  }
  await bindOfflineOwner(ownerId);
  await bindOfflineEntitlement(ownerId, context.entitlementId);
  return context;
}

async function flushOutbox(ownerId: string) {
  if (syncing || !navigator.onLine) return;
  syncing = true;
  try {
    if (!(await refreshOfflineContext(ownerId))) return;
    const events = await pendingProgressEvents(ownerId);
    for (const event of events) {
      if (event.kind !== "cook_completed") continue;
      const response = await fetch("/api/cooks/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event.payload),
      });
      if (response.ok) await removeProgressEvent(event.idempotencyKey, ownerId);
      if (response.status === 401 || response.status === 403) {
        await purgePrivateOfflineData();
        break;
      }
    }
  } catch {
    // IndexedDB and network failures leave the owner-bound outbox untouched.
  } finally {
    syncing = false;
  }
}

export function OfflineSync() {
  useEffect(() => {
    let activeOwnerId: string | null = null;
    let unsubscribe: () => void = () => undefined;

    const reconcile = () => {
      if (activeOwnerId) void flushOutbox(activeOwnerId);
    };

    try {
      const supabase = createClient();
      void supabase.auth.getSession().then(async ({ data }) => {
        activeOwnerId = data.session?.user.id ?? null;
        await bindOfflineOwner(activeOwnerId);
        reconcile();
      });
      const listener = supabase.auth.onAuthStateChange((_event, session) => {
        activeOwnerId = session?.user.id ?? null;
        void bindOfflineOwner(activeOwnerId).then(reconcile);
      });
      unsubscribe = () => listener.data.subscription.unsubscribe();
    } catch {
      // Missing local Supabase configuration leaves offline private state inert.
    }

    window.addEventListener("online", reconcile);
    return () => {
      unsubscribe();
      window.removeEventListener("online", reconcile);
    };
  }, []);

  return null;
}
