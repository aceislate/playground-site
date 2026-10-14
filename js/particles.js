(function () {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, dots, animId, frame = 0, tint = [168, 85, 247];
  const mouse = { x: null, y: null };

  const densityMap = { low: 14, medium: 26, high: 46 };

  function getSettings() {
    return {
      enabled: localStorage.getItem("s_particles") !== "off",
      density: localStorage.getItem("s_particleDensity") || "medium",
    };
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function readTint() {
    const hex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
      const n = parseInt(hex.slice(1), 16);
      tint = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
  }

  function makeDot(initial) {
    const colored = Math.random() < 0.35;
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 20,
      vy: 0.12 + Math.random() * 0.32,
      amp: 6 + Math.random() * 18,
      freq: 0.004 + Math.random() * 0.006,
      phase: Math.random() * Math.PI * 2,
      r: 1.2 + Math.random() * 3.4,
      a: 0.14 + Math.random() * 0.34,
      rgb: colored ? tint : [255, 255, 255],
    };
  }

  function makeDots(count) {
    dots = [];
    for (let i = 0; i < count; i++) dots.push(makeDot(true));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    frame++;

    for (const d of dots) {
      d.y -= d.vy;
      let x = d.x + Math.sin(frame * d.freq + d.phase) * d.amp;

      if (mouse.x !== null) {
        const dx = x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) d.x += (dx / (dist || 1)) * ((110 - dist) / 110) * 0.8;
      }

      if (d.y < -20) Object.assign(d, makeDot(false));

      const [r, g, b] = d.rgb;
      ctx.beginPath();
      ctx.arc(x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${d.a})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(step);
  }

  function start() {
    const settings = getSettings();
    cancelAnimationFrame(animId);
    if (!settings.enabled || document.documentElement.classList.contains("no-particles")) {
      ctx.clearRect(0, 0, w || 0, h || 0);
      return;
    }
    resize();
    readTint();
    makeDots(densityMap[settings.density] || densityMap.medium);
    step();
  }

  window.addEventListener("resize", () => {
    resize();
    if (dots) makeDots(densityMap[getSettings().density] || densityMap.medium);
  });

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else start();
  });

  window.__restartParticles = start;

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) start();
})();
