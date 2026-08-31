/* Anime FooDex offline shell and account-bound authorized kitchen cache. */
const VERSION = "foodex-v2";
const PUBLIC_CACHE = `${VERSION}-public`;
const PRIVATE_CACHE = `${VERSION}-authorized`;
const CONTEXT_URL = "/__foodex/private-context";
const PUBLIC_SHELL = [
  "/",
  "/discover",
  "/recipes",
  "/recommend",
  "/offline",
  "/foodex-icon.svg",
];
const PRIVATE_PREFIXES = [
  "/vault",
  "/feed",
  "/quests",
  "/settings",
  "/studio",
  "/cook/",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PUBLIC_CACHE).then((cache) => cache.addAll(PUBLIC_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("foodex-") &&
                ![PUBLIC_CACHE, PRIVATE_CACHE].includes(key),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

async function readPrivateContext() {
  const cache = await caches.open(PRIVATE_CACHE);
  const response = await cache.match(CONTEXT_URL);
  if (!response) return null;
  try {
    const context = await response.json();
    return typeof context.ownerId === "string" &&
      typeof context.entitlementId === "string"
      ? context
      : null;
  } catch {
    return null;
  }
}

async function setPrivateContext(ownerId, entitlementId) {
  const previous = await readPrivateContext();
  if (
    previous &&
    (previous.ownerId !== ownerId || previous.entitlementId !== entitlementId)
  ) {
    await caches.delete(PRIVATE_CACHE);
  }
  const cache = await caches.open(PRIVATE_CACHE);
  await cache.put(
    CONTEXT_URL,
    new Response(JSON.stringify({ ownerId, entitlementId }), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    }),
  );
}

function responseBinding(response) {
  return {
    ownerId: response.headers.get("x-foodex-offline-owner"),
    entitlementId: response.headers.get("x-foodex-offline-entitlement"),
    leaseExpiresAt: Number(
      response.headers.get("x-foodex-offline-lease-expires"),
    ),
    allowed: response.headers.get("x-foodex-offline-allowed") === "1",
  };
}

async function cacheAuthorizedResponse(request, response) {
  const binding = responseBinding(response);
  if (
    !response.ok ||
    !binding.allowed ||
    !binding.ownerId ||
    !binding.entitlementId ||
    !Number.isFinite(binding.leaseExpiresAt) ||
    binding.leaseExpiresAt <= Date.now()
  )
    return false;

  await setPrivateContext(binding.ownerId, binding.entitlementId);
  const cache = await caches.open(PRIVATE_CACHE);
  await cache.put(request, response.clone());
  return true;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/offline/recipes/")) {
    event.respondWith(
      fetch(request, { credentials: "include", cache: "no-store" })
        .then(async (response) => {
          if (response.status === 401 || response.status === 403) {
            await caches.delete(PRIVATE_CACHE);
            return response;
          }
          await cacheAuthorizedResponse(request, response);
          return response;
        })
        .catch(async () => {
          const context = await readPrivateContext();
          const cache = await caches.open(PRIVATE_CACHE);
          const cached = await cache.match(request);
          if (!context || !cached)
            return new Response(
              JSON.stringify({ error: "Recipe is not saved offline." }),
              { status: 503, headers: { "content-type": "application/json" } },
            );
          const binding = responseBinding(cached);
          if (
            binding.ownerId !== context.ownerId ||
            binding.entitlementId !== context.entitlementId ||
            !Number.isFinite(binding.leaseExpiresAt) ||
            binding.leaseExpiresAt <= Date.now()
          ) {
            await cache.delete(request);
            return new Response(
              JSON.stringify({
                error: "The offline entitlement lease expired.",
              }),
              { status: 401, headers: { "content-type": "application/json" } },
            );
          }
          return cached;
        }),
    );
    return;
  }

  if (url.pathname.startsWith("/api/") || isPrivatePath(url.pathname)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(PUBLIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match("/offline"));
      return cached || network;
    }),
  );
});

self.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type === "PURGE_PRIVATE") {
    event.waitUntil(caches.delete(PRIVATE_CACHE));
    return;
  }

  if (
    message.type === "SET_OFFLINE_CONTEXT" &&
    typeof message.ownerId === "string" &&
    typeof message.entitlementId === "string"
  ) {
    event.waitUntil(setPrivateContext(message.ownerId, message.entitlementId));
    return;
  }

  if (
    message.type === "SET_OFFLINE_OWNER" &&
    typeof message.ownerId === "string"
  ) {
    event.waitUntil(
      readPrivateContext().then((context) => {
        if (context && context.ownerId !== message.ownerId)
          return caches.delete(PRIVATE_CACHE);
        return undefined;
      }),
    );
    return;
  }

  if (
    message.type === "CACHE_AUTHORIZED_RECIPE" &&
    typeof message.url === "string" &&
    typeof message.ownerId === "string"
  ) {
    const url = new URL(message.url, self.location.origin);
    if (
      url.origin !== self.location.origin ||
      !url.pathname.startsWith("/api/offline/recipes/")
    )
      return;

    event.waitUntil(
      fetch(url.href, { credentials: "include", cache: "no-store" }).then(
        async (response) => {
          const binding = responseBinding(response);
          if (binding.ownerId !== message.ownerId) return;
          await cacheAuthorizedResponse(url.href, response);
        },
      ),
    );
  }
});
