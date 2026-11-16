/* Lab Inventory service worker.
   The VERSION constant below is replaced by scripts/generate-sw.mjs on every build, so a
 * new deploy always produces a byte-different sw.js and the browser installs it.
 *
 * Caches:
 *   lab-shell-<v>   precache: app shell pages + built JS/CSS + icons (versioned)
 *   lab-pages-<v>   pages visited at runtime, network-first      (versioned, max 30)
 *   lab-api-v1      public API GET responses, network-first      (max 50)
 *   lab-assets-v1   images/fonts/icons, cache-first               (max 60)
 */
const VERSION = "__BUILD_VERSION__";
const SHELL = `lab-shell-${VERSION}`;
const PAGES = `lab-pages-${VERSION}`;
const API = "lab-api-v1";
const ASSETS = "lab-assets-v1";
const CURRENT = [SHELL, PAGES, API, ASSETS];

const MAX_PAGES = 30;
const MAX_API = 50;
const MAX_ASSETS = 60;
const NETWORK_TIMEOUT_MS = 4000;

// Pages fetched at install time. Their HTML is parsed for /_next/static URLs,
// which are precached too, so the shell works offline right after install.
const SHELL_PAGES = ["/", "/offline", "/items", "/dashboard", "/about", "/login", "/signup"];
const SHELL_FILES = [
  "/manifest.json",
  "/lab.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];
// Public data worth having offline from the very first visit.
const API_WARM = ["/api/items"];

const CHUNK_REF_RE = /static\/chunks\/[A-Za-z0-9_\-.~]+\.(?:js|css)/g;
const ASSET_URL_RE = /\/_next\/static\/[A-Za-z0-9_\-./%~]+\.(?:js|css|woff2?)/g;

self.addEventListener("install", (event) => {
  // No skipWaiting() here: the page shows an "Update available" button and
  // asks us to activate (see the SKIP_WAITING message below).
  event.waitUntil(precache());
});

async function precache() {
  const shell = await caches.open(SHELL);
  const assetUrls = new Set();

  await Promise.all(
    SHELL_PAGES.map(async (url) => {
      const response = await fetch(url, { cache: "reload" });
      if (!response.ok) throw new Error(`Precache failed: ${url}`);
      const html = await response.clone().text();
      (html.match(ASSET_URL_RE) || []).forEach((u) => assetUrls.add(u));
      await shell.put(url, response);
    }),
  );

  // Full list of built files (written by scripts/generate-precache.mjs after the
  // build). This covers lazy-loaded route chunks that are not in the HTML.
  try {
    const res = await fetch("/_next/static/precache-manifest.json", { cache: "reload" });
    if (res.ok) (await res.json()).forEach((u) => assetUrls.add(u));
  } catch {
    // Optional: fall back to the URLs found in the HTML.
  }

  // Fetch every asset, and scan each JS file for references to further chunks
  // (lazy route chunks are only mentioned inside other chunks, not in the HTML).
  const queue = [...assetUrls, ...SHELL_FILES];
  const seen = new Set(queue);
  while (queue.length && seen.size < 400) {
    const batch = queue.splice(0, 12);
    await Promise.allSettled(
      batch.map(async (url) => {
        const response = await fetch(url, { cache: "reload" });
        if (!response.ok) return;
        if (url.endsWith(".js")) {
          const code = await response.clone().text();
          for (const m of code.match(CHUNK_REF_RE) || []) {
            const found = "/_next/" + m;
            if (!seen.has(found)) {
              seen.add(found);
              queue.push(found);
            }
          }
        }
        await shell.put(url, response);
      }),
    );
  }

  const api = await caches.open(API);
  await Promise.allSettled(
    API_WARM.map(async (url) => {
      const response = await fetch(url, { cache: "reload" });
      if (response.ok) await api.put(url, response);
    }),
  );
}

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Remove every outdated cache that belongs to this app.
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("lab-") && !CURRENT.includes(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Cross-origin (Firebase auth, Google APIs, ...) is never touched: auth
  // responses and tokens must not end up in a shared cache.
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js" || url.pathname.startsWith("/__/")) return;
  if (request.headers.has("authorization")) return;

  // Next.js client-side navigation (RSC payloads): let it go to the network.
  // If it fails, Next falls back to a real navigation, handled below.
  if (request.headers.get("rsc") || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request, url));
  } else if (url.pathname.startsWith("/api/items")) {
    event.respondWith(networkFirst(request, API, MAX_API));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, SHELL));
  } else if (isStaticAsset(request, url)) {
    event.respondWith(cacheFirst(request, ASSETS, MAX_ASSETS));
  }
});

function isStaticAsset(request, url) {
  return (
    ["image", "font"].includes(request.destination) ||
    /\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?)$/.test(url.pathname) ||
    url.pathname === "/manifest.json"
  );
}

// ---- strategies ----

// Cache-first: static assets never change for a given URL.
async function cacheFirst(request, cacheName, max) {
  const cached = await caches.match(request, { ignoreVary: true });
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      if (max) await trim(cacheName, max);
    }
    return response;
  } catch {
    return Response.error();
  }
}

// Network-first with a timeout; falls back to the cache. When the cache answers
// we tag the response so the UI can say "you are viewing saved data".
async function networkFirst(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);
    if (response.ok) {
      await cache.delete(request);
      await cache.put(request, response.clone());
      await trim(cacheName, max);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return tag(cached);
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleNavigation(request, url) {
  try {
    const response = await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);
    // /profile is account-specific: never keep it in a shared cache.
    if (response.ok && url.pathname !== "/profile") {
      const cache = await caches.open(PAGES);
      await cache.delete(request);
      await cache.put(request, response.clone());
      await trim(PAGES, MAX_PAGES);
    }
    return response;
  } catch {
    const cached =
      (await caches.match(request, { ignoreSearch: true })) ||
      (await caches.match(url.pathname));
    if (cached) return cached;
    const offline = await caches.match("/offline");
    return offline || Response.error();
  }
}

// ---- helpers ----

function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

function tag(response) {
  const headers = new Headers(response.headers);
  headers.set("x-sw-cache", "hit");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Keep a cache bounded: delete the oldest entries beyond `max`.
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}
