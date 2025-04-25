fefwewefewefwefewefwwconst uvSW = "https://gimkit0.github.io/uv-static/active/uv/uv.sw.js";
const uvBundle = "https://gimkit0.github.io/uv-static/active/uv/uv.bundle.js";

const swAllowedHostnames = ["localhost", "127.0.0.1"];
async function registerSW() {
    if (!('serviceWorker' in navigator)) return;

    await navigator.serviceWorker.register("https://gimkit0.github.io/uv-static/active/script.js", {
        scope: __uv$config.prefix
    });
}

var cacheName = 'LVcog';
var filesToCache = [
    'https://gimkit0.github.io/uv-static/active/register.js'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});
