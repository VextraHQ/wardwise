/// <reference lib="webworker" />

/**
 * WardWise Collect — Service Worker
 *
 * Strategy overview:
 *   • /c/* navigations   → network-first, cache fallback (enables offline cold-reopen
 *                          after prior online visit + offline geo prep)
 *   • /c/* ?_rsc GETs    → network-first, cache fallback (Next 16 RSC payloads —
 *                          required for hydration on offline reopen)
 *   • Other navigations  → network-only
 *   • API calls          → network-first, cache fallback for offline reads
 *   • /_next/static/*    → cache-first (filenames include content-hashes, so safe)
 *   • /brand/*           → stale-while-revalidate
 *
 * Bump CACHE_VERSION on each deploy so old caches are purged.
 * In a CI pipeline you can replace this token automatically:
 *   sed -i "s/__BUILD_ID__/$(git rev-parse --short HEAD)/" public/sw.js
 */

const CACHE_VERSION = "1e111c3-1777270327884"; // replace at build time, or bump manually
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

  // ── /c/* RSC payloads: network-first, cache fallback ──
  // Next 16 emits ?_rsc=<hash> GETs against the page URL on client-side
  // navigations to server components. These don't have request.mode ===
  // "navigate" and don't live under /api/, so without an explicit rule they
  // would fall through to network-only and break offline reopen hydration.
  if (
    event.request.method === "GET" &&
    url.pathname.startsWith("/c/") &&
    url.searchParams.has("_rsc")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
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

  // ── /c/* document navigations: network-first, cache fallback ──
  // Cache successful loads so the campaign page reopens offline after a prior
  // online visit. Pair with the /c/* ?_rsc rule above so hydration also works.
  if (event.request.mode === "navigate" && url.pathname.startsWith("/c/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
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

  // ── Other navigations: network-only ──
  // Don't cache outside the Collect surface — Next.js handles its own
  // revalidation and caching HTML elsewhere causes staleness.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request)),
    );
    return;
  }
});
