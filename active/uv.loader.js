importScripts(
"https://gimkit0.github.io/uv-static/active/uv/uv.sw.js",
"https://gimkit0.github.io/uv-static/active/uv/uv.config.js"
);
const s = new UVServiceWorker();
let userKey = getUserKey();
self.addEventListener("fetch", (t) => t.respondWith(s.fetch(t)));
