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

// Shared helper: fetch + merge all Bristol club rosters into one deduped player list.
// Used by bristol_players, bristol_improvement, bristol_trajectory, and player_year
// so every action sees the same player set and the same column-parsing logic.
// Fetches every Bristol & Districts club's player roster and returns a
// de-duplicated list with whichever rating domain is requested. Domain
// defaults to "std" (Standard) so every existing caller behaves exactly as
// before without changes. "rpd" (Rapid) and "btz" (Blitz) read different
// columns from the SAME already-fetched v2/club_players response — no new
// ECF calls are needed to support multiple formats, since club_players
// returns std/rpd/btz as parallel columns for every player already.
// IMPORTANT: many players have no Rapid or Blitz rating at all (column is
// null) even when they have a Standard rating — confirmed from real Bristol
// club data, not assumed. This is expected and handled as null throughout,
// not coerced to 0 or treated as an error.
async function getAllBristolPlayers(domain = "std") {
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
            rating: cols.indexOf(domain), // "std", "rpd", or "btz"
        }
        rows.forEach(p => {
            const ecf = idx.ecf >= 0 ? p[idx.ecf] : p[0]
            if (!ecf || seen.has(ecf)) return
            seen.add(ecf)
            const rating = idx.rating >= 0 ? p[idx.rating] : null
            const ratingNum = rating ? parseInt(String(rating).replace(/[^0-9]/g, "")) : NaN
            const full = idx.full >= 0 && p[idx.full]
                ? p[idx.full]
                : `${p[idx.fname] || ""} ${p[idx.lname] || ""}`.trim()
            players.push({
                ecf_code: ecf,
                full_name: full,
                club: clubName(clubCode, idx.club >= 0 ? p[idx.club] : ""),
                std_current: isNaN(ratingNum) || ratingNum === 0 ? null : ratingNum,
            })
        })
    })

    return players
}

// Maps the dashboard's format selector to both naming conventions the ECF
// API actually uses: club_players' columns are "std"/"rpd"/"btz", while the
// per-player ratings-history endpoint uses single letters "S"/"R"/"B" (per
// ECF's own documented API). Both conventions are real and different — not
// a typo — so this mapping exists once here rather than being duplicated
// or, worse, conflated, across the multiple actions that need it.
const RATING_DOMAINS = {
    std: { column: "std", historyLetter: "S", label: "Standard" },
    rpd: { column: "rpd", historyLetter: "R", label: "Rapid" },
    btz: { column: "btz", historyLetter: "B", label: "Blitz" },
}
function resolveDomain(input) {
    return RATING_DOMAINS[input] ? input : "std"
}

function getYearAgoDate() {
    const now = new Date()
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)
    return yearAgo.toISOString().split("T")[0]
}

function parseRevisedRating(hist) {
    if (!hist || !hist.revised_rating) return null
    const n = parseInt(String(hist.revised_rating).replace(/[^0-9]/g, ""))
    return isNaN(n) || n === 0 ? null : n
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    if (req.method === "OPTIONS") return res.status(200).end()

    const { endpoint, action, ecf_code, domain: domainParam } = req.query

    // Special action: fetch all Bristol clubs and return merged player list
    if (action === "bristol_players") {
        try {
            const allPlayers = await getAllBristolPlayers()
            const players = allPlayers.map(p => ({
                ecf_code: p.ecf_code,
                full_name: p.full_name,
                club: p.club,
                std: p.std_current,
                rpd: null,
                btz: null,
                member_no: null,
            }))

            res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            return res.status(200).json({ players, total: players.length })
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // Special action: get rating history for top Bristol players to calculate improvement
    if (action === "bristol_improvement") {
        try {
            const allPlayers = await getAllBristolPlayers()
            const players = allPlayers.filter(p => p.std_current !== null)

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

                const prevRating = parseRevisedRating(prev)
                if (!prevRating) return

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

    // Special action: fetch 12-month trajectory data for Bristol players across all rating bands
    if (action === "bristol_trajectory") {
        try {
            const allPlayers = await getAllBristolPlayers()
            const sampled = allPlayers.filter(p => p.std_current !== null)

            const yearAgoDate = getYearAgoDate()

            // Fetch year-ago ratings for all sampled players
            const historyResults = await Promise.all(
                sampled.map(p =>
                    fetchECF(`v2/ratings/S/${p.ecf_code}/${yearAgoDate}`)
                        .then(r => ({ ecf: p.ecf_code, hist: r.data }))
                        .catch(() => ({ ecf: p.ecf_code, hist: null }))
                )
            )

            // Build trajectory data
            const trajectories = []
            historyResults.forEach(({ ecf, hist }) => {
                const player = sampled.find(p => p.ecf_code === ecf)
                if (!player || !hist) return
                const yearAgoRating = parseRevisedRating(hist)
                if (!yearAgoRating) return
                const delta = player.std_current - yearAgoRating
                trajectories.push({
                    ecf_code: player.ecf_code,
                    full_name: player.full_name,
                    club: player.club,
                    std_current: player.std_current,
                    std_year_ago: yearAgoRating,
                    delta,
                })
            })

            // Sort by delta — biggest movers first
            trajectories.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

            res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            return res.status(200).json({
                players: trajectories,
                year_ago_date: yearAgoDate,
                total: trajectories.length,
            })
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // Special action: "Your Chess Year" module 2 — single player's percentile
    // rank among all currently-rated Bristol & Districts players. Genuinely
    // cheap: unlike player_year/bristol_trajectory, this only needs CURRENT
    // ratings (no year-ago history fetch per player), since percentile rank
    // is a snapshot, not a trajectory. Reuses getAllBristolPlayers(), the
    // same cheap helper bristol_players already relies on.
    if (action === "player_percentile") {
        if (!ecf_code) return res.status(400).json({ error: "Missing ecf_code parameter" })

        const domain = resolveDomain(domainParam)
        const cacheKey = `player_percentile:${ecf_code}:${domain}`
        const cached = CACHE[cacheKey]
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            return res.status(200).json(cached.data)
        }

        try {
            const allPlayers = await getAllBristolPlayers(RATING_DOMAINS[domain].column)
            const player = allPlayers.find(p => p.ecf_code === ecf_code)

            if (!player) {
                return res.status(404).json({ error: "Player not found among Bristol & Districts clubs" })
            }
            if (player.std_current === null) {
                return res.status(404).json({ error: `Player has no current ${RATING_DOMAINS[domain].label} rating` })
            }

            const ratedPlayers = allPlayers.filter(p => p.std_current !== null)
            const allRatings = ratedPlayers.map(p => p.std_current)

            const below = allRatings.filter(r => r < player.std_current).length
            const equal = allRatings.filter(r => r === player.std_current).length
            const total = allRatings.length

            // Standard percentile-rank convention: count strictly below, plus
            // half of any tied players, rather than putting ties entirely
            // above or below — a player tied with others sits at the
            // midpoint of that tied group, not artificially at its edge.
            const percentile = Math.round(((below + equal * 0.5) / total) * 1000) / 10

            const payload = {
                ecf_code: player.ecf_code,
                std_current: player.std_current,
                percentile,
                rank: total - below, // 1 = highest rated, total = lowest rated
                total_players: total,
                domain,
                domain_label: RATING_DOMAINS[domain].label,
            }

            CACHE[cacheKey] = { data: payload, ts: Date.now() }
            res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            return res.status(200).json(payload)
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // Special action: "Your Chess Year" — single player's 12-month rating journey,
    // plus the Bristol-wide average delta over the same window for comparison.
    // Reuses the same year-ago-date convention as bristol_trajectory so the two
    // datasets stay directly comparable. Cached per ECF code for 24h via fetchECF's
    // own cache on the underlying v2/ratings call, plus a short-lived in-memory
    // cache here for the merged player_year payload itself.
    if (action === "player_year") {
        if (!ecf_code) return res.status(400).json({ error: "Missing ecf_code parameter" })

        const domain = resolveDomain(domainParam)
        const cacheKey = `player_year:${ecf_code}:${domain}`
        const cached = CACHE[cacheKey]
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            return res.status(200).json(cached.data)
        }

        try {
            const allPlayers = await getAllBristolPlayers(RATING_DOMAINS[domain].column)
            const player = allPlayers.find(p => p.ecf_code === ecf_code)

            if (!player) {
                return res.status(404).json({ error: "Player not found among Bristol & Districts clubs" })
            }
            if (player.std_current === null) {
                return res.status(404).json({ error: `Player has no current ${RATING_DOMAINS[domain].label} rating` })
            }

            const yearAgoDate = getYearAgoDate()

            // Player's own year-ago rating, plus the full Bristol trajectory set so we
            // can compute a Bristol-wide average delta. The Bristol set is the same
            // shape bristol_trajectory builds, computed inline here rather than via a
            // second HTTP round-trip, since fetchECF's own cache makes the repeated
            // v2/ratings calls free on the 24h window.
            const ratedPlayers = allPlayers.filter(p => p.std_current !== null)

            const historyResults = await Promise.all(
                ratedPlayers.map(p =>
                    fetchECF(`v2/ratings/${RATING_DOMAINS[domain].historyLetter}/${p.ecf_code}/${yearAgoDate}`)
                        .then(r => ({ ecf: p.ecf_code, hist: r.data }))
                        .catch(() => ({ ecf: p.ecf_code, hist: null }))
                )
            )

            let bristolDeltaSum = 0
            let bristolDeltaCount = 0
            let playerYearAgoRating = null

            historyResults.forEach(({ ecf, hist }) => {
                const p = ratedPlayers.find(pp => pp.ecf_code === ecf)
                if (!p || !hist) return
                const yearAgoRating = parseRevisedRating(hist)
                if (!yearAgoRating) return
                const delta = p.std_current - yearAgoRating
                bristolDeltaSum += delta
                bristolDeltaCount += 1
                if (ecf === ecf_code) playerYearAgoRating = yearAgoRating
            })

            const bristolAvgDelta = bristolDeltaCount > 0
                ? Math.round(bristolDeltaSum / bristolDeltaCount)
                : 0

            // No year-ago Standard rating found — could mean genuinely new to ratings,
            // OR could mean they started playing Standard after the year-ago date.
            // Before flagging as new, check if they have ANY historical rating within
            // the past 24 months — if so, use the earliest available point instead.
            if (playerYearAgoRating === null) {
                // Try monthly snapshots going back 24 months to find the earliest rating
                const fallbackDates = []
                const now = new Date()
                for (let i = 1; i <= 24; i++) {
                    const d = new Date(now)
                    d.setMonth(d.getMonth() - i)
                    d.setDate(1)
                    fallbackDates.push(d.toISOString().split("T")[0])
                }
                const fallbackResults = await Promise.all(
                    fallbackDates.map(date =>
                        fetchECF(`v2/ratings/${RATING_DOMAINS[domain].historyLetter}/${ecf_code}/${date}`)
                            .then(r => ({ date, rating: parseRevisedRating(r.data) }))
                            .catch(() => ({ date, rating: null }))
                    )
                )
                // Find the earliest month they had a rating
                const firstRated = fallbackResults.slice().reverse().find(p => p.rating !== null)
                if (firstRated) {
                    // They have history — use the earliest available rating as the baseline
                    playerYearAgoRating = firstRated.rating
                }
            }

            // Still no rating found anywhere in past 24 months — genuinely new player
            if (playerYearAgoRating === null) {
                const payload = {
                    ecf_code: player.ecf_code,
                    full_name: player.full_name,
                    club: player.club,
                    std_current: player.std_current,
                    std_year_ago: null,
                    delta: null,
                    bristol_avg_delta: bristolAvgDelta,
                    bristol_sample_size: bristolDeltaCount,
                    year_ago_date: yearAgoDate,
                    is_new_player: true,
                    domain,
                    domain_label: RATING_DOMAINS[domain].label,
                }
                CACHE[cacheKey] = { data: payload, ts: Date.now() }
                res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
                return res.status(200).json(payload)
            }

            // Fetch monthly rating snapshots for the player's own sparkline.
            // 13 date points (1st of each month for past 12 months + current)
            // run in parallel and are cached 24h — fast and cheap.
            const monthlyDates = []
            const today = new Date()
            for (let i = 12; i >= 0; i--) {
                const d = new Date(today)
                d.setMonth(d.getMonth() - i)
                d.setDate(1)
                monthlyDates.push(d.toISOString().split("T")[0])
            }

            const monthlyRatings = await Promise.all(
                monthlyDates.map(date =>
                    fetchECF(`v2/ratings/${RATING_DOMAINS[domain].historyLetter}/${ecf_code}/${date}`)
                        .then(r => ({ date, rating: parseRevisedRating(r.data) }))
                        .catch(() => ({ date, rating: null }))
                )
            )

            // Filter to points where a rating exists, deduplicate consecutive
            // identical values (ECF only publishes when a game is graded, so
            // many months will repeat the previous value — we keep unique
            // turning points for a cleaner sparkline).
            const historyPoints = monthlyRatings
                .filter(p => p.rating !== null)
                .filter((p, i, arr) => i === 0 || p.rating !== arr[i - 1].rating)

            const payload = {
                ecf_code: player.ecf_code,
                full_name: player.full_name,
                club: player.club,
                std_current: player.std_current,
                std_year_ago: playerYearAgoRating,
                delta: player.std_current - playerYearAgoRating,
                bristol_avg_delta: bristolAvgDelta,
                bristol_sample_size: bristolDeltaCount,
                year_ago_date: yearAgoDate,
                is_new_player: false,
                domain,
                domain_label: RATING_DOMAINS[domain].label,
                history: historyPoints,  // [{date, rating}, ...] for sparkline
            }

            CACHE[cacheKey] = { data: payload, ts: Date.now() }

            res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            return res.status(200).json(payload)
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

    // Fetch a player's ECF game history — used by lms.js to get real game dates
    // for chronological ordering of the season dot sequence. Returns a list of
    // games with date, opponent name, result, and colour. Cached 24h since ECF
    // grades are published in batches and don't change frequently.
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
