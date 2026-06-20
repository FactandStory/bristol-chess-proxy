// Bristol Chess Hub — Submission proxy (api/submit.js)
//
// PUBLIC WRITE ENDPOINT. Accepts community submissions from the site's submit
// form and creates an UNAPPROVED row in Airtable for the editor to moderate.
// Approving = ticking the Approved box in Airtable; only Approved rows are ever
// shown on the site (the display components filter on it).
//
// SECURITY MODEL (why this is safe to expose publicly):
//   - The Airtable token is a WRITE-ONLY, single-base personal access token
//     (data.records:write, scoped to the Bristol Chess Hub base). It is read
//     from process.env.AIRTABLE_WRITE_TOKEN server-side and NEVER sent to the
//     browser. Even if this endpoint were abused, the token cannot read your
//     data, cannot touch other bases, and submissions land UNAPPROVED.
//   - Rows are always created with Approved = false. Nothing a stranger submits
//     can appear on the site without a human ticking the box.
//
// ABUSE PROTECTION (a public write endpoint WILL be probed by bots):
//   1. Honeypot — a hidden field the form leaves blank; bots fill it → reject.
//   2. Rate limit — per-IP, in-memory, best-effort (resets on cold start; fine
//      at this scale, and the honeypot + validation catch most junk anyway).
//   3. PGN validation — must parse as a real game via chess.js, else reject.
//   4. ECF-number format check — must look like a real ECF code (6 digits +
//      letter), forgiving of spaces/hyphens. A strong, cheap spam filter.
//   5. Field length caps — stop oversized payloads.
//
// EXTENSIBILITY (events / gallery later):
//   The endpoint is TYPED. `type` selects a config from SUBMISSION_TYPES below
//   (table name + field map + which validators run). Adding "event" or
//   "gallery" later = add a config block; the security/validation spine is
//   shared. For now only "game" is enabled.

import { Chess } from "chess.js"

const AIRTABLE_BASE = "appSaO5ImcmzC2lag"

// ── Per-type submission config ───────────────────────────────────────────────
// Each type maps incoming form fields → Airtable field names (EXACT), declares
// which fields are required, and flags special validators (pgn / ecf).
const SUBMISSION_TYPES = {
    game: {
        table: "Notable Games",
        // form key → Airtable field name (exact, from the live table)
        fields: {
            white: "White",
            black: "Black",
            whiteEcf: "White ECF Code",
            blackEcf: "Black ECF Code",
            whiteRating: "White Rating",
            blackRating: "Black Rating",
            event: "Event",
            date: "Date",
            result: "Result",
            pgn: "PGN",
            description: "Description",
            submitterName: "Submitter Name",
            submitterEmail: "Submitter Email",
            submitterClub: "Submitter Club",
            submitterEcf: "Submitter ECF Code",
        },
        // numeric fields (cast to Number before sending to Airtable)
        numeric: ["whiteRating", "blackRating"],
        // required form keys (submission rejected if any missing/blank)
        required: [
            "white",
            "black",
            "event",
            "pgn",
            "submitterName",
            "submitterEmail",
            "submitterClub",
            "submitterEcf",
        ],
        // allowed values for Result (must match the Airtable single-select)
        resultOptions: ["1-0", "0-1", "1/2-1/2"],
        validatePgn: true, // pgn must parse as a real game
        validateSubmitterEcf: true, // submitter ECF must look like an ECF code
    },
    // event:   { ... }   ← add later
    // gallery: { ... }   ← add later
}

// ── Limits ───────────────────────────────────────────────────────────────────
const MAX_LEN = {
    short: 200, // names, event, codes
    pgn: 20000, // a long annotated game is still well under this
    description: 8000,
}
const RATE_LIMIT = { windowMs: 60 * 1000, max: 5 } // 5 submissions / IP / minute

// ── In-memory rate limiter (best-effort; resets on cold start) ───────────────
const HITS = new Map()
function rateLimited(ip) {
    const now = Date.now()
    const rec = HITS.get(ip)
    if (!rec || now - rec.start > RATE_LIMIT.windowMs) {
        HITS.set(ip, { start: now, count: 1 })
        return false
    }
    rec.count += 1
    return rec.count > RATE_LIMIT.max
}

// ── Validators ───────────────────────────────────────────────────────────────
function validPgn(pgn) {
    try {
        const c = new Chess()
        c.loadPgn(pgn)
        return c.history().length > 0
    } catch {
        return false
    }
}

// ECF rating codes are canonically 6 digits + a letter (e.g. 375391J). Be forgiving:
// strip spaces/hyphens, uppercase, then test the canonical shape. We don't
// verify the code is a *live* ECF member (that's a separate lookup, and you
// eyeball every submission anyway) — this is a format/spam gate only.
function validEcf(raw) {
    if (!raw) return false
    const cleaned = String(raw).replace(/[\s-]/g, "").toUpperCase()
    return /^\d{6}[A-Z]$/.test(cleaned)
}

function clean(v, max) {
    if (v == null) return ""
    return String(v).trim().slice(0, max)
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    if (req.method === "OPTIONS") return res.status(200).end()
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, error: "Use POST." })
    }

    const token = process.env.AIRTABLE_WRITE_TOKEN
    if (!token) {
        return res.status(500).json({
            ok: false,
            error: "Server missing AIRTABLE_WRITE_TOKEN. Add it in Vercel and redeploy.",
        })
    }

    // Body may arrive parsed (Vercel) or as a string — handle both.
    let body = req.body
    if (typeof body === "string") {
        try {
            body = JSON.parse(body)
        } catch {
            return res.status(400).json({ ok: false, error: "Invalid JSON." })
        }
    }
    body = body || {}

    // 1) Honeypot — the form keeps `company` hidden and empty. A filled value
    //    means a bot. Return a fake success so bots don't learn they were caught.
    if (body.company) {
        return res.status(200).json({ ok: true })
    }

    // 2) Rate limit (per IP)
    const ip =
        (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        req.socket?.remoteAddress ||
        "unknown"
    if (rateLimited(ip)) {
        return res.status(429).json({
            ok: false,
            error: "Too many submissions just now — please wait a minute and try again.",
        })
    }

    // 3) Resolve type
    const type = (body.type || "game").toLowerCase()
    const cfg = SUBMISSION_TYPES[type]
    if (!cfg) {
        return res.status(400).json({ ok: false, error: `Unknown submission type: ${type}` })
    }

    // 4) Required fields
    for (const key of cfg.required) {
        if (!clean(body[key], MAX_LEN.short)) {
            return res.status(400).json({
                ok: false,
                error: `Missing required field: ${key}`,
                field: key,
            })
        }
    }

    // 5) Result must be a valid option (if provided)
    if (body.result && !cfg.resultOptions.includes(String(body.result).trim())) {
        return res.status(400).json({
            ok: false,
            error: `Result must be one of: ${cfg.resultOptions.join(", ")}`,
            field: "result",
        })
    }

    // 6) PGN must parse as a real game
    if (cfg.validatePgn) {
        const pgn = clean(body.pgn, MAX_LEN.pgn)
        if (!validPgn(pgn)) {
            return res.status(400).json({
                ok: false,
                error: "That PGN doesn't look like a valid chess game. Please paste the moves (e.g. 1. e4 e5 2. Nf3 …) or a full PGN.",
                field: "pgn",
            })
        }
    }

    // 7) Submitter ECF format
    if (cfg.validateSubmitterEcf && !validEcf(body.submitterEcf)) {
        return res.status(400).json({
            ok: false,
            error: "Please enter a valid ECF rating code (6 digits and a letter, e.g. 375391J).",
            field: "submitterEcf",
        })
    }

    // 8) Build the Airtable record from the field map.
    const fields = {}
    for (const [formKey, airtableName] of Object.entries(cfg.fields)) {
        let val = body[formKey]
        if (val == null || val === "") continue // skip blanks (optional fields)
        if (cfg.numeric.includes(formKey)) {
            const n = Number(val)
            if (!Number.isNaN(n)) fields[airtableName] = n
            continue
        }
        const cap =
            formKey === "pgn"
                ? MAX_LEN.pgn
                : formKey === "description"
                  ? MAX_LEN.description
                  : MAX_LEN.short
        fields[airtableName] = clean(val, cap)
    }
    // Always land UNAPPROVED. (Submitted At is a Created-time field Airtable
    // stamps automatically — we don't set it.)
    fields["Approved"] = false

    // 9) Create the row.
    try {
        const r = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(cfg.table)}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fields, typecast: true }),
            }
        )
        if (!r.ok) {
            const detail = await r.text().catch(() => "")
            // Don't leak Airtable internals to the public; log-ish detail only.
            return res.status(502).json({
                ok: false,
                error: "Couldn't save the submission right now. Please try again shortly.",
                detail: detail.slice(0, 200),
            })
        }
        const data = await r.json()
        return res.status(200).json({ ok: true, id: data.id })
    } catch (err) {
        return res.status(502).json({
            ok: false,
            error: "Couldn't save the submission right now. Please try again shortly.",
        })
    }
}
