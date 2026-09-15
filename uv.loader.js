importScripts(
"https://gimkit0.github.io/uv-static/active/uv/uv.sw.js",
"https://gimkit0.github.io/uv-static/active/uv/uv.config.js"
);

const uv = new UVServiceWorker();

async function handleRequest(event) {
	if (uv.route(event)) {
		return await uv.fetch(event);
	}

	return await fetch(event.request);
}

self.addEventListener("fetch", (event) => {
	event.respondWith(handleRequest(event));
});
