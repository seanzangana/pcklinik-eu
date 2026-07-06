// Cloudflare Pages Function — shared contact-form handler for pcklinik.eu.
// Sends the notification via the Resend API (key: RESEND_API_KEY).
//
// Response modes:
//   - fetch/AJAX (Accept: application/json)  -> JSON { ok: true|false }
//   - plain form POST (no JS)                -> 303 redirect to _next
//
// Anti-spam: two independent signals — honeypot (_gotcha) + time-to-submit
// (_ts). A submission is only DROPPED when BOTH agree, so a single false
// positive (e.g. a password manager autofilling the hidden honeypot) never
// silently eats a real message — it is delivered, just tagged "[Possible spam]".
//
// Routing: _to is the actual destination, validated against ALLOWED_DESTINATIONS
// (contact/ask -> contact@, Business IT -> support@). Per-domain sender.

const ALLOWED_DESTINATIONS = new Set([
  "contact@pcklinik.eu",
  "support@pcklinik.eu",
  "kontakt@pcklinik.dk",
  "support@pcklinik.dk",
]);

const MIN_SUBMIT_MS = 2000; // faster than this after page load = suspicious
const EMAIL_RE = /.+@.+\..+/;

function fromFor(dest) {
  const domain = dest.endsWith("@pcklinik.dk") ? "pcklinik.dk" : "pcklinik.eu";
  return "PCKlinik Website <noreply@" + domain + ">";
}

function redirect(url) {
  return new Response(null, { status: 303, headers: { Location: url } });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const accept = request.headers.get("accept") || "";
  const ctype = request.headers.get("content-type") || "";
  const wantsJson = accept.includes("application/json") || ctype.includes("application/json");

  let form;
  try {
    if (ctype.includes("application/json")) {
      form = await request.json();
    } else {
      const fd = await request.formData();
      form = Object.fromEntries(fd.entries());
    }
  } catch (e) {
    return wantsJson ? json({ ok: false, error: "bad_request" }, 400) : new Response("Bad request", { status: 400 });
  }

  const next = form._next || "/";

  // --- Spam scoring: only drop when TWO signals agree. ---
  const isHoneypotTripped = String(form._gotcha || "").trim() !== "";
  const ts = Number(form._ts);
  const isTooFast = Number.isFinite(ts) && Date.now() - ts < MIN_SUBMIT_MS;
  const spamScore = (isHoneypotTripped ? 1 : 0) + (isTooFast ? 1 : 0);

  if (spamScore >= 2) {
    console.warn("submit-form: spam (honeypot + too-fast), dropping");
    return wantsJson ? json({ ok: true }) : redirect(next); // fake success, don't send
  }

  const to = String(form._to || "").trim().toLowerCase();
  if (!ALLOWED_DESTINATIONS.has(to)) {
    console.warn("submit-form: invalid destination", to);
    return wantsJson ? json({ ok: false, error: "invalid_destination" }, 422) : new Response("Invalid destination", { status: 422 });
  }
  if (!env.RESEND_API_KEY) {
    console.error("submit-form: RESEND_API_KEY not configured");
    return wantsJson ? json({ ok: false, error: "not_configured" }, 500) : new Response("Email not configured", { status: 500 });
  }

  const baseSubject = (form._subject || "New website form submission").toString();
  const subject = spamScore === 1 ? "[Possible spam] " + baseSubject : baseSubject;

  const rows = [];
  for (const [k, v] of Object.entries(form)) {
    if (k.startsWith("_")) continue;
    if (v === undefined || v === null || String(v) === "") continue;
    rows.push([k, String(v)]);
  }
  const text = rows.map(([k, v]) => k + ": " + v).join("\n") || "(no fields submitted)";
  const html =
    '<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;color:#111">' +
    "<h2 style=\"margin:0 0 12px\">" + esc(subject) + "</h2><table style=\"border-collapse:collapse\">" +
    rows.map(([k, v]) =>
      '<tr><td style="padding:4px 12px 4px 0;color:#555;vertical-align:top"><strong>' +
      esc(k) + "</strong></td><td style=\"padding:4px 0\">" + esc(v).replace(/\n/g, "<br>") + "</td></tr>"
    ).join("") + "</table></div>";

  const replyTo = (form.email || form.contact || "").toString().trim();
  const payload = { from: fromFor(to), to: [to], subject, text, html };
  if (replyTo && EMAIL_RE.test(replyTo)) payload.reply_to = replyTo;

  let res;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("submit-form: Resend request failed", err && err.message);
    return wantsJson ? json({ ok: false, error: "send_failed" }, 502) : new Response("Email request failed", { status: 502 });
  }
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("submit-form: Resend send failed", res.status, t);
    return wantsJson ? json({ ok: false, error: "send_failed" }, 502) : new Response("Email send failed", { status: 502 });
  }

  return wantsJson ? json({ ok: true }) : redirect(next);
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  return onRequestPost(context);
}
