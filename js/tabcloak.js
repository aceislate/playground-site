const output = (msg, clr) => {
  const txt = document.getElementById("console-output");
  if (!txt) return;
  txt.style.color = clr;
  txt.innerText = msg;
};

const changeTabTitle = () => {
  const tcInput = document.getElementById("userinput");
  if (tcInput.value === "") {
    window.localStorage.removeItem("title");
    output("No title entered. Default applied, refresh to see changes", "#ef4444");
  } else {
    window.localStorage.setItem("title", tcInput.value);
    window.document.title = tcInput.value;
    output("Title changed successfully", "#22c55e");
  }
  tcInput.value = "";
};

const validURL = (str) => {
  const exp = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  return exp.test(str);
};

const changeTabIcon = () => {
  const tcInput = document.getElementById("userinput");
  if (tcInput.value === "") {
    const iconLink = document.querySelector("link[rel*='icon']");
    if (iconLink) iconLink.href = "favicon.ico";
    window.localStorage.removeItem("icon");
    output("No image entered. Default applied, refresh to see changes", "#ef4444");
  } else if (validURL(tcInput.value)) {
    const iconLink = document.querySelector("link[rel*='icon']");
    if (iconLink) iconLink.href = tcInput.value;
    window.localStorage.setItem("icon", tcInput.value);
    output("Icon changed successfully", "#22c55e");
  } else {
    output("Icon change failed. Make sure you are using a valid URL", "#ef4444");
  }
  tcInput.value = "";
};

const resetTabSettings = () => {
  ["icon", "title"].forEach((item) => window.localStorage.removeItem(item));
  window.location.reload();
};

function applyPreset(iconUrl, titleText) {
  const tcInput = document.getElementById("userinput");
  tcInput.value = iconUrl;
  changeTabIcon();
  tcInput.value = titleText;
  changeTabTitle();
  output("Preset applied successfully!", "#22c55e");
}

const urlTarget = document.getElementById("url-target");
const createBtn = document.getElementById("create");
if (createBtn) {
  createBtn.onclick = function () {
    let val = urlTarget.value;
    if (!val.startsWith("https://") && !val.startsWith("http://")) {
      val = `https://${val.split("https://").pop()}`;
    } else if (val.startsWith("http://")) {
      val = `https://${val.split("http://").pop()}`;
    }
    const win = window.open();
    if (!win) return;
    win.document.body.style.margin = "0";
    win.document.body.style.height = "100vh";
    const iframe = win.document.createElement("iframe");
    iframe.style.border = "none";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.margin = "0";
    iframe.referrerPolicy = "no-referrer";
    iframe.allow = "fullscreen";
    iframe.src = val;
    win.document.body.appendChild(iframe);
  };
}
