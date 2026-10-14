/**
 * Cloudflare Worker: AI chat proxy
 *
 * Proxies chat requests to the upstream AI API so the browser never talks
 * to gpt.crax.lol directly, and adds CORS headers so it can be called
 * from your games site.
 *
 * Deploy: paste this into a new Worker (Cloudflare dashboard -> Workers &
 * Pages -> Create -> Create Worker -> Edit code), then Deploy. Copy the
 * resulting *.workers.dev URL and give it back so it can be wired into
 * the site.
 */

const UPSTREAM_URL = "https://gpt.crax.lol/v1/chat/completions";
const DEFAULT_MODEL = "gemini-3-5-flash";

// Restrict which origins may call this worker. Set to "*" to allow any site.
const ALLOWED_ORIGIN = "*";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders() });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response("Invalid JSON body", { status: 400, headers: corsHeaders() });
    }

    const messages = Array.isArray(payload.messages) ? payload.messages : null;
    if (!messages) {
      return new Response("Missing 'messages' array", { status: 400, headers: corsHeaders() });
    }

    const upstreamBody = {
      model: payload.model || DEFAULT_MODEL,
      messages,
      stream: true,
    };

    const upstreamResponse = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(upstreamBody),
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const text = await upstreamResponse.text().catch(() => "");
      return new Response(text || "Upstream error", {
        status: upstreamResponse.status || 502,
        headers: corsHeaders(),
      });
    }

    // Stream the SSE response straight through to the client.
    return new Response(upstreamResponse.body, {
      status: 200,
      headers: {
        ...corsHeaders(),
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  },
};
