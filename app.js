// Load the Scramjet controller
const { ScramjetController } = $scramjetLoadController();

// Create a new controller instance
const scramjet = new ScramjetController({
  prefix: "/scramjet/",
  codec: {
    encode: (url) => encodeURIComponent(url),
    decode: (url) => decodeURIComponent(url)
  },
  flags: {
    captureErrors: true,
    strictRewrites: true
  }
});

async function init() {
  // Register the service worker
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("/sw.js", {
      scope: "/"
    });
    
    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
  }
  
  // Initialize Scramjet
  await scramjet.init();
  
  // Create a proxied iframe
  const frame = scramjet.createFrame();
  document.getElementById("container").appendChild(frame.frame);
  
  // Navigate to a URL
  frame.go("https://example.com");
}

init();