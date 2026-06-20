// Bristol Chess Hub — Gallery read proxy (api/gallery.js)
//
// Returns the PUBLISHED gallery photos — ONLY rows where Approved = true. The
// submit proxy creates unapproved rows; ticking Approved publishes a photo here
// and therefore on the site. Uses the READ token (AIRTABLE_TOKEN).
//
// Images are served straight from their Cloudinary URL (stored as text in the
// "Image URL" field), so this proxy just returns metadata + that URL.

const AIRTABLE_BASE = "appSaO5ImcmzC2lag"
const AIRTABLE_TABLE = "Gallery"
const EDGE_MAXAGE = 300

const CACHE = {}
const CACHE_TTL = 5 * 60 * 1000

const FIELD = {
    imageUrl: "Image URL",
    caption: "Caption",
    event: "Event",
    approved: "Approved",
    submittedAt: "Submitted At",
}

async function fetchRaw(token) {
    const cached = CACHE.raw
    if (cached && Date.now() - cached.ts < CACHE_TTL) return { records: cached.records, hit: true }
    const records = []
    let offset
    do {
        const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`)
        url.searchParams.set("pageSize", "100")
        url.searchParams.set("filterByFormula", "{Approved}=TRUE()")
        if (offset) url.searchParams.set("offset", offset)
        const r = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } })
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

function mapPhoto(rec) {
    const f = rec.fields || {}
    return {
        id: rec.id,
        imageUrl: f[FIELD.imageUrl] || "",
        caption: f[FIELD.caption] || null,
        event: f[FIELD.event] || null,
        submittedAt: f[FIELD.submittedAt] || null,
    }
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    if (req.method === "OPTIONS") return res.status(200).end()

    const token = process.env.AIRTABLE_TOKEN
    if (!token) return res.status(500).json({ error: "Server missing AIRTABLE_TOKEN. Add it in Vercel and redeploy." })

    try {
        const { records, hit } = await fetchRaw(token)
        const photos = records
            // Belt-and-braces: in-code approval check, independent of the formula.
            .filter((rec) => rec.fields && rec.fields[FIELD.approved] === true)
            .map(mapPhoto)
            // Only rows with an actual image URL.
            .filter((p) => p.imageUrl && p.imageUrl.startsWith("https://res.cloudinary.com/"))
            // Newest first by submitted time; missing dates sort last.
            .sort((a, b) => {
                if (!a.submittedAt && !b.submittedAt) return 0
                if (!a.submittedAt) return 1
                if (!b.submittedAt) return -1
                return new Date(b.submittedAt) - new Date(a.submittedAt)
            })

        res.setHeader("X-Cache", hit ? "HIT" : "MISS")
        res.setHeader("Cache-Control", `s-maxage=${EDGE_MAXAGE}, stale-while-revalidate`)
        return res.status(200).json({ photos, total: photos.length })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
