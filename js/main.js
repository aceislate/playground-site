(function () {
  const root = document.documentElement;

  function applySettings() {
    const accent = localStorage.getItem("s_accent") || "#a855f7";
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-deep", shade(accent, -25));

    root.classList.toggle("reduce-motion", localStorage.getItem("s_reduceMotion") === "on");
    root.classList.toggle("no-particles", localStorage.getItem("s_particles") === "off");
  }

  function shade(hex, percent) {
    const n = parseInt(hex.replace("#", ""), 16);
    let r = (n >> 16) + percent, g = ((n >> 8) & 255) + percent, b = (n & 255) + percent;
    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  }

  applySettings();
  window.__applySiteSettings = applySettings;

  // liquid-glass refraction filter (Chromium supports SVG filters in backdrop-filter)
  const brands = (navigator.userAgentData && navigator.userAgentData.brands) || [];
  if (brands.some((b) => /Chromium/i.test(b.brand))) {
    root.classList.add("lg-refract");
    document.addEventListener("DOMContentLoaded", () => {
      const holder = document.createElement("div");
      holder.setAttribute("aria-hidden", "true");
      holder.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
      holder.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><filter id="lg-refract" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="2" seed="7" result="noise"/>' +
        '<feGaussianBlur in="noise" stdDeviation="3" result="soft"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="soft" scale="22" xChannelSelector="R" yChannelSelector="G"/>' +
        "</filter></svg>";
      document.body.appendChild(holder);
    });
  }

  const local_title = localStorage.getItem("title");
  const local_icon = localStorage.getItem("icon");
  if (window.localStorage.hasOwnProperty("title")) {
    document.title = local_title;
  }
  if (window.localStorage.hasOwnProperty("icon")) {
    const iconLink = document.querySelector("link[rel=icon]");
    if (iconLink) iconLink.href = local_icon;
  }

  // the site may live in a subfolder (e.g. cdn.../gh/user/repo/main/), so work out
  // page paths relative to the folder this script's js/ directory sits in
  const siteRoot = document.currentScript ? new URL("..", document.currentScript.src).href : location.origin + "/";

  document.addEventListener("DOMContentLoaded", () => {
    const here = (window.__PAGE_URL || location.href).split(/[?#]/)[0];
    const rel = here.startsWith(siteRoot) ? "/" + here.slice(siteRoot.length) : location.pathname;
    const path = rel.replace(/\/+$/, "") || "/index.html";
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const target = a.getAttribute("data-nav");
      const matches =
        (target === "home" && (path === "/index.html" || path === "/" || path === "")) ||
        (target === "games" && (path === "/games.html" || path === "/projects.html")) ||
        (target === "apps" && path === "/apps.html") ||
        (target === "settings" && (path === "/settings.html" || path === "/misc.html"));
      a.classList.toggle("active", matches);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "h" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        root.classList.toggle("hide-ui");
      }
    });
  });
})();
