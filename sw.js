/* Presupuesto familiar — service worker
   Estrategia:
   - Navegación (HTML): red primero, cache de respaldo. Así siempre ves la última versión
     publicada, pero la app abre aunque estés sin señal.
   - Recursos propios (iconos, manifest): cache primero, se actualizan en segundo plano.
   - Firebase y Google Fonts: nunca se interceptan; Firestore ya tiene su propia caché local.
*/

const VERSION = "pf-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./iconos/icono-192.png",
  "./iconos/icono-512.png",
  "./iconos/icono-maskable-512.png",
  "./iconos/apple-touch-icon.png",
  "./iconos/favicon-32.png",
];

const AJENOS = [
  "gstatic.com",
  "googleapis.com",
  "firebaseio.com",
  "firebaseapp.com",
  "cloudfunctions.net",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(SHELL).catch(() => null))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (AJENOS.some((d) => url.hostname.endsWith(d))) return; // fuera del service worker

  // HTML: red primero
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  // Recursos propios: cache primero
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((cacheado) => {
        const red = fetch(req)
          .then((res) => {
            const copia = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copia));
            return res;
          })
          .catch(() => cacheado);
        return cacheado || red;
      })
    );
  }
});

// Al tocar una alerta de sobre, abre la app en la vista de sobres
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
      for (const c of lista) {
        if ("focus" in c) {
          c.postMessage({ tipo: "abrir-vista", vista: e.notification.data?.vista || "panel" });
          return c.focus();
        }
      }
      return self.clients.openWindow("./index.html");
    })
  );
});

// Permite forzar la actualización desde la app
self.addEventListener("message", (e) => {
  if (e.data === "actualizar") self.skipWaiting();
});
