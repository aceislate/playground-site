// Loads a page into an iframe by fetching its HTML and writing it in with
// srcdoc, instead of pointing the iframe at the URL. This is what lets the
// site and its games run from CDNs like jsDelivr, which serve .html files as
// plain text. Pages loaded this way get:
//   - a <base href> so their relative links, scripts and images still resolve
//   - window.__SHELL / __PAGE_URL / __PAGE_QUERY (location is about:srcdoc)
//   - window.siteGo(url) and a click handler so links to other .html pages
//     load the same way instead of navigating to a plain-text URL
(function () {
  if (window.FrameWriter) return;

  function escScript(s) {
    return String(s).replace(/<\//g, "<\\/");
  }

  function bootstrap(pageUrl, query) {
    return (
      "<script>" +
      "window.__SHELL=true;" +
      "window.__PAGE_URL=" + escScript(JSON.stringify(pageUrl)) + ";" +
      "window.__PAGE_QUERY=" + escScript(JSON.stringify(query || "")) + ";" +
      "window.siteGo=function(u){var t=new URL(u,document.baseURI).href;" +
      "try{parent.FrameWriter.load(window.frameElement,t);}catch(e){location.href=t;}};" +
      "document.addEventListener('click',function(e){" +
      "if(e.defaultPrevented||e.button||e.ctrlKey||e.metaKey||e.shiftKey)return;" +
      "var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;if(!a)return;" +
      "var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||/^(javascript|mailto|data|blob):/i.test(h))return;" +
      "var u;try{u=new URL(h,document.baseURI);}catch(x){return;}" +
      "if(u.origin!==new URL(document.baseURI).origin||!/(\\.html?|\\/)$/i.test(u.pathname))return;" +
      "e.preventDefault();window.siteGo(u.href);},true);" +
      "</script>"
    );
  }

  function prepare(html, pageUrl, query) {
    html = String(html || "");
    // keep a page's own <base> if it has one, but make it absolute
    var base = pageUrl;
    var m = html.match(/<base\b[^>]*\bhref\s*=\s*["']?([^"'\s>]+)/i);
    if (m) {
      try { base = new URL(m[1], pageUrl).href; } catch (e) {}
    }
    html = html.replace(/<base\b[^>]*>/gi, "");
    // a meta refresh would navigate the frame to a raw (plain text) URL
    html = html.replace(/<meta\b[^>]*http-equiv\s*=\s*["']?refresh[^>]*>/gi, "");
    var head = '<base href="' + base.replace(/"/g, "&quot;") + '">' + bootstrap(pageUrl, query);
    if (/<head\b[^>]*>/i.test(html)) return html.replace(/<head\b[^>]*>/i, function (t) { return t + head; });
    if (/<html\b[^>]*>/i.test(html)) return html.replace(/<html\b[^>]*>/i, function (t) { return t + "<head>" + head + "</head>"; });
    return head + html;
  }

  function errorPage(url, why) {
    return (
      '<!DOCTYPE html><html><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;' +
      'background:#111;color:#ddd;font:15px system-ui,sans-serif;text-align:center">' +
      "<div><p>Couldn't load this page.</p><p style=\"color:#888;font-size:12px\">" +
      String(why).replace(/</g, "&lt;") + "<br>" + String(url).replace(/</g, "&lt;") +
      "</p></div></body></html>"
    );
  }

  function load(iframe, url, done) {
    var full = new URL(url, document.baseURI);
    var query = full.search;
    full.search = "";
    full.hash = "";
    var pageUrl = full.href;
    if (/\/$/.test(full.pathname)) pageUrl += "index.html";
    iframe.setAttribute("data-fw-url", new URL(url, document.baseURI).href);
    return fetch(pageUrl)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(function (html) {
        iframe.srcdoc = prepare(html, pageUrl, query);
        if (done) done(null);
      })
      .catch(function (err) {
        iframe.srcdoc = errorPage(pageUrl, err && err.message ? err.message : err);
        if (done) done(err);
      });
  }

  function reload(iframe) {
    var u = iframe.getAttribute("data-fw-url");
    if (u) load(iframe, u);
  }

  window.FrameWriter = { load: load, reload: reload, prepare: prepare };
})();
