// api/moderate.js — approve or reject a pending submission straight from the
// alert email (phone-friendly), reusing the existing write path.
//
// HOW IT FITS THE EXISTING SETUP:
//   - submit.js creates every submission UNAPPROVED (game/photo → "Approved"
//     false; event → "Show on Site" false). Components only render approved
//     rows. This endpoint flips that gate from a tap in the email.
//   - It reuses the SAME server-side AIRTABLE_WRITE_TOKEN and base as submit.js
//     — no second credential, no token in the browser.
//
// SECURITY:
//   - Every link carries an HMAC-SHA256 token over `${type}:${id}:${action}`,
//     signed with MODERATE_SECRET (server-only). A link can't be forged or
//     re-pointed at another record/action without the secret.
//   - PREFETCH-SAFE: a GET (incl. mail-client link scanners) only ever renders
//     a confirmation page — it NEVER writes. The change happens solely on the
//     POST from the Confirm button, which scanners don't issue.
//
// PREREQUISITES (Airtable, one-time):
//   - Add a checkbox field "Rejected" to all three tables: Notable Games,
//     Events, Gallery.
//   - Add env var MODERATE_SECRET on Vercel (same value the Automation signs
//     with). AIRTABLE_WRITE_TOKEN already exists.

import crypto from "crypto"

const AIRTABLE_BASE = "appSaO5ImcmzC2lag"

// Mirror of submit.js SUBMISSION_TYPES (table + moderation gate field per type).
// KEEP IN SYNC with submit.js. Note: events gate on "Show on Site", not "Approved".
const TYPES = {
    game: { table: "Notable Games", moderationField: "Approved" },
    event: { table: "Events", moderationField: "Show on Site" },
    photo: { table: "Gallery", moderationField: "Approved" },
}

// Checkbox added to all three tables; reject ticks it, approve clears it.
const REJECTED_FIELD = "Rejected"

const COLORS = {
    bg: "#121016",
    text: "#F6F4F8",
    dim: "#94909C",
    faint: "#5C5862",
    green: "#34D17A",
    amber: "#E8A800",
    red: "#E8675A",
}

function sign(secret, type, id, action) {
    return crypto
        .createHmac("sha256", secret)
        .update(`${type}:${id}:${action}`)
        .digest("hex")
}

function safeEqual(a, b) {
    const ba = Buffer.from(String(a || ""), "utf8")
    const bb = Buffer.from(String(b || ""), "utf8")
    if (ba.length !== bb.length) return false
    return crypto.timingSafeEqual(ba, bb)
}

function esc(s) {
    return String(s).replace(/[<>&]/g, (c) =>
        c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"
    )
}

function page(title, bodyHtml, accent) {
    return `<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(title)}</title></head>
<body style="margin:0;background:${COLORS.bg};color:${COLORS.text};font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;">
<div style="max-width:440px;width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.10);border-left:3px solid ${accent};border-radius:12px;padding:32px 28px;box-sizing:border-box;">
${bodyHtml}
</div></body></html>`
}

export default async function handler(req, res) {
    res.setHeader("Content-Type", "text/html; charset=utf-8")

    const { type, id, action, token } = req.query || {}
    const secret = process.env.MODERATE_SECRET

    if (!secret) {
        return res.status(500).send(
            page(
                "Not configured",
                `<h1 style="font-size:20px;margin:0 0 8px;">Server not configured</h1>
                 <p style="color:${COLORS.dim};margin:0;font-size:15px;">MODERATE_SECRET is missing on the server.</p>`,
                COLORS.red
            )
        )
    }

    const cfg = TYPES[type]
    const validAction = action === "approve" || action === "reject"
    const tokenOk =
        cfg &&
        validAction &&
        id &&
        token &&
        safeEqual(token, sign(secret, type, id, action))

    if (!tokenOk) {
        return res.status(400).send(
            page(
                "Invalid link",
                `<h1 style="font-size:20px;margin:0 0 8px;">This link isn't valid</h1>
                 <p style="color:${COLORS.dim};margin:0;font-size:15px;line-height:1.5;">It may have been altered or is incomplete. Open the original email again, or approve the item directly in Airtable.</p>`,
                COLORS.red
            )
        )
    }

    const isApprove = action === "approve"
    const accent = isApprove ? COLORS.green : COLORS.amber

    // GET (incl. email link prefetch/scanners) → confirmation page only.
    // No write ever happens on GET.
    if (req.method !== "POST") {
        const qs =
            `type=${encodeURIComponent(type)}` +
            `&id=${encodeURIComponent(id)}` +
            `&action=${encodeURIComponent(action)}` +
            `&token=${encodeURIComponent(token)}`
        return res.status(200).send(
            page(
                isApprove ? "Confirm approve" : "Confirm reject",
                `<div style="font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${accent};margin-bottom:14px;">${esc(type)} submission</div>
                 <h1 style="font-size:22px;margin:0 0 10px;line-height:1.15;">${isApprove ? "Approve this submission?" : "Reject this submission?"}</h1>
                 <p style="color:${COLORS.dim};margin:0 0 24px;font-size:15px;line-height:1.55;">${isApprove ? "It will go live on the site immediately." : "It will stay hidden and be marked rejected."}</p>
                 <form method="POST" action="/api/moderate?${qs}">
                   <button type="submit" style="width:100%;background:${accent};color:${COLORS.bg};border:0;border-radius:9px;padding:15px;font-size:15px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;">${isApprove ? "Confirm approve" : "Confirm reject"}</button>
                 </form>
                 <p style="color:${COLORS.faint};margin:18px 0 0;font-size:12px;text-align:center;">You can also do this in Airtable.</p>`,
                accent
            )
        )
    }

    // POST → perform the update via the existing write token.
    const fields = isApprove
        ? { [cfg.moderationField]: true, [REJECTED_FIELD]: false }
        : { [cfg.moderationField]: false, [REJECTED_FIELD]: true }

    try {
        const r = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(cfg.table)}/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${process.env.AIRTABLE_WRITE_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fields, typecast: true }),
            }
        )

        if (!r.ok) {
            const detail = (await r.text().catch(() => "")).slice(0, 300)
            return res.status(502).send(
                page(
                    "Couldn't save",
                    `<h1 style="font-size:20px;margin:0 0 8px;">Couldn't update the record</h1>
                     <p style="color:${COLORS.dim};margin:0 0 12px;font-size:14px;line-height:1.5;">Airtable rejected the change. Check the "${esc(cfg.moderationField)}" and "${esc(REJECTED_FIELD)}" fields exist on the <strong>${esc(cfg.table)}</strong> table.</p>
                     <pre style="color:${COLORS.faint};font-size:11px;white-space:pre-wrap;word-break:break-word;margin:0;">${esc(detail)}</pre>`,
                    COLORS.red
                )
            )
        }

        return res.status(200).send(
            page(
                isApprove ? "Approved" : "Rejected",
                `<div style="font-size:42px;line-height:1;margin-bottom:14px;color:${accent};">${isApprove ? "✓" : "✕"}</div>
                 <h1 style="font-size:22px;margin:0 0 10px;line-height:1.15;">${isApprove ? "Approved — it's now live" : "Rejected — hidden from the site"}</h1>
                 <p style="color:${COLORS.dim};margin:0;font-size:15px;">You can close this tab.</p>`,
                accent
            )
        )
    } catch (e) {
        return res.status(502).send(
            page(
                "Something went wrong",
                `<h1 style="font-size:20px;margin:0 0 8px;">Something went wrong</h1>
                 <p style="color:${COLORS.dim};margin:0;font-size:15px;line-height:1.5;">Please try again, or update the record directly in Airtable.</p>`,
                COLORS.red
            )
        )
    }
}
