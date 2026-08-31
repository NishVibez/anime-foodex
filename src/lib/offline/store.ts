import "client-only";

import { openDB, type DBSchema } from "idb";

type CookingSession = {
  ownerId: string;
  recipeVersionId: string;
  stepIndex: number;
  timers: Array<{ id: string; endsAt: number; label: string }>;
  servings: number;
  updatedAt: number;
};

type OutboxEvent = {
  ownerId: string;
  idempotencyKey: string;
  kind: "cook_completed" | "progress_updated";
  payload: Record<string, unknown>;
  createdAt: number;
};

interface FoodexOfflineDb extends DBSchema {
  sessions: { key: string; value: CookingSession };
  outbox: {
    key: string;
    value: OutboxEvent;
    indexes: { "by-created-at": number };
  };
  entitlements: {
    key: string;
    value: {
      ownerId: string;
      entitlementId: string;
      expiresAt: number;
      tier: "member" | "supporter";
    };
  };
  meta: { key: string; value: string };
}

const database = () =>
  openDB<FoodexOfflineDb>("anime-foodex-offline", 2, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore("sessions", { keyPath: "recipeVersionId" });
        const outbox = db.createObjectStore("outbox", {
          keyPath: "idempotencyKey",
        });
        outbox.createIndex("by-created-at", "createdAt");
        db.createObjectStore("entitlements");
      }
      if (oldVersion < 2) {
        db.createObjectStore("meta");
        if (oldVersion > 0) {
          transaction.objectStore("sessions").clear();
          transaction.objectStore("outbox").clear();
          transaction.objectStore("entitlements").clear();
        }
      }
    },
  });

function postToServiceWorker(message: Record<string, unknown>) {
  navigator.serviceWorker.controller?.postMessage(message);
}

async function clearPrivateStores() {
  const db = await database();
  const transaction = db.transaction(
    ["sessions", "outbox", "entitlements"],
    "readwrite",
  );
  await Promise.all([
    transaction.objectStore("sessions").clear(),
    transaction.objectStore("outbox").clear(),
    transaction.objectStore("entitlements").clear(),
    transaction.done,
  ]);
}

export async function bindOfflineOwner(ownerId: string | null) {
  const db = await database();
  const previous = await db.get("meta", "ownerId");
  if (previous === ownerId) return;
  await clearPrivateStores();
  await db.delete("meta", "entitlementId");
  if (ownerId) await db.put("meta", ownerId, "ownerId");
  else await db.delete("meta", "ownerId");
  postToServiceWorker(
    ownerId
      ? { type: "SET_OFFLINE_OWNER", ownerId }
      : { type: "PURGE_PRIVATE" },
  );
}

export async function bindOfflineEntitlement(
  ownerId: string,
  entitlementId: string,
) {
  const db = await database();
  const previous = await db.get("meta", "entitlementId");
  if (previous !== entitlementId)
    await db.put("meta", entitlementId, "entitlementId");
  postToServiceWorker({
    type: "SET_OFFLINE_CONTEXT",
    ownerId,
    entitlementId,
  });
}

export async function saveCookingSession(session: CookingSession) {
  const db = await database();
  const ownerId = await db.get("meta", "ownerId");
  if (!ownerId || ownerId !== session.ownerId)
    throw new Error("Offline session owner does not match the active account.");
  return db.put("sessions", session);
}

export async function readCookingSession(
  recipeVersionId: string,
  ownerId: string,
) {
  const session = await (await database()).get("sessions", recipeVersionId);
  return session?.ownerId === ownerId ? session : undefined;
}

export async function queueProgressEvent(event: OutboxEvent) {
  const db = await database();
  const ownerId = await db.get("meta", "ownerId");
  if (!ownerId || ownerId !== event.ownerId)
    throw new Error("Offline event owner does not match the active account.");
  return db.put("outbox", event);
}

export async function pendingProgressEvents(ownerId: string) {
  const events = await (
    await database()
  ).getAllFromIndex("outbox", "by-created-at");
  return events.filter((event) => event.ownerId === ownerId);
}

export async function removeProgressEvent(
  idempotencyKey: string,
  ownerId: string,
) {
  const db = await database();
  const event = await db.get("outbox", idempotencyKey);
  if (event?.ownerId === ownerId) await db.delete("outbox", idempotencyKey);
}

export async function cacheAuthorizedRecipe(slug: string, ownerId: string) {
  if (!("serviceWorker" in navigator))
    throw new Error("Offline storage is unavailable in this browser.");
  const registration = await navigator.serviceWorker.ready;
  const worker = registration.active ?? navigator.serviceWorker.controller;
  if (!worker) throw new Error("Offline storage is not ready yet.");
  worker.postMessage({
    type: "CACHE_AUTHORIZED_RECIPE",
    ownerId,
    url: `/api/offline/recipes/${encodeURIComponent(slug)}`,
  });
}

export async function purgePrivateOfflineData() {
  const db = await database();
  await clearPrivateStores();
  await Promise.all([
    db.delete("meta", "ownerId"),
    db.delete("meta", "entitlementId"),
  ]);
  postToServiceWorker({ type: "PURGE_PRIVATE" });
}
