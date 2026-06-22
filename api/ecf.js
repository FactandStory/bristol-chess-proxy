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
// Per-club last-known-good rosters (raw `data`), kept in memory so a transient
// fetch failure can be BRIDGED rather than silently dropping a whole club's
// players. This is deliberately NOT a blanket "freeze the old data" — a club
// that genuinely returns an empty roster (e.g. a brand-new club ECF hasn't
// populated yet) is reported as empty, never back-filled from stale data. We
// only fall back to last-known-good when a fetch actually ERRORS, and we flag
// it as stale so it's visible in the response, not silently frozen.
const LAST_GOOD_ROSTER = {}

// Diagnostics from the most recent getAllBristolPlayers() run: one entry per
// club code with its load status and player count, so a missing or stale club
// is SURFACED in the API response instead of silently vanishing.
let LAST_ROSTER_DIAG = []

// Fetch one club's roster with resilience. Distinguishes three real states:
//   ok    — got players (refreshes last-known-good)
//   empty — 200 response but zero players (a genuinely empty/new club — respect it)
//   stale — all attempts errored, bridged from last-known-good (flagged, visible)
//   error — all attempts errored and no last-known-good to fall back on
async function fetchClubRoster(code) {
    let lastErr = null
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const r = await fetchECF(`v2/club_players/${code}`)
            const rows = (r && r.data && r.data.players) || []
            if (rows.length > 0) {
                LAST_GOOD_ROSTER[code] = r.data
                return { code, data: r.data, status: "ok", count: rows.length }
            }
            // 200 OK but no players: a genuinely empty roster (e.g. a new club
            // not yet populated by ECF). Respect it — do NOT back-fill stale.
            return { code, data: r.data, status: "empty", count: 0 }
        } catch (e) {
            lastErr = e
            if (attempt < 2) await new Promise(res => setTimeout(res, 300))
        }
    }
    // All attempts errored. Bridge with last-known-good if we have it, but mark
    // it stale so it's visible — never silently freeze a whole club.
    if (LAST_GOOD_ROSTER[code]) {
        const rows = LAST_GOOD_ROSTER[code].players || []
        return { code, data: LAST_GOOD_ROSTER[code], status: "stale", count: rows.length }
    }
    return {
        code, data: null, status: "error", count: 0,
        error: lastErr ? String(lastErr.message || lastErr) : "unknown",
    }
}

async function getAllBristolPlayers(domain = "std") {
    const results = await Promise.all(
        BRISTOL_CLUBS.map(code => fetchClubRoster(code))
    )

    // Record per-club status so callers (and humans) can see exactly which
    // clubs loaded, which were empty, and which fell back to stale data.
    LAST_ROSTER_DIAG = results.map(r => ({
        club: clubName(r.code, ""),
        code: r.code,
        count: r.count,
        status: r.status,
    }))

    const seen = new Set()
    const players = []

    results.forEach(result => {
        if (!result || !result.data) return
        const { data } = result
        const clubCode = result.code
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

// 12 first-of-month dates spanning the rolling 12-month window, oldest first.
// Index 0 == getYearAgoDate() (1st of this month last year); index 11 == 1st
// of the current month. Used to fetch REAL monthly rating snapshots for the
// trajectory sparkline so the line shows the true month-by-month shape rather
// than an interpolated curve between two endpoints.
function getTrajectoryMonths() {
    const now = new Date()
    const dates = []
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        dates.push(d.toISOString().split("T")[0])
    }
    return dates
}

// Start of the current chess season (1 September). The Bristol & District
// season runs Sept–spring, so before September we're still in last year's
// season; from September we're in the new one. Used by bristol_improvement's
// season window so "improvement this season" compares against the player's
// rating at the season's start.
function getSeasonStartDate() {
    const now = new Date()
    const seasonStartYear =
        now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
    return `${seasonStartYear}-09-01`
}

function parseRevisedRating(hist) {
    if (!hist) return null
    // ECF returns revised_rating for established ratings (A/K category)
    // and original_rating for provisional ratings (P category).
    // Both may have a letter suffix (e.g. "1087P") — strip non-digits.
    const raw = hist.revised_rating ?? hist.original_rating ?? hist.rating
    if (!raw) return null
    const n = parseInt(String(raw).replace(/[^0-9]/g, ""))
    return isNaN(n) || n === 0 ? null : n
}

// Run an async fn over items with a bounded number in flight at once. Used to
// avoid firing several hundred simultaneous ECF requests (which gets the burst
// rate-limited); a small pool sails through where a flood is throttled.
async function mapLimit(items, limit, fn) {
    const results = new Array(items.length)
    let next = 0
    async function worker() {
        while (next < items.length) {
            const idx = next++
            results[idx] = await fn(items[idx], idx)
        }
    }
    const pool = Math.min(limit, items.length)
    await Promise.all(Array.from({ length: pool }, worker))
    return results
}

// Fetch a single player's rating at a date, with retry on transient errors.
// Returns the parsed rating, or null. A 200 with no rating (genuinely unrated
// at that date) returns null WITHOUT retrying — only thrown errors retry.
async function fetchRatingAt(code, date, letter, attempts = 3) {
    for (let a = 0; a < attempts; a++) {
        try {
            const r = await fetchECF(`v2/ratings/${letter}/${code}/${date}`)
            return parseRevisedRating(r.data)
        } catch (e) {
            if (a < attempts - 1) await new Promise(res => setTimeout(res, 200))
        }
    }
    return null
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

            // If any club hard-FAILED (errored with no last-known-good to bridge
            // from), don't lock the degraded list into the edge cache for a full
            // day — use a short TTL so it self-heals on the next request once ECF
            // recovers. A genuinely-empty club ("empty") is real, not a failure,
            // so it doesn't trigger this.
            const hardFailed = LAST_ROSTER_DIAG.some(d => d.status === "error")
            res.setHeader(
                "Cache-Control",
                hardFailed
                    ? "s-maxage=600, stale-while-revalidate"
                    : "s-maxage=86400, stale-while-revalidate"
            )
            return res.status(200).json({
                players,
                total: players.length,
                clubs: LAST_ROSTER_DIAG,
            })
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // Special action: get rating history for top Bristol players to calculate improvement
    if (action === "bristol_improvement") {
        try {
            const allPlayers = await getAllBristolPlayers()
            const players = allPlayers.filter(p => p.std_current !== null)

            // window=month (default) compares vs the 1st of last month (the
            // existing 30-day behaviour). window=season compares vs the rating
            // at the start of the current season (1 Sept) — used over the
            // summer when the monthly window is empty.
            const windowParam = (req.query.window || "month").toLowerCase()
            const useSeason = windowParam === "season"

            const now = new Date()
            const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const refDate = useSeason
                ? getSeasonStartDate()
                : prevMonth.toISOString().split("T")[0]

            // Fetch historical ratings for EVERY Bristol player (no rating
            // cap). Most Improved is meritocratic: a lower-rated player who
            // gained the most over the window deserves to rank above a
            // higher-rated player who barely moved. This is the same
            // all-players fan-out that bristol_trajectory already does, and
            // it's protected by the 24h edge cache (s-maxage below) so the
            // expensive fetch only runs on a cache miss / daily revalidation.
            const pool = players
                .slice()
                .sort((a, b) => b.std_current - a.std_current)

            const historyResults = await Promise.all(
                pool.map(p =>
                    fetchECF(`v2/ratings/S/${p.ecf_code}/${refDate}`)
                        .then(r => ({ ecf: p.ecf_code, prev: r.data }))
                        .catch(() => ({ ecf: p.ecf_code, prev: null }))
                )
            )

            // Build improvement list
            const improved = []
            historyResults.forEach(({ ecf, prev }) => {
                const player = pool.find(p => p.ecf_code === ecf)
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
            return res.status(200).json({
                players: improved,
                window: useSeason ? "season" : "month",
                ref_date: refDate,
                prev_date: refDate, // kept for backwards-compat with existing callers
            })
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // Special action: peak Standard rating reached within a window.
    // window=month → highest rating across the last ~30 days
    // window=season → highest rating reached since the season start (1 Sept)
    // "Peak" here means the highest of the player's dated rating snapshots in
    // the window (ECF only re-rates on graded games, so snapshots ARE the
    // rating between games). Reuses the same cheap dated-rating fetch the
    // other actions use; cached 24h.
    if (action === "bristol_peak") {
        try {
            const allPlayers = await getAllBristolPlayers()
            const players = allPlayers.filter(p => p.std_current !== null)

            const windowParam = (req.query.window || "month").toLowerCase()
            const useSeason = windowParam === "season"

            // Build the list of snapshot dates spanning the window.
            const today = new Date()
            const dates = []
            if (useSeason) {
                // 1st of each month from season start (1 Sept) to now, + today
                const start = new Date(getSeasonStartDate())
                const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
                while (cursor <= today) {
                    dates.push(cursor.toISOString().split("T")[0])
                    cursor.setMonth(cursor.getMonth() + 1)
                }
                dates.push(today.toISOString().split("T")[0])
            } else {
                // last ~30 days: today, and ~2 and ~4 weeks back, to catch a
                // recent peak even if it has since dipped
                for (const daysBack of [0, 14, 30]) {
                    const d = new Date(today)
                    d.setDate(d.getDate() - daysBack)
                    dates.push(d.toISOString().split("T")[0])
                }
            }
            const uniqueDates = Array.from(new Set(dates))

            // Only consider the strongest ~100 players (peak lists are top-end)
            const top100 = players
                .sort((a, b) => b.std_current - a.std_current)
                .slice(0, 100)

            const peaks = await Promise.all(
                top100.map(async p => {
                    const snaps = await Promise.all(
                        uniqueDates.map(date =>
                            fetchECF(`v2/ratings/S/${p.ecf_code}/${date}`)
                                .then(r => parseRevisedRating(r.data))
                                .catch(() => null)
                        )
                    )
                    const valid = snaps.filter(v => v !== null)
                    // include current rating as a candidate too
                    if (p.std_current !== null) valid.push(p.std_current)
                    const peak = valid.length ? Math.max(...valid) : null
                    return peak === null
                        ? null
                        : {
                              ecf_code: p.ecf_code,
                              full_name: p.full_name,
                              club: p.club,
                              std: peak,
                              std_current: p.std_current,
                          }
                })
            )

            const ranked = peaks
                .filter(Boolean)
                .sort((a, b) => b.std - a.std)

            res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            return res.status(200).json({
                players: ranked,
                window: useSeason ? "season" : "month",
                total: ranked.length,
            })
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

            // --- Real monthly snapshots for the DISPLAYED players only ---
            // Ranking above only needs the two endpoints (year-ago + current),
            // so the 12-point monthly history is fetched only for the players
            // actually shown: the top climbers and top fallers. This keeps the
            // extra ECF calls bounded (~10 players × 2 sides × 10 mid-months)
            // no matter how large the Bristol list grows. The component shows
            // up to 10 of each, so we enrich 10 of each here.
            const months = getTrajectoryMonths() // 12 month-start dates, oldest first
            const DISPLAY_N = 10
            const toEnrich = [
                ...trajectories
                    .filter(t => t.delta > 0)
                    .sort((a, b) => b.delta - a.delta)
                    .slice(0, DISPLAY_N),
                ...trajectories
                    .filter(t => t.delta < 0)
                    .sort((a, b) => a.delta - b.delta)
                    .slice(0, DISPLAY_N),
            ]

            await Promise.all(
                toEnrich.map(async t => {
                    // months[0] == year-ago (already known); months[11] == now
                    // (std_current). Fetch the 10 real intermediate snapshots.
                    // A month with no published rating comes back null and the
                    // sparkline simply skips it — an honest gap, not a guess.
                    const mid = await Promise.all(
                        months.slice(1, 11).map(date =>
                            fetchECF(`v2/ratings/S/${t.ecf_code}/${date}`)
                                .then(r => parseRevisedRating(r.data))
                                .catch(() => null)
                        )
                    )
                    t.ratings = [t.std_year_ago, ...mid, t.std_current]
                })
            )

            res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            return res.status(200).json({
                players: trajectories,
                year_ago_date: yearAgoDate,
                months,
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
            const letter = RATING_DOMAINS[domain].historyLetter

            const ratedPlayers = allPlayers.filter(p => p.std_current !== null)

            // Bristol-wide year-ago ratings, for the average-change comparison.
            // Fetched with BOUNDED concurrency + per-call retry rather than one
            // giant Promise.all: firing several hundred simultaneous requests at
            // ECF gets the burst rate-limited, and with failures swallowed the
            // whole cohort silently collapsed to zero — which also dragged the
            // viewed player's own baseline to null and mislabelled established
            // players as "new". A small in-flight pool holds up on a cold cache.
            const cohort = await mapLimit(ratedPlayers, 20, async (p) => ({
                ecf: p.ecf_code,
                std_current: p.std_current,
                yearAgo: await fetchRatingAt(p.ecf_code, yearAgoDate, letter),
            }))

            let bristolDeltaSum = 0
            let bristolDeltaCount = 0
            let playerYearAgoRating = null

            cohort.forEach(({ ecf, std_current, yearAgo }) => {
                if (yearAgo === null) return
                bristolDeltaSum += std_current - yearAgo
                bristolDeltaCount += 1
                if (ecf === ecf_code) playerYearAgoRating = yearAgo
            })

            const bristolAvgDelta = bristolDeltaCount > 0
                ? Math.round(bristolDeltaSum / bristolDeltaCount)
                : 0

            // Decoupled safety net: the viewed player's own baseline must never
            // depend on the cohort fetch succeeding. If it didn't come back above,
            // fetch it directly (retried) before resorting to the new-player path.
            if (playerYearAgoRating === null) {
                playerYearAgoRating = await fetchRatingAt(ecf_code, yearAgoDate, letter)
            }

            // Before flagging as new, look back up to 24 months for any earlier
            // rating (they may have started Standard after the year-ago date).
            if (playerYearAgoRating === null) {
                const fallbackDates = []
                const now = new Date()
                for (let i = 1; i <= 24; i++) {
                    const d = new Date(now)
                    d.setMonth(d.getMonth() - i)
                    d.setDate(1)
                    fallbackDates.push(d.toISOString().split("T")[0])
                }
                const fallbackResults = await mapLimit(fallbackDates, 6, async (date) => ({
                    date, rating: await fetchRatingAt(ecf_code, date, letter),
                }))
                const firstRated = fallbackResults.slice().reverse().find(p => p.rating !== null)
                if (firstRated) playerYearAgoRating = firstRated.rating
            }

            // Genuinely no rating anywhere in the past 24 months — new player.
            // Cache this only briefly: a transient ECF wobble must not be able to
            // pin a "new" verdict for a whole day (the bug we just chased).
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
                res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate")
                return res.status(200).json(payload)
            }

            // Monthly snapshots for the player's own sparkline (13 points),
            // bounded + retried for the same resilience reason.
            const monthlyDates = []
            const today = new Date()
            for (let i = 12; i >= 0; i--) {
                const d = new Date(today)
                d.setMonth(d.getMonth() - i)
                d.setDate(1)
                monthlyDates.push(d.toISOString().split("T")[0])
            }
            const monthlyRatings = await mapLimit(monthlyDates, 8, async (date) => ({
                date, rating: await fetchRatingAt(ecf_code, date, letter),
            }))

            // Keep points where a rating exists, dropping consecutive duplicates
            // (ECF republishes the same value between graded games) for a cleaner
            // sparkline that shows only the turning points.
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

            // Only persist the long-lived cache when the cohort actually
            // populated. If it came back empty (ECF degraded for this request),
            // keep the player's correct journey but let it revalidate soon rather
            // than freezing a zero cohort for 24h.
            if (bristolDeltaCount > 0) {
                CACHE[cacheKey] = { data: payload, ts: Date.now() }
                res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
            } else {
                res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate")
            }
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

    // TEMPORARY diagnostic: probe the year-ago ratings endpoint several ways so
    // one request reveals exactly which call shape ECF accepts. Remove after use.
    // Usage: ?action=debug_history&ecf_code=375391J
    if (action === "debug_history") {
        const code = ecf_code || "375391J"
        const numeric = String(code).replace(/[^0-9]/g, "")
        const yearAgo = getYearAgoDate()
        const lastMonth = (() => {
            const d = new Date()
            d.setMonth(d.getMonth() - 1)
            d.setDate(1)
            return d.toISOString().split("T")[0]
        })()

        const headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Referer": "https://rating.englishchess.org.uk/",
        }

        const probe = async (label, endpoint) => {
            const url = `https://rating.englishchess.org.uk/v2/new/api.php?${endpoint}`
            try {
                const r = await fetch(url, { headers })
                let body = null
                let text = ""
                try { body = await r.json() } catch { text = "(non-JSON body)" }
                return {
                    label,
                    endpoint,
                    status: r.status,
                    ok: r.ok,
                    keys: body && typeof body === "object" ? Object.keys(body).slice(0, 20) : null,
                    parsed: body ? parseRevisedRating(body) : null,
                    preview: body ? JSON.stringify(body).slice(0, 400) : text,
                }
            } catch (e) {
                return { label, endpoint, error: String(e.message || e) }
            }
        }

        const results = await Promise.all([
            probe("A: with letter, year-ago", `v2/ratings/S/${code}/${yearAgo}`),
            probe("B: numeric only, year-ago", `v2/ratings/S/${numeric}/${yearAgo}`),
            probe("C: player lookup", `v2/players/code/${code}`),
            probe("D: with letter, last month", `v2/ratings/S/${code}/${lastMonth}`),
        ])

        return res.status(200).json({ code, numeric, yearAgo, lastMonth, results })
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
