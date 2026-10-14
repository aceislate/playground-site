(function () {
  const DEFAULT_MESSAGES = [

    "shh, teacher's coming.",
    "anything but schoolwork bro?",
    "bro hop off.",
  ];

  function getMessages() {
    try {
      const stored = JSON.parse(localStorage.getItem("s_homeMessages") || "null");
      if (Array.isArray(stored) && stored.length) return stored;
    } catch (e) {}
    return DEFAULT_MESSAGES;
  }

  window.__defaultHomeMessages = DEFAULT_MESSAGES;

  const el = document.getElementById("homeMessage");
  if (el) {
    const messages = getMessages();
    el.textContent = messages[Math.floor(Math.random() * messages.length)];
  }
})();
