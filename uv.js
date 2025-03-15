importScripts('/uv.bundle.js');
importScripts('/uv.config.js');
importScripts('/uv.sw.js');
importScripts('https://arc.io/arc-sw-core.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', (event) => event.respondWith(sw.fetch(event)));
