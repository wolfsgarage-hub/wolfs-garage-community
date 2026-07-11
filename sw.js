/* Wolf's Garage HQ service worker — versioned cache, cache-first shell */
var CACHE = "wg-hq-v0-1-0";
var SHELL = ["hq.html", "manifest.webmanifest", "hq-icon.svg"];
self.addEventListener("install", function (e) { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).catch(function () {})); });
self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(function (hit) {
    var net = fetch(e.request).then(function (res) { if (res && res.status === 200 && (e.request.url.indexOf("http") === 0)) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }).catch(function () {}); } return res; }).catch(function () { return hit; });
    return hit || net;
  }));
});
