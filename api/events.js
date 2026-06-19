// Bristol Chess Hub — Events proxy (What's On section)
//
// Reads the Events table from Airtable and returns the UPCOMING, VISIBLE
// events as a clean JSON list, soonest first, for the What's On component.
//
// WHY ITS OWN FILE (not an action in ecf.js / lms.js):
// ecf.js and lms.js call public, keyless APIs — nothing secret lives in them.
// Airtable requires an authentication token. Keeping the one file that
// touches that token isolated means the secret lives in exactly one place,
// and the keyless proxies stay free of any credential. The token is read
// from process.env.AIRTABLE_TOKEN (set as a Vercel environment variable,
// Production + Preview), so it stays server-side and is NEVER shipped to the
// browser — the component only ever sees the already-filtered JSON below.
//
// CACHING (matches ecf.js's pattern of caching the fetch, computing per-request):
// The RAW Airtable response is cached in-memory for a short window. The
// "upcoming" date filter and sort are then re-applied on EVERY request from
// that cached raw data — so the date logic is always evaluated against "now",
// never frozen at cache time, while Airtable itself is hit at most once per
// window regardless of homepage traffic. The window is deliberately short
// (5 min, vs 24h for the ECF data) because Events is editorial content Matt
// edits by hand: a freshly-added or corrected event should appear within
// minutes, not a day. A sponsor-facing "What's On" showing a stale or
// missed event would be the reputational failure mode, so freshness wins
// here over maximal cache life — Airtable's per-base rate limit (5 req/sec)
// is in no danger from one fetch per 5 minutes.

const AIRTABLE_BASE = "appSaO5ImcmzC2lag"
const AIRTABLE_TABLE = "Events"

// Short raw-fetch cache — see header note on why this is much shorter than ecf.js
const CACHE = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const EDGE_MAXAGE = 300 // seconds — matches the in-memory window

// Field names map EXACTLY to the Airtable column headers. If any column is
// renamed in Airtable, change it here in one place and nowhere else.
const FIELD = {
    name: "Event Name",
    date: "Date",
    endDate: "End Date",
    location: "Location",
    type: "Type",
    format: "Format",
    timeControl: "Time Control",
    ratingQual: "Rating Qualification",
    link: "Link",
    description: "Description",
    show: "Show on Site",
}

// Fetch ALL rows from the Events table, following Airtable's pagination
// offset so we never silently truncate at 100 records. Cached as raw records.
async function fetchEventsRaw(token) {
    const cached = CACHE.raw
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return { records: cached.records, hit: true }
    }

    const records = []
    let offset = undefined
    // Loop pages until Airtable stops returning an offset. The table is small
    // (a handful of events), so this is one page in practice — but handling
    // the offset means it stays correct if the table ever grows past 100 rows.
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

// Day-granularity "today" as a YYYY-MM-DD string. Comparing the date portion
// lexically (ISO dates sort correctly as strings) keeps the upcoming filter
// at DAY resolution — so an event happening TODAY stays visible all day and
// only drops off tomorrow, rather than disappearing the moment its start time
// passes. (Edge case: an event timed just after midnight UK time may sit on
// the previous UTC day; negligible for chess fixtures, noted for honesty.)
function todayYMD() {
    return new Date().toISOString().split("T")[0]
}

function ymd(dateStr) {
    if (!dateStr) return null
    // Airtable date-with-time returns ISO ("2026-03-14T09:30:00.000Z");
    // a date-only field returns "2026-03-14". Either way the first 10 chars
    // are the YYYY-MM-DD we compare on.
    return String(dateStr).slice(0, 10)
}

// Map one Airtable record to the flat shape the component consumes. Missing
// optional fields come back as null (Airtable omits empty fields entirely),
// never undefined, so the component can rely on the keys always existing.
function mapEvent(rec) {
    const f = rec.fields || {}
    return {
        id: rec.id,
        name: f[FIELD.name] || "",
        date: f[FIELD.date] || null,
        end_date: f[FIELD.endDate] || null,
        location: f[FIELD.location] || null,
        type: f[FIELD.type] || null,
        format: f[FIELD.format] || null,
        time_control: f[FIELD.timeControl] || null,
        rating_qualification: f[FIELD.ratingQual] || null,
        link: f[FIELD.link] || null,
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
        // Clear, actionable error rather than a confusing Airtable 401 —
        // tells future-us exactly what's missing if the env var isn't set.
        return res.status(500).json({
            error:
                "Server is missing the AIRTABLE_TOKEN environment variable. Add it in Vercel (Settings → Environment Variables) and redeploy.",
        })
    }

    try {
        const { records, hit } = await fetchEventsRaw(token)
        const today = todayYMD()

        const events = records
            .map(mapEvent)
            // Visible only: the "Show on Site" checkbox. Airtable returns the
            // field as true only when ticked, and omits it entirely when not —
            // so a strict truthy check correctly hides unticked/staged events.
            .filter((e, i) => {
                const rec = records[i]
                return rec.fields && rec.fields[FIELD.show] === true
            })
            // Upcoming only: keep while the event's effective END day is today
            // or later. Effective end = End Date if present (multi-day
            // congresses stay listed through their final day), otherwise the
            // start Date (single-day events show through their own day).
            .filter((e) => {
                const effectiveEnd = ymd(e.end_date) || ymd(e.date)
                if (!effectiveEnd) return false // no usable date → can't place it, omit
                return effectiveEnd >= today
            })
            // Soonest first, by start date. Events with no parseable date were
            // already dropped above, so every remaining item has one.
            .sort((a, b) => (ymd(a.date) || "").localeCompare(ymd(b.date) || ""))

        res.setHeader("X-Cache", hit ? "HIT" : "MISS")
        res.setHeader(
            "Cache-Control",
            `s-maxage=${EDGE_MAXAGE}, stale-while-revalidate`
        )
        return res.status(200).json({ events, total: events.length })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
