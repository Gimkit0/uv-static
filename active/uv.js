importScripts('https://gimkit0.github.io/uv-static/active/uv/uv.bundle.js');
importScripts('https://gimkit0.github.io/uv-static/active/uv/uv.config.js');
importScripts('https://gimkit0.github.io/uv-static/active/uv/uv.sw.js');
importScripts('https://arc.io/arc-sw-core.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', (event) => event.respondWith(sw.fetch(event)));
