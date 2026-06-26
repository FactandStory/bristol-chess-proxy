// api/share.js — Per-player "share" landing page for Your Chess Year cards.
//
// WHY THIS EXISTS
// ---------------
// Social crawlers (WhatsApp, X/Twitter, Facebook, iMessage, Slack, LinkedIn…)
// fetch the raw HTML of a shared link and DO NOT run JavaScript. The Framer YCY
// page is a client-rendered app and can't vary its preview image by ?ecf=, so a
// shared Framer link can never unfurl as a player's card. This route solves that:
// it returns real server-rendered HTML whose <head> carries the player-specific
// OG/Twitter tags (pointing at the existing /api/og card), so the link unfurls as
// that player's card. A human who clicks is redirected (via JS) straight to that
// player's Your Chess Year dashboard. Bots don't run the JS, so they stay and read
// the OG tags — exactly what we want.
//
// It takes the SAME query params the YCY "BRAG ABOUT THIS" buttons already build,
// so the buttons only need to swap /api/og -> /api/share (plus always include
// ecf_code, used for the human redirect).

// ── Where a human who clicks a shared link should land ───────────────────────
// ⚠ AT LAUNCH: swap to the live domain. This is one of the domain-migration
// edits (alongside og.js ctaFooter and the site-wide links).
//   Launch value:  https://bristolchess.com/your-chess-year
const YCY_URL = "https://bristolchess.com/your-chess-year"

const PROXY = "https://bristol-chess-proxy.vercel.app"

// Friendly per-module sub-title for the share preview.
const MODULE_TITLES = {
    rating_journey: "My Rating Journey",
    season_scoreboard: "My Season Scoreboard",
    where_you_stand: "Where I Stand",
    giant_killing: "My Biggest Upset",
    toughest_opponent: "My Toughest Opponent",
    your_people: "My People",
    colour_strength: "My Colour Strength",
    in_good_company: "In Good Company",
    degrees_of_separation: "My Degrees of Separation",
}

// Escape a string for safe insertion into an HTML attribute / text node.
function esc(s) {
    return String(s == null ? "" : s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

module.exports = function handler(req, res) {
    const q = req.query || {}
    const moduleName = String(q.module || "")
    const ecf = String(q.ecf_code || "").trim()
    const name = String(q.name || "A Bristol & Districts player").trim()

    // Pass the full incoming query string straight through to the OG renderer —
    // it already knows how to read each module's params and ignores extras.
    const qIndex = req.url.indexOf("?")
    const queryString = qIndex >= 0 ? req.url.slice(qIndex + 1) : ""

    const ogImage = `${PROXY}/api/og?${queryString}`
    const shareUrl = `${PROXY}/api/share?${queryString}`

    const sub = MODULE_TITLES[moduleName] || "My Chess Year"
    const title = `${name} — ${sub}`
    const description =
        "My Your Chess Year on the Bristol & Districts Chess Hub — a year of league chess, in numbers. See how yours stacks up."

    // Human redirect target (deep-linked to this player where we have their code).
    const redirectUrl = ecf
        ? `${YCY_URL}?ecf=${encodeURIComponent(ecf)}`
        : YCY_URL

    const T = esc(title)
    const D = esc(description)
    const IMG = esc(ogImage)
    const SHARE = esc(shareUrl)
    const REDIR = esc(redirectUrl)
    const REDIR_JS = JSON.stringify(redirectUrl) // safe inside <script>

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${T}</title>
<meta name="description" content="${D}">

<!-- Open Graph (WhatsApp, Facebook, iMessage, LinkedIn, Slack, Discord…) -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Bristol &amp; Districts Chess Hub">
<meta property="og:title" content="${T}">
<meta property="og:description" content="${D}">
<meta property="og:url" content="${SHARE}">
<meta property="og:image" content="${IMG}">
<meta property="og:image:secure_url" content="${IMG}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${T}">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${T}">
<meta name="twitter:description" content="${D}">
<meta name="twitter:image" content="${IMG}">

<style>
  html,body{margin:0;height:100%;background:#121016;color:#F6F4F8;
    font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
  .wrap{min-height:100%;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:20px;padding:24px;box-sizing:border-box;text-align:center;}
  img{max-width:min(680px,92vw);height:auto;border-radius:12px;
    box-shadow:0 10px 40px rgba(0,0,0,0.5);}
  a{color:#34D17A;font-weight:700;text-decoration:none;font-size:15px;
    letter-spacing:0.04em;}
  p{color:#94909C;font-size:13px;margin:0;}
</style>
</head>
<body>
  <div class="wrap">
    <img src="${IMG}" alt="${T}">
    <p>Taking you to Your Chess Year…</p>
    <a href="${REDIR}">View on the Bristol &amp; Districts Chess Hub →</a>
  </div>
  <!-- Humans run this and are redirected; crawlers don't, so they read the OG tags above. -->
  <script>window.location.replace(${REDIR_JS});</script>
</body>
</html>`

    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.status(200).send(html)
}
