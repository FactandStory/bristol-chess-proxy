// Bristol Chess Hub — Live League Stats (api/league-stats.js)
//
// Returns { clubCount, teamCount, divisionCount } computed LIVE from the LMS,
// so any "X clubs · Y teams · Z divisions" headline stat stays accurate as the
// season changes — never a hardcoded literal. Derived from org_id=630 across
// all divisions at runtime.

const LMS_URL = "https://lms.englishchess.org.uk/lms/lmsrest/league/table"
const ORG_ID = 630

const DIVISIONS = [
    "Division 1",
    "Division 2",
    "Division 3",
    "Division 4",
    "Division 5",
    "Division 6",
    "Division 7",
]

const EDGE_MAXAGE = 300 // seconds
const CACHE = {}
const CACHE_TTL = 5 * 60 * 1000

// Strip a trailing team designator to get the club name (same conservative
// rule as the club extractor). Also folds the "J1"/"J2" junior-team suffix so
// e.g. "Bristol & Clifton J1" counts as the Bristol & Clifton club, not a
// separate one.
function clubNameFromTeam(team) {
    const t = String(team || "").trim()
    if (!t) return ""
    // Junior teams: "<club> J1", "<club> J2" → club
    const j = t.match(/^(.*\S)\s+J\d{1,2}$/)
    if (j) return j[1].trim()
    // Standard suffix: single letter / number / small roman
    const m = t.match(/^(.*\S)\s+([A-Z]|\d{1,2}|[IVX]{1,3})$/)
    if (m) return m[1].trim()
    return t
}

async function fetchDivisionTeams(division) {
    const res = await fetch(LMS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ org: ORG_ID, name: division }),
    })
    if (!res.ok) return { division, teams: [] }
    const data = await res.json().catch(() => null)
    if (!data || !data[0] || !data[0].data) return { division, teams: [] }
    const teams = data[0].data
        .map((row) => String(row[0] || "").trim())
        .filter(Boolean)
    return { division, teams }
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    if (req.method === "OPTIONS") return res.status(200).end()

    // serve cached if fresh
    if (CACHE.data && Date.now() - CACHE.ts < CACHE_TTL) {
        res.setHeader("X-Cache", "HIT")
        res.setHeader("Cache-Control", `s-maxage=${EDGE_MAXAGE}, stale-while-revalidate`)
        return res.status(200).json(CACHE.data)
    }

    try {
        const perDivision = await Promise.all(
            DIVISIONS.map((d) => fetchDivisionTeams(d))
        )

        const clubs = new Set()
        let teamCount = 0
        let activeDivisions = 0

        perDivision.forEach(({ teams }) => {
            if (teams.length > 0) activeDivisions++
            teams.forEach((team) => {
                teamCount++
                const club = clubNameFromTeam(team)
                if (club) clubs.add(club)
            })
        })

        const payload = {
            clubCount: clubs.size,
            teamCount,
            divisionCount: activeDivisions,
            updated: new Date().toISOString(),
        }

        CACHE.data = payload
        CACHE.ts = Date.now()

        res.setHeader("X-Cache", "MISS")
        res.setHeader("Cache-Control", `s-maxage=${EDGE_MAXAGE}, stale-while-revalidate`)
        return res.status(200).json(payload)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
