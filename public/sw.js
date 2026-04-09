/// <reference lib="webworker" />

/**
 * WardWise Collect — Service Worker
 *
 * Strategy overview:
 *   • Navigation / HTML  → network-only (never cache pages — Next.js handles its own revalidation)
 *   • API calls          → network-first, cache fallback for offline reads
 *   • /_next/static/*    → cache-first (filenames include content-hashes, so safe)
 *   • /brand/*           → stale-while-revalidate
 *
 * Bump CACHE_VERSION on each deploy so old caches are purged.
 * In a CI pipeline you can replace this token automatically:
 *   sed -i "s/__BUILD_ID__/$(git rev-parse --short HEAD)/" public/sw.js
 */

const CACHE_VERSION = "bc13946-1775699138502"; // replace at build time, or bump manually
const CACHE_NAME = `wardwise-collect-${CACHE_VERSION}`;

const PRECACHE_ASSETS = ["/brand/logomark-lagoon.svg"];

// ── Install: pre-cache critical assets ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)),
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

// ── Activate: purge every cache that isn't the current version ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ── Fetch handler ──
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip admin routes entirely — let the browser handle them normally
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api/admin")
  ) {
    return;
  }

  // ── API calls: network-first, offline cache fallback ──
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful GET responses for offline fallback
          if (event.request.method === "GET" && response.ok) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  // ── Next.js hashed static assets: cache-first ──
  // These URLs contain content-hashes (e.g. /_next/static/chunks/app-abc123.js)
  // so they're immutable — cache-first is safe and fast.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(event.request, clone));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // ── Brand assets: stale-while-revalidate ──
  // Serve from cache immediately, but fetch a fresh copy in the background
  if (url.pathname.startsWith("/brand/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
        return cached || networkFetch;
      }),
    );
    return;
  }

  // ── Everything else (page navigations, /c/* HTML): network-only ──
  // Do NOT cache HTML/navigation responses. Next.js already handles
  // client-side caching via its own router cache, and caching HTML in
  // the SW causes the exact staleness problem we want to avoid.
  // The SW only intercepts these if the network is down.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Offline fallback: you could return a custom offline page here
        // For now, just let the browser show its default offline UI
        return caches.match(event.request);
      }),
    );
    return;
  }
});
