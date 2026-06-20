// Bristol Chess Hub — Notable Games read proxy (api/notable-games.js)
//
// Returns the PUBLISHED notable games — i.e. ONLY rows where Approved = true.
// This is the other half of the moderation loop: the submit proxy creates
// unapproved rows; ticking Approved in Airtable makes a game appear here, and
// therefore on the site. Unticked rows are never returned, so pending/rejected
// submissions stay invisible.
//
// Uses the READ token (process.env.AIRTABLE_TOKEN) — the same one powering
// events/sponsors/sessions. The write token is separate and only used by
// api/submit.js. (This endpoint never writes.)
//
// Caching: short edge cache, same as events — approving a game should show
// within minutes, and the read volume is tiny.

const AIRTABLE_BASE = "appSaO5ImcmzC2lag"
const AIRTABLE_TABLE = "Notable Games"
const EDGE_MAXAGE = 300 // seconds

const CACHE = {}
const CACHE_TTL = 5 * 60 * 1000

const FIELD = {
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
    approved: "Approved",
    submittedAt: "Submitted At",
}

async function fetchRaw(token) {
    const cached = CACHE.raw
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return { records: cached.records, hit: true }
    }
    const records = []
    let offset
    do {
        const url = new URL(
            `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`
        )
        url.searchParams.set("pageSize", "100")
        // Server-side filter: only approved rows ever leave Airtable.
        url.searchParams.set("filterByFormula", "{Approved}=1")
        if (offset) url.searchParams.set("offset", offset)
        const r = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
        if (!r.ok) {
            const body = await r.text().catch(() => "")
            throw new Error(`Airtable ${r.status}: ${body.slice(0, 200)}`)
        }
        const data = await r.json()
        records.push(...(data.records || []))
        offset = data.offset
    } while (offset)
    CACHE.raw = { records, ts: Date.now() }
    return { records, hit: false }
}

function mapGame(rec) {
    const f = rec.fields || {}
    return {
        id: rec.id,
        white: f[FIELD.white] || "",
        black: f[FIELD.black] || "",
        whiteEcf: f[FIELD.whiteEcf] || null,
        blackEcf: f[FIELD.blackEcf] || null,
        whiteRating: f[FIELD.whiteRating] ?? null,
        blackRating: f[FIELD.blackRating] ?? null,
        event: f[FIELD.event] || "",
        date: f[FIELD.date] || null,
        result: f[FIELD.result] || null,
        pgn: f[FIELD.pgn] || "",
        description: f[FIELD.description] || null,
    }
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    if (req.method === "OPTIONS") return res.status(200).end()

    const token = process.env.AIRTABLE_TOKEN
    if (!token) {
        return res.status(500).json({
            error: "Server missing AIRTABLE_TOKEN. Add it in Vercel and redeploy.",
        })
    }

    try {
        const { records, hit } = await fetchRaw(token)
        const games = records
            .map(mapGame)
            // Defensive: only keep rows with an actual PGN (an approved-but-empty
            // row shouldn't render a broken board).
            .filter((g) => g.pgn && g.pgn.trim().length > 0)
            // Newest first by date; rows without a date sort last.
            .sort((a, b) => {
                if (!a.date && !b.date) return 0
                if (!a.date) return 1
                if (!b.date) return -1
                return new Date(b.date) - new Date(a.date)
            })

        res.setHeader("X-Cache", hit ? "HIT" : "MISS")
        res.setHeader("Cache-Control", `s-maxage=${EDGE_MAXAGE}, stale-while-revalidate`)
        return res.status(200).json({ games, total: games.length })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
