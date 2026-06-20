// Bristol Chess Hub — LMS Club Extractor (api/extract-clubs.js)
//
// ONE-OFF HELPER. Pulls every team across all 7 divisions from the LMS, strips
// the team-suffix (the trailing " A" / " B" / " 1" etc.) to derive the CLUB
// name, de-duplicates, and returns a sorted list. Use this to populate the
// Clubs table accurately from live league data instead of transcribing by hand.
//
// It also returns, per club, the raw team names that mapped to it — so you can
// VERIFY the suffix-stripping did the right thing before trusting the list.
//
// Not part of the live site; a tool you hit once, copy the names from, then
// enrich each club with website / short-name by hand in Airtable. Non-league
// clubs (e.g. Portishead Juniors) you add separately by hand.

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

// Strip a trailing team designator to get the club name.
// Handles: "Club A", "Club B", "Club 1", "Club II" — a single trailing token
// that is 1–3 chars and is letters OR roman-ish OR a digit. Conservative: if
// the trailing token looks like a real word (4+ chars), it's left alone.
function clubNameFromTeam(team) {
    const t = String(team || "").trim()
    if (!t) return ""
    // Match a final token after a space: single letter (A–Z), a number (1–9),
    // or 1–3 letters that are all uppercase (covers "II", "III", rare "AB").
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
    if (!res.ok) return []
    const data = await res.json().catch(() => null)
    if (!data || !data[0] || !data[0].data) return []
    return data[0].data.map((row) => String(row[0] || "").trim()).filter(Boolean)
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    if (req.method === "OPTIONS") return res.status(200).end()

    try {
        const perDivision = await Promise.all(
            DIVISIONS.map((d) => fetchDivisionTeams(d).then((teams) => ({ d, teams })))
        )

        // Map club name → set of raw team names that produced it.
        const clubMap = {}
        const allTeams = []
        perDivision.forEach(({ teams }) => {
            teams.forEach((team) => {
                allTeams.push(team)
                const club = clubNameFromTeam(team)
                if (!club) return
                if (!clubMap[club]) clubMap[club] = new Set()
                clubMap[club].add(team)
            })
        })

        const clubs = Object.keys(clubMap)
            .sort((a, b) =>
                a.replace(/^The /i, "").localeCompare(b.replace(/^The /i, ""))
            )
            .map((club) => ({
                club,
                teams: Array.from(clubMap[club]).sort(),
            }))

        return res.status(200).json({
            clubCount: clubs.length,
            teamCount: allTeams.length,
            clubs, // each: { club: "Downend & Fishponds", teams: ["...A","...B"] }
            note: "Verify the 'club' names against their 'teams'. Enrich with website/short-name by hand. Add non-league clubs separately.",
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
