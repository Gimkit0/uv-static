"use strict";

// register-sw.js
const stockSW = "/active/uv-sw.js";
const swAllowedHostnames = ["localhost", "127.0.0.1"];

async function registerSW() {
  if (
    location.protocol !== "https:" &&
    !swAllowedHostnames.includes(location.hostname)
  )
    throw new Error("Service workers cannot be registered without https.");

  if (!navigator.serviceWorker)
    throw new Error("Your browser doesn't support service workers.");

  await navigator.serviceWorker.register(stockSW, {
    scope: __uv$config.prefix,
  });
}

// sw.js
var cacheName = 'LVcog';
var filesToCache = [
  '/js/sw.js'
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

// END OF ULTRAVIOLET REGISTRATION \\

const tabBar = document.getElementById("tabBar");
const urlInput = document.getElementById("urlInput");
const iframeContainer = document.getElementById("iframeContainer");

let tabs = [];
let activeTabId = null;
let tabCount = 0;
let isDark = localStorage.getItem("theme") === "dark";

if (isDark) document.body.classList.add("dark");

function search(input, template) {
  try {
    return new URL(input).toString();
  } catch (err) {
    
  }

  try {
    const url = new URL(`http://${input}`);
    
    if (url.hostname.includes(".")) return url.toString();
  } catch (err) {
    
  }

  return template.replace("%s", encodeURIComponent(input));
}

function saveTabs() {
    localStorage.setItem("tabs", JSON.stringify(tabs.map(t => ({
        id: t.id,
        url: t.url,
        title: t.tab.querySelector("span").textContent
    }))));
    localStorage.setItem("activeTabId", activeTabId);
}

function loadTabs() {
    const saved = JSON.parse(localStorage.getItem("tabs") || "[]");
    activeTabId = localStorage.getItem("activeTabId");

    if (saved.length === 0) {
        createTab();
    } else {
        saved.forEach((t, i) => {
            createTab(t.url, t.id, t.title);
        });
        setTimeout(() => {
            switchTab(activeTabId || tabs[0].id);
        }, 0);
    }
}

async function createTab(url = "https://google.com", existingId = null, titleText = "New Tab") {
    const tabId = existingId || `tab-${tabCount++}`;
    const iframe = document.createElement("iframe");
    
    try {
        await registerSW();
    } catch (err) {
        throw err;
    }
    
    const uvURL = search(url, "https://www.google.com/search?q=%s");
    
    urlInput.value = url
    
    iframe.src = __uv$config.prefix + __uv$config.encodeUrl(uvURL);
    iframe.dataset.tabId = tabId;
    iframeContainer.appendChild(iframe);
    iframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-modals allow-orientation-lock allow-presentation allow-storage-access-by-user-activation";

    const tab = document.createElement("div");
    tab.className = "tab";
    tab.dataset.tabId = tabId;
    tab.draggable = true;

    const favicon = document.createElement("img");
    favicon.className = "favicon";
    favicon.src = getFavicon(url);
    tab.appendChild(favicon);

    const title = document.createElement("span");
    title.textContent = titleText || "New Tab";
    tab.appendChild(title);
    
    iframe.addEventListener("load", () => {
        const urlTitle = iframe.contentDocument.title;
        if (urlTitle.length <= 1) {
            title.textContent = "Tab";
        } else {
            title.textContent = urlTitle;
        }
        iframe.contentWindow.open = url => {
            createTab(url);
            return null;
        };
        if (iframe.contentDocument.documentElement.outerHTML.trim().length > 0) {
            
        }
    });

    if (tabs.length > 0) {
        const closeBtn = document.createElement("span");
        closeBtn.className = "close";
        closeBtn.textContent = "✕";
        closeBtn.onclick = (e) => closeTab(e, tabId);
        tab.appendChild(closeBtn);
    }

    tab.onclick = () => switchTab(tabId);
    tab.ondragstart = (e) => handleDragStart(e, tabId);
    tab.ondragover = (e) => e.preventDefault();
    tab.ondrop = (e) => handleDrop(e, tabId);

    tabBar.insertBefore(tab, tabBar.lastElementChild);
    tabs.push({ id: tabId, iframe, tab, url });
    
    requestAnimationFrame(() => {
        tab.style.opacity = 1;
        tab.style.transform = "translateY(0)";
    });

    switchTab(tabId);
    refreshTabCloseButtons();
    saveTabs();
}

async function handleExtensionUpload() {
    const fileInput = document.getElementById('crxInput');
    const file = fileInput.files[0];
    if (!file) return;

    const zip = new JSZip();
    const contents = await zip.loadAsync(file);

    if (!contents.files['manifest.json']) {
        alert('Invalid extension: manifest.json not found.');
        return;
    }

    const manifestText = await contents.files['manifest.json'].async('text');
    const manifest = JSON.parse(manifestText);

    if (manifest.content_scripts) {
        for (const scriptInfo of manifest.content_scripts) {
            for (const jsFile of scriptInfo.js) {
                const scriptContent = await contents.files[jsFile].async('text');
                const script = document.createElement('script');
                script.textContent = scriptContent;
                document.body.appendChild(script);
            }
        }
    }

    if (manifest.background && manifest.background.scripts) {
        for (const bgFile of manifest.background.scripts) {
            const bgScriptContent = await contents.files[bgFile].async('text');
            const script = document.createElement('script');
            script.textContent = bgScriptContent;
            document.body.appendChild(script);
        }
    }

    alert(`Loaded extension: ${manifest.name}`);
}

function getActiveIframe() {
    return document.querySelector("iframe.active");
}

function switchTab(tabId) {
    tabs.forEach(({ id, iframe, tab }) => {
        const isActive = id === tabId;
        iframe.classList.toggle("active", isActive);
        tab.classList.toggle("active", isActive);
        if (isActive) {
            urlInput.value = iframe.src;
            activeTabId = tabId;
        }
    });
    saveTabs();
}

function closeTab(e, tabId) {
    e.stopPropagation();
    if (tabs.length <= 1) return;

    const index = tabs.findIndex(t => t.id === tabId);
    if (index !== -1) {
        const { iframe, tab } = tabs[index];
        iframe.remove();
        tab.remove();
        tabs.splice(index, 1);

        if (activeTabId === tabId) {
            const newActive = tabs[index] || tabs[index - 1];
            if (newActive) switchTab(newActive.id);
            else {
                activeTabId = null;
                urlInput.value = "";
            }
        }
        refreshTabCloseButtons();
        saveTabs();
    }
}

function openInNewTab() {
    const iframe = getActiveIframe();
    if (!iframe) return;

    const url = iframe.src || iframe.contentWindow.location.href;
    if (!url) {
        alert("No URL to open.");
        return;
    }

    const code = `
    <style>
        iframe {
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            position: absolute;
            outline: none;
            border: none;
        }
    </style>
    <iframe allowfullscreen src='${url}'></iframe>
    `

    const newTab = window.open();
    newTab.document.open();
    newTab.document.write(code);
    newTab.document.close();
}

function openInNewWindow() {
    const iframe = getActiveIframe();
    if (!iframe) return;

    const url = iframe.src || iframe.contentWindow.location.href;
    if (!url) {
        alert("No URL to open.");
        return;
    }

    const code = `
    <style>
        iframe {
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            position: absolute;
            outline: none;
            border: none;
        }
    </style>
    <iframe allowfullscreen src='${url}'></iframe>
    `

    const newWindow = window.open("", "_blank", "width=800,height=600");
    newWindow.document.open();
    newWindow.document.write(code);
    newWindow.document.close();
}

function toggleMenu() {
    const menu = document.getElementById("menu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
    
    menu.style.opacity = 0;
    menu.style.transform = "translateY(-10px)";
    
    requestAnimationFrame(() => {
        menu.style.opacity = 1;
        menu.style.transform = "translateY(0)";
    });
}

function toggleFullscreen() {
    const iframe = getActiveIframe();
    if (!iframe) return;

    if (!document.fullscreenElement) {
        iframe.requestFullscreen().catch(err => alert(`Error attempting fullscreen: ${err.message}`));
    } else {
        document.exitFullscreen();
    }
}

function injectEruda() {
    const activeIframe = getActiveIframe();
    if (!activeIframe) {
        console.error("No active iframe found");
        return;
    }
    const erudaWindow = activeIframe.contentWindow;
    if (!erudaWindow) {
        console.error("No content window found for the active iframe");
        return;
    }
    if (erudaWindow.eruda) {
        if (erudaWindow.eruda._isInit) {
            erudaWindow.eruda._isInit = false
            erudaWindow.eruda.destroy();
            erudaWindow.eruda = null
        }
    } else {
        const erudaDocument = activeIframe.contentDocument;
        if (!erudaDocument) {
            console.error("No content document found for the active iframe");
            return;
        }
        const script = erudaDocument.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/eruda";
        script.onload = () => {
            if (!erudaWindow.eruda) {
                console.error("Failed to load Eruda in the active iframe");
                return;
            }
            erudaWindow.eruda.init();
            erudaWindow.eruda.show();
        };
        erudaDocument.head.appendChild(script);
    }
}

function refreshTabCloseButtons() {
    tabs.forEach(({ tab }, i) => {
        const closeBtn = tab.querySelector(".close");
        if (tabs.length === 1 && closeBtn) {
            closeBtn.remove();
        } else if (tabs.length > 1 && !closeBtn) {
            const close = document.createElement("span");
            close.className = "close";
            close.textContent = "✕";
            close.onclick = (e) => closeTab(e, tabs[i].id);
            tab.appendChild(close);
        }
    });
}

function refreshTab() {
    const iframe = getActiveIframe();
    if (iframe) {
        iframe.contentWindow.location.reload();
    }
}

function goBack() {
    const iframe = getActiveIframe();
    if (iframe && iframe.contentWindow.history.length > 1) {
        iframe.contentWindow.history.back();
    }
}

function goForward() {
    const iframe = getActiveIframe();
    if (iframe && iframe.contentWindow.history.length > 1) {
        iframe.contentWindow.history.forward();
    }
}

function getFavicon(url) {
    try {
        const hostname = new URL(url).origin;
        return `${hostname}/favicon.ico`;
    } catch {
        return "https://raw.githubusercontent.com/UseInterstellar/Interstellar/refs/heads/main/static/assets/media/favicon/space.ico";
    }
}

urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && activeTabId) {
        let url = urlInput.value.trim();
        if (!url.startsWith("http")) url = "https://" + url;
    
        const uvURL = search(url, "https://www.google.com/search?q=%s");

        const tab = tabs.find(t => t.id === activeTabId);
        if (tab) {
            tab.iframe.src = __uv$config.prefix + __uv$config.encodeUrl(uvURL);;
            tab.url = url;
            tab.tab.querySelector("img.favicon").src = getFavicon(url);
            try {
                tab.tab.querySelector("span").textContent = new URL(url).hostname;
            } catch {
                tab.tab.querySelector("span").textContent = "New Tab";
            }
            saveTabs();
        }
    }
});

function toggleTheme() {
    document.body.classList.toggle("dark");
    isDark = !isDark;
    localStorage.setItem("theme", isDark ? "dark" : "light");
}

let dragSourceTabId = null;

function handleDragStart(e, tabId) {
    dragSourceTabId = tabId;
}

function handleDrop(e, targetTabId) {
    if (dragSourceTabId === targetTabId) return;

    const fromIndex = tabs.findIndex(t => t.id === dragSourceTabId);
    const toIndex = tabs.findIndex(t => t.id === targetTabId);
    const [movedTab] = tabs.splice(fromIndex, 1);
    tabs.splice(toIndex, 0, movedTab);

    const tabElements = tabs.map(t => t.tab);
    tabElements.forEach(tab => tabBar.insertBefore(tab, tabBar.lastElementChild));

    saveTabs();
}

//loadTabs();
createTab();
