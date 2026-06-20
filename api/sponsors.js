// Bristol Chess Hub — Sponsors proxy
//
// Reads the "Sponsors" table from Airtable and returns the ACTIVE sponsors as a
// clean JSON list, Headline tier first then Supporters. For the Sponsors
// component (homepage teaser + /sponsors page).
//
// WHY ITS OWN FILE / SERVER-SIDE TOKEN:
// The original SponsorsBar hardcoded the Airtable token IN the component —
// meaning the secret shipped to every visitor's browser. This proxy fixes that
// the same way events.js / sessions.js do: the token is read from
// process.env.AIRTABLE_TOKEN (a Vercel env var) and never leaves the server.
// The browser only ever sees the already-filtered JSON below.
//
// CACHING: short raw-fetch cache, same rationale as events.js — sponsors are
// hand-edited editorial content where a freshly-added logo should appear within
// minutes, and Airtable's rate limit is in no danger from one fetch per window.

const AIRTABLE_BASE = "appSaO5ImcmzC2lag"
const AIRTABLE_TABLE = "Sponsors"

// Tier ordering — Headline first (the exclusive marquee slot), then Supporters.
// An unknown/blank tier sorts last so a mistyped value degrades gracefully.
const TIER_ORDER = { headline: 1, supporter: 2 }
function tierRank(tier) {
    return TIER_ORDER[(tier || "").trim().toLowerCase()] || 99
}

const CACHE = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const EDGE_MAXAGE = 300 // seconds

// Field names map EXACTLY to the Airtable column headers.
const FIELD = {
    name: "Name",
    website: "Website",
    logo: "Logo", // Attachment field
    tier: "Tier", // single-select: Headline | Supporter
    active: "Active", // checkbox
}

async function fetchSponsorsRaw(token) {
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
            throw new Error(`Airtable error ${response.status}: ${body.slice(0, 200)}`)
        }
        const data = await response.json()
        records.push(...(data.records || []))
        offset = data.offset
    } while (offset)

    CACHE.raw = { records, ts: Date.now() }
    return { records, hit: false }
}

// Pull the first attachment's URL from an Airtable attachment field. Airtable
// hosts these on its own CDN; fine for a handful of sponsor logos. (If logos
// ever need to survive Airtable URL expiry, we'd mirror them — noted, not
// needed at this scale.)
function firstAttachmentUrl(att) {
    if (Array.isArray(att) && att.length > 0) {
        // Prefer a reasonably-sized thumbnail if present, else the full URL.
        const a = att[0]
        return (a.thumbnails && (a.thumbnails.large?.url || a.thumbnails.full?.url)) || a.url || null
    }
    return null
}

function mapSponsor(rec) {
    const f = rec.fields || {}
    return {
        id: rec.id,
        name: f[FIELD.name] || "",
        website: f[FIELD.website] || null,
        logo: firstAttachmentUrl(f[FIELD.logo]),
        tier: f[FIELD.tier] || null,
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
            error:
                "Server is missing the AIRTABLE_TOKEN environment variable. Add it in Vercel (Settings → Environment Variables) and redeploy.",
        })
    }

    try {
        const { records, hit } = await fetchSponsorsRaw(token)

        const sponsors = records
            .map(mapSponsor)
            // Active only: the "Active" checkbox. Airtable returns true only
            // when ticked and omits it when not, so a strict check hides
            // inactive/staged sponsors.
            .filter((s, i) => {
                const rec = records[i]
                return rec.fields && rec.fields[FIELD.active] === true
            })
            // Headline first, then Supporters; ties fall back to name.
            .sort((a, b) => {
                const d = tierRank(a.tier) - tierRank(b.tier)
                return d !== 0 ? d : (a.name || "").localeCompare(b.name || "")
            })

        // Split out the single headline (if any) so the component doesn't have
        // to re-derive it. headline = first Headline-tier sponsor; the rest
        // (including any extra headline beyond the first) are supporters.
        const headline = sponsors.find((s) => tierRank(s.tier) === 1) || null
        const supporters = sponsors.filter((s) => s !== headline)

        res.setHeader("X-Cache", hit ? "HIT" : "MISS")
        res.setHeader(
            "Cache-Control",
            `s-maxage=${EDGE_MAXAGE}, stale-while-revalidate`
        )
        return res.status(200).json({
            headline,
            supporters,
            sponsors, // full ordered list too, in case the component wants it
            total: sponsors.length,
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
