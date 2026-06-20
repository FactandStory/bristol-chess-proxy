// Bristol Chess Hub — Clubs proxy (api/clubs.js)
//
// Reads the "Clubs" table from Airtable and returns the clubs as clean JSON,
// alphabetised (ignoring a leading "The"). For the ClubsList component.
//
// WHY ITS OWN FILE / SERVER-SIDE TOKEN:
// The original ClubsList hardcoded the Airtable token IN the component — so the
// secret shipped to every visitor's browser (readable in devtools, with full
// base access). This proxy fixes it the same way sponsors.js / events.js do:
// the token is read from process.env.AIRTABLE_TOKEN (a Vercel env var) and
// never leaves the server. The browser only ever sees the JSON below.
//
// FOLLOW-UP: the previously-exposed token should be ROTATED (generate a new
// one, update the Vercel env var, revoke the old), since it has been public.

const AIRTABLE_BASE = "appSaO5ImcmzC2lag"
const AIRTABLE_TABLE = "Clubs"
const EDGE_MAXAGE = 300 // seconds

const CACHE = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Field names map EXACTLY to the Airtable column headers.
const FIELD = {
    name: "Name",
    shortName: "Short Name",
    website: "Website",
    active: "Active", // checkbox
}

async function fetchClubsRaw(token) {
    const cached = CACHE.raw
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return { records: cached.records, hit: true }
    }

    const records = []
    let offset = undefined
    do {
        const url = new URL(
            `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`
        )
        url.searchParams.set("pageSize", "100")
        if (offset) url.searchParams.set("offset", offset)

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        })
        if (!response.ok) {
            const body = await response.text().catch(() => "")
            throw new Error(`Airtable ${response.status}: ${body.slice(0, 200)}`)
        }
        const data = await response.json()
        records.push(...(data.records || []))
        offset = data.offset
    } while (offset)

    CACHE.raw = { records, ts: Date.now() }
    return { records, hit: false }
}

function stripThe(s) {
    return String(s || "").replace(/^The /i, "")
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    if (req.method === "OPTIONS") return res.status(200).end()

    const token = process.env.AIRTABLE_TOKEN
    if (!token) {
        return res
            .status(500)
            .json({ error: "Server missing AIRTABLE_TOKEN. Add it in Vercel and redeploy." })
    }

    // ?inactive=1 includes inactive clubs (default: active only)
    const showInactive =
        req.query && (req.query.inactive === "1" || req.query.inactive === "true")

    try {
        const { records, hit } = await fetchClubsRaw(token)
        const clubs = records
            .map((r) => {
                const f = r.fields || {}
                return {
                    id: r.id,
                    name: f[FIELD.name] || "",
                    shortName: f[FIELD.shortName] || "",
                    website: f[FIELD.website] || "",
                    active: f[FIELD.active] ?? true,
                }
            })
            .filter((c) => c.name && (showInactive || c.active === true))
            .sort((a, b) => stripThe(a.name).localeCompare(stripThe(b.name)))

        res.setHeader("X-Cache", hit ? "HIT" : "MISS")
        res.setHeader("Cache-Control", `s-maxage=${EDGE_MAXAGE}, stale-while-revalidate`)
        return res.status(200).json({ clubs, total: clubs.length })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
