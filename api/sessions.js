// Bristol Chess Hub — Regular Sessions proxy
//
// Reads the "Regular Sessions" table from Airtable and returns the VISIBLE
// standing sessions (club nights, weekly socials) as a clean JSON list,
// ordered Monday → Sunday, for the RegularSessions component.
//
// WHY ITS OWN FILE / OWN TABLE (separate from events.js):
// A recurring session is a different KIND of thing from a dated event — it's a
// standing fixture ("every Thursday, 7:30pm"), not a one-off with a calendar
// date. It has no date to expire, so it never drops off a date filter; instead
// it's ordered by day-of-week. Keeping it in its own table and its own proxy
// means neither data shape contaminates the other, and the events proxy's
// "upcoming / soonest-first" logic stays clean. Shares the same Airtable token
// (process.env.AIRTABLE_TOKEN, server-side only) and the same short editorial
// cache window as events.js — sessions are hand-edited content too.

const AIRTABLE_BASE = "appSaO5ImcmzC2lag"
const AIRTABLE_TABLE = "Regular Sessions"

// The single Type value that defines the competitive stream — same convention
// as events.js. Everything else (Social Play, Other, blank) is social. Most
// regular sessions are social, but a weekly league night can be competitive.
const COMPETITIVE_TYPE = "Competitive Play"

// Day-of-week ordering. Sessions sort by this so the page reads as a week-long
// timetable, Monday at the top. An unknown/blank day sorts last (99).
const DAY_ORDER = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
}
function dayRank(day) {
    return DAY_ORDER[(day || "").trim().toLowerCase()] || 99
}

// Short raw-fetch cache — same rationale as events.js (editorial content,
// freshness matters, Airtable rate limit in no danger from one fetch / 5 min).
const CACHE = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const EDGE_MAXAGE = 300 // seconds

// Field names map EXACTLY to the Airtable column headers. Rename in Airtable →
// change here in one place.
const FIELD = {
    name: "Session Name",
    club: "Club",
    day: "Day",
    time: "Time",
    type: "Type",
    location: "Location",
    description: "Description",
    link: "Link",
    show: "Show on Site",
}

// Fetch ALL rows from the Regular Sessions table, following Airtable's
// pagination offset so we never silently truncate at 100 records.
async function fetchSessionsRaw(token) {
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

// Map one Airtable record to the flat shape the component consumes. Missing
// optional fields come back as null, never undefined, so the component can
// rely on the keys always existing.
function mapSession(rec) {
    const f = rec.fields || {}
    return {
        id: rec.id,
        name: f[FIELD.name] || "",
        club: f[FIELD.club] || null,
        day: f[FIELD.day] || null,
        time: f[FIELD.time] || null,
        type: f[FIELD.type] || null,
        location: f[FIELD.location] || null,
        description: f[FIELD.description] || null,
        link: f[FIELD.link] || null,
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
        const { records, hit } = await fetchSessionsRaw(token)
        // Which stream the caller wants: "competitive", "social", or neither.
        const stream = (req.query.stream || "").toLowerCase()

        const sessions = records
            .map(mapSession)
            // Visible only: the "Show on Site" checkbox. Airtable returns the
            // field as true only when ticked and omits it when not, so a strict
            // truthy check correctly hides unticked/staged sessions.
            .filter((s, i) => {
                const rec = records[i]
                return rec.fields && rec.fields[FIELD.show] === true
            })
            // Stream filter (?stream=competitive | social) — same convention as
            // events.js. Competitive = strictly "Competitive Play"; social =
            // everything else (so a blank/mistyped Type lands in social, never
            // vanishes). No param = everything.
            .filter((s) => {
                if (stream === "competitive") return s.type === COMPETITIVE_TYPE
                if (stream === "social") return s.type !== COMPETITIVE_TYPE
                return true
            })
            // Order Monday → Sunday so the page reads like a weekly timetable.
            // Ties (same day) fall back to session name for a stable order.
            .sort((a, b) => {
                const d = dayRank(a.day) - dayRank(b.day)
                return d !== 0 ? d : (a.name || "").localeCompare(b.name || "")
            })

        res.setHeader("X-Cache", hit ? "HIT" : "MISS")
        res.setHeader(
            "Cache-Control",
            `s-maxage=${EDGE_MAXAGE}, stale-while-revalidate`
        )
        return res.status(200).json({ sessions, total: sessions.length })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
