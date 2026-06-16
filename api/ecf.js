// ECF club code to full name lookup
const CLUB_NAMES = {
    "4DAF": "Downend & Fishponds",
    "4BAC": "Bristol & Clifton",
    "4BRC": "Bristol Cabot",
    "4BRG": "Bristol Grendel",
    "4SEM": "North Bristol",
    "4BRH": "Horfield & Redland",
    "4PTH": "Portishead",
    "4YAT": "Yate & Sodbury",
    "4SBR": "South Bristol",
    "4369": "The 369 Chess Club",
    "4BRL": "Bristol",
    "4BRU": "Bristol University",
    "4BRJ": "Bristol Juniors",
    "4BRO": "Bristol Royals",
    "4B4K": "Bristol Four Knights",
    "4CAH": "Cadbury Heath",
    "4BRT": "Thornbury Bristol",
    "4UWE": "University of West of England",
    "4ELR": "El Rincon",
    "4KOB": "Knights Of Bristol",
    "4BOM": "Opening Moves",
}

function clubName(code, ecfName) {
    if (ecfName && ecfName.trim()) return ecfName.trim()
    return CLUB_NAMES[code] || code
}

// ECF Ratings proxy with caching
// Caches responses for 24 hours to respect ECF rate limits

const CACHE = {}
const CACHE_TTL = 60 * 60 * 24 * 1000 // 24 hours

// Bristol & Districts club codes
const BRISTOL_CLUBS = [
    "4DAF", "4BAC", "4BRC", "4BRG", "4SEM", "4BRH",
    "4PTH", "4YAT", "4SBR", "4369", "4BRL", "4BRU"
]

async function fetchECF(endpoint) {
    const cached = CACHE[endpoint]
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return { data: cached.data, hit: true }
    }
    const url = `https://rating.englishchess.org.uk/v2/new/api.php?${endpoint}`
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Referer": "https://rating.englishchess.org.uk/",
        },
    })
    if (!response.ok) throw new Error(`ECF error: ${response.status}`)
    const data = await response.json()
    CACHE[endpoint] = { data, ts: Date.now() }
    return { data, hit: false }
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    if (req.method === "OPTIONS") return res.status(200).end()

    const { endpoint, action } = req.query

    // Special action: fetch all Bristol clubs and return merged player list
    if (action === "bristol_players") {
        try {
            const results = await Promise.all(
                BRISTOL_CLUBS.map(code =>
                    fetchECF(`v2/club_players/${code}`)
                        .then(r => ({ ...r, clubCode: code }))
                        .catch(() => null)
                )
            )

            const seen = new Set()
            const players = []

            results.forEach(result => {
                if (!result || !result.data) return
                const { data, clubCode } = result
                const cols = data.column_names || []
                const rows = data.players || []

                const idx = {
                    ecf: cols.indexOf("ECF_code"),
                    full: cols.indexOf("full_name"),
                    fname: cols.indexOf("first_name"),
                    lname: cols.indexOf("last_name"),
                    club: cols.indexOf("club_name"),
                    std: cols.indexOf("std"),
                    rpd: cols.indexOf("rpd"),
                    btz: cols.indexOf("btz"),
                    member_no: cols.indexOf("member_no"),
                }

                rows.forEach(p => {
                    const ecf = idx.ecf >= 0 ? p[idx.ecf] : p[0]
                    if (!ecf || seen.has(ecf)) return
                    seen.add(ecf)

                    const full = idx.full >= 0 && p[idx.full]
                        ? p[idx.full]
                        : `${p[idx.fname] || ""} ${p[idx.lname] || ""}`.trim()

                    players.push({
                        ecf_code: ecf,
                        full_name: full,
                        club: clubName(clubCode, idx.club >= 0 ? p[idx.club] : ""),
                        std: idx.std >= 0 ? p[idx.std] : null,
                        rpd: idx.rpd >= 0 ? p[idx.rpd] : null,
                        btz: idx.btz >= 0 ? p[idx.btz] : null,
                        member_no: idx.member_no >= 0 ? p[idx.member_no] : null,
                    })
                })
            })

            res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            return res.status(200).json({ players, total: players.length })
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // Special action: get rating history for top Bristol players to calculate improvement
    if (action === "bristol_improvement") {
        try {
            // First get all current Bristol players
            const results = await Promise.all(
                BRISTOL_CLUBS.map(code =>
                    fetchECF(`v2/club_players/${code}`)
                        .then(r => ({ ...r, clubCode: code }))
                        .catch(() => null)
                )
            )

            const seen = new Set()
            const players = []

            results.forEach(result => {
                if (!result || !result.data) return
                const { data, clubCode } = result
                const cols = data.column_names || []
                const rows = data.players || []

                const idx = {
                    ecf: cols.indexOf("ECF_code"),
                    full: cols.indexOf("full_name"),
                    fname: cols.indexOf("first_name"),
                    lname: cols.indexOf("last_name"),
                    club: cols.indexOf("club_name"),
                    std: cols.indexOf("std"),
                    member_no: cols.indexOf("member_no"),
                }

                rows.forEach(p => {
                    const ecf = idx.ecf >= 0 ? p[idx.ecf] : p[0]
                    if (!ecf || seen.has(ecf)) return
                    seen.add(ecf)

                    const std = idx.std >= 0 ? p[idx.std] : null
                    if (!std) return // skip unrated

                    const stdNum = parseInt(String(std).replace(/[^0-9]/g, ""))
                    if (isNaN(stdNum) || stdNum === 0) return

                    const full = idx.full >= 0 && p[idx.full]
                        ? p[idx.full]
                        : `${p[idx.fname] || ""} ${p[idx.lname] || ""}`.trim()

                    const clubNameVal = clubName(clubCode, idx.club >= 0 ? p[idx.club] : "")

                    players.push({
                        ecf_code: ecf,
                        full_name: full,
                        club: clubNameVal,
                        std_current: stdNum,
                    })
                })
            })

            // Get previous month's date (1st of last month)
            const now = new Date()
            const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const prevDate = prevMonth.toISOString().split("T")[0]

            // Fetch historical ratings for each player (top 100 by current rating)
            const top100 = players
                .sort((a, b) => b.std_current - a.std_current)
                .slice(0, 100)

            const historyResults = await Promise.all(
                top100.map(p =>
                    fetchECF(`v2/ratings/S/${p.ecf_code}/${prevDate}`)
                        .then(r => ({ ecf: p.ecf_code, prev: r.data }))
                        .catch(() => ({ ecf: p.ecf_code, prev: null }))
                )
            )

            // Build improvement list
            const improved = []
            historyResults.forEach(({ ecf, prev }) => {
                const player = top100.find(p => p.ecf_code === ecf)
                if (!player || !prev) return

                // Previous rating value
                const prevRating = prev.revised_rating
                    ? parseInt(String(prev.revised_rating).replace(/[^0-9]/g, ""))
                    : null

                if (!prevRating || isNaN(prevRating) || prevRating === 0) return

                const delta = player.std_current - prevRating
                improved.push({
                    ...player,
                    std_previous: prevRating,
                    delta,
                })
            })

            // Sort by biggest improvement
            improved.sort((a, b) => b.delta - a.delta)

            res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            return res.status(200).json({ players: improved, prev_date: prevDate })
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // Debug action: see raw U18 response
    if (action === "debug_u18") {
        try {
            const u18Url = "https://rating.englishchess.org.uk/v2/new/list_top_players.php?domain=S&age_limit=U18&age_class=under&age_col=age31dec&nation=ENG&gender=both&type=rating&format=json&count=500"
            const u18Response = await fetch(u18Url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json",
                    "Referer": "https://rating.englishchess.org.uk/",
                },
            })
            if (!u18Response.ok) return res.status(u18Response.status).json({ error: `U18 error: ${u18Response.status}` })
            const data = await u18Response.json()
            // Return first 3 players and keys to understand structure
            const sample = Array.isArray(data) ? data.slice(0, 3) : 
                          data.players ? { keys: Object.keys(data.players[0] || {}), sample: data.players.slice(0, 3) } :
                          { keys: Object.keys(data), raw: JSON.stringify(data).slice(0, 500) }
            return res.status(200).json(sample)
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // Special action: fetch Bristol juniors by cross-referencing national U18 list
    if (action === "bristol_juniors") {
        try {
            // Fetch national U18 list as JSON
            const u18Url = "https://rating.englishchess.org.uk/v2/new/list_top_players.php?domain=S&age_limit=U18&age_class=under&age_col=age31dec&nation=ENG&gender=both&type=rating&format=json&count=500"
            const u18Response = await fetch(u18Url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json",
                    "Referer": "https://rating.englishchess.org.uk/",
                },
            })
            if (!u18Response.ok) throw new Error(`ECF U18 error: ${u18Response.status}`)
            const u18Data = await u18Response.json()

            // Build set of all Bristol player ECF codes
            const bristolResults = await Promise.all(
                BRISTOL_CLUBS.map(code =>
                    fetchECF(`v2/club_players/${code}`)
                        .then(r => ({ ...r, clubCode: code }))
                        .catch(() => null)
                )
            )

            const bristolCodes = new Map()
            bristolResults.forEach(result => {
                if (!result || !result.data) return
                const { data, clubCode } = result
                const cols = data.column_names || []
                const rows = data.players || []
                const ecfIdx = cols.indexOf("ECF_code")
                const clubIdx = cols.indexOf("club_name")
                rows.forEach(p => {
                    const ecf = ecfIdx >= 0 ? p[ecfIdx] : p[0]
                    if (ecf) bristolCodes.set(ecf, clubName(clubCode, clubIdx >= 0 ? p[clubIdx] : ""))
                })
            })

            // Filter U18 list to Bristol players only
            const players = u18Data.players || []
            const bristolJuniors = players
                .map((p, i) => ({ ...p, _index: i + 1 }))
                .filter(p => bristolCodes.has(p.ECFcode))
                .map(p => ({
                    ecf_code: p.ECFcode,
                    full_name: p.full_name || "",
                    club: bristolCodes.get(p.ECFcode) || p.club || "",
                    std: p.current_rating || null,
                    prior: p.prior_rating || null,
                    title: p.title || "",
                    rank_england: p._index,
                }))

            res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            return res.status(200).json({ players: bristolJuniors, total: bristolJuniors.length })
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // Default: proxy any allowed ECF endpoint
    if (!endpoint) return res.status(400).json({ error: "Missing endpoint parameter" })

    const allowed = /^v2\/(club_players|clubs|players|ratings|games)\/|^v2\/new\/list_top_players\.php/
    if (!allowed.test(endpoint)) return res.status(403).json({ error: "Endpoint not allowed" })

    try {
        const { data, hit } = await fetchECF(endpoint)
        res.setHeader("X-Cache", hit ? "HIT" : "MISS")
        res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
