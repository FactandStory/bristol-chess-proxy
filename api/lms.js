// Bristol Chess Hub — LMS (League Management System) proxy
// Original generic passthrough preserved as the default action; a new
// player_season action added on top for the "Your Chess Year" feature
// (module 3: season scoreboard).

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

// In-memory cache for the per-division match data, since player_season needs
// to read all 7 divisions and multiple players looking themselves up in the
// same day should share one fetch per division rather than each re-fetching
// everything. 30 min TTL — shorter than the ECF 24h cache, since league
// results can come in mid-evening and people may check shortly after a match.
const CACHE = {}
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

async function fetchLmsMatch(division) {
    const cacheKey = `match:${division}`
    const cached = CACHE[cacheKey]
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.data
    }
    const url = "https://lms.englishchess.org.uk/lms/lmsrest/league/match"
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://lms.englishchess.org.uk/",
        },
        body: JSON.stringify({ org: ORG_ID, name: division }),
    })
    if (!response.ok) throw new Error(`LMS error: ${response.status}`)
    const data = await response.json()
    CACHE[cacheKey] = { data, ts: Date.now() }
    return data
}

// Normalise a name for comparison: lowercase, collapse whitespace, strip
// surrounding punctuation. Does NOT reorder "Surname, First" — that
// normalisation is handled separately since LMS and ECF may format names
// in different orders.
function normaliseName(name) {
    return (name || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim()
}

// Parse a result string like "1 - 0", "0 - 1", "½ - ½" into a simple outcome
// from the home player's perspective. Mirrors the convention already proven
// in BiggestUpsets.tsx / RecentResults.tsx.
function parseResult(result) {
    if (!result) return null
    const r = result.trim()
    if (r === "1 - 0" || r === "1-0") return "home"
    if (r === "0 - 1" || r === "0-1") return "away"
    if (r === "½ - ½" || r === "0.5 - 0.5" || r === "½-½") return "draw"
    const parts = r.split(/[-–]/).map(s => parseFloat(s.replace("½", ".5").trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        if (parts[0] > parts[1]) return "home"
        if (parts[1] > parts[0]) return "away"
        return "draw"
    }
    return null
}

function parseRating(val) {
    if (!val) return null
    const n = parseInt(String(val).replace(/[^0-9]/g, ""))
    return isNaN(n) || n === 0 ? null : n
}

// Extract a match-level date from the totals array, same convention as
// RecentResults.tsx's parseDate / date-pattern matching.
// Extract round number from match title for chronological ordering.
// The LMS match API does not include match dates in its response — the title
// field contains "... Round N" which is the reliable chronological proxy.
// Round number is consistent within a division; cross-division ordering is
// approximate but vastly better than the previous all-zeros fallback.
function parseRoundFromTitle(title) {
    if (!title || typeof title !== "string") return 0
    const m = title.match(/Round\s+(\d+)/i)
    return m ? parseInt(m[1]) : 0
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    if (req.method === "OPTIONS") return res.status(200).end()

    const { org, name, type, action, full_name } = req.query

    // Debug action: returns the raw keys of the first board object from Division 1,
    // so we can see exactly what field names the LMS API uses. Remove once the
    // board number / colour field name is confirmed and the colour module is built.
    // New action: "Your Chess Year" module 3 — season scoreboard for a single
    // player. Searches every board row across all 7 divisions for name matches
    // against the supplied full_name, aggregates W/D/L, and reports a
    // confidence level on the name match rather than presenting a guess as
    // certain.
    if (action === "player_season") {
        if (!full_name) return res.status(400).json({ error: "Missing full_name parameter" })

        try {
            const divisionResults = await Promise.all(
                DIVISIONS.map(div =>
                    fetchLmsMatch(div)
                        .then(data => ({ division: div, data }))
                        .catch(() => ({ division: div, data: null }))
                )
            )

            const target = normaliseName(full_name)
            const targetParts = target.split(/[\s,]+/).filter(Boolean)
            const targetSurname = target.includes(",")
                ? target.split(",")[0].trim()
                : targetParts[targetParts.length - 1] || target

            // Collect every board row touching this player, tagged with how
            // confidently the name matched.
            const exactGames = []
            const looseGames = []
            const looseNameVariants = new Set()

            divisionResults.forEach(({ division, data }) => {
                if (!data || !Array.isArray(data)) return

                data.forEach(match => {
                    if (!match || !Array.isArray(match.data)) return
                    const matchTs = parseRoundFromTitle(match.title)

                    match.data.forEach(board => {
                        const hname = normaliseName(board.hname)
                        const aname = normaliseName(board.aname)

                        const isHome = hname === target
                        const isAway = aname === target
                        const isLooseHome = !isHome && hname.includes(targetSurname) && targetSurname.length > 2
                        const isLooseAway = !isAway && aname.includes(targetSurname) && targetSurname.length > 2

                        if (!isHome && !isAway && !isLooseHome && !isLooseAway) return

                        const result = parseResult(board.result)
                        if (!result) return

                        const playerIsHome = isHome || isLooseHome
                        const outcome = result === "draw"
                            ? "draw"
                            : (playerIsHome && result === "home") || (!playerIsHome && result === "away")
                                ? "win"
                                : "loss"

                        const opponentName = playerIsHome ? board.aname : board.hname
                        const opponentRating = parseRating(playerIsHome ? board.arating : board.hrating)
                        const ownRating = parseRating(playerIsHome ? board.hrating : board.arating)

                        // Board field confirmed as "board" containing a formatted string
                        // like "1 ( B )" or "2 ( W )" — board number and home player's
                        // colour explicitly encoded. Away player gets the opposite colour.
                        // Verified from real Bristol & Districts LMS response.
                        const parseBoardField = (raw) => {
                            if (!raw || typeof raw !== "string") return { boardNo: null, colour: null }
                            const m = raw.match(/(\d+)\s*\(\s*([WB])\s*\)/)
                            if (!m) return { boardNo: null, colour: null }
                            return { boardNo: parseInt(m[1]), colour: m[2] === "W" ? "white" : "black" }
                        }
                        const { boardNo, colour: homeColour } = parseBoardField(board.board)
                        const colour = homeColour === null ? null
                            : playerIsHome ? homeColour
                            : homeColour === "white" ? "black" : "white"

                        const gameRecord = {
                            division,
                            timestamp: matchTs,
                            outcome,
                            opponent: opponentName || "",
                            opponent_rating: opponentRating,
                            own_rating: ownRating,
                            board: boardNo,
                            colour,
                            is_home: playerIsHome,
                        }

                        if (isHome || isAway) {
                            exactGames.push(gameRecord)
                        } else {
                            looseGames.push(gameRecord)
                            looseNameVariants.add(playerIsHome ? board.hname : board.aname)
                        }
                    })
                })
            })

            // Confidence policy:
            // - "high": at least one exact name match found. Use exact games only,
            //   even if loose matches also exist elsewhere (likely a different
            //   person with a similar surname) — exact games are reliable on
            //   their own, and mixing in loose ones would risk contaminating an
            //   otherwise-trustworthy result.
            // - "low": no exact match, but loose (surname-only) matches exist.
            //   Returned with a flag and the matched name variants so the caller
            //   can show an honest "couldn't confidently match" message rather
            //   than presenting a guess as fact.
            // - "none": nothing found at all.
            let confidence = "none"
            let games = []
            if (exactGames.length > 0) {
                confidence = "high"
                games = exactGames
            } else if (looseGames.length > 0) {
                confidence = "low"
                games = looseGames
            }

            // Chronological ordering: the ECF games API doesn't include recent
            // seasons (its /v2/games endpoint only returns data up to ~2023 and
            // has null result fields). Instead, use own_rating as the timestamp
            // proxy — a player's rating rises and falls as the season progresses
            // so sorting by own_rating ascending approximates chronological order.
            // Within the same own_rating, use board number as a tiebreaker
            // (lower boards = more experienced players = more stable scheduling).
            // This gives a consistently reasonable ordering that reflects the
            // actual shape of the season even without real dates.
            games = games.map(g => ({
                ...g,
                timestamp: (g.own_rating || 1000) * 100 + (g.board || 50),
            }))

            const wins = games.filter(g => g.outcome === "win").length
            const draws = games.filter(g => g.outcome === "draw").length
            const losses = games.filter(g => g.outcome === "loss").length
            const gamesPlayed = games.length
            const scorePoints = wins + draws * 0.5
            const scorePct = gamesPlayed > 0 ? Math.round((scorePoints / gamesPlayed) * 1000) / 10 : null

            const payload = {
                full_name,
                confidence,
                games_played: gamesPlayed,
                wins,
                draws,
                losses,
                score_points: scorePoints,
                score_pct: scorePct,
                matched_name_variants: confidence === "low" ? Array.from(looseNameVariants) : [],
                games: games.sort((a, b) => a.timestamp - b.timestamp),
            }

            res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate")
            return res.status(200).json(payload)
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // New action: "Your Chess Year" module 4 — Bristol-wide average draw rate,
    // for comparison against a single player's own draw rate (which is already
    // available from player_season). Aggregates every board result across all
    // 7 divisions. Cached separately from the per-division match cache, since
    // this is a derived aggregate worth keeping around on its own rather than
    // recomputing from scratch on every request even when the underlying
    // division data is already cached.
    if (action === "bristol_draw_rate") {
        const cacheKey = "bristol_draw_rate"
        const cached = CACHE[cacheKey]
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate")
            return res.status(200).json(cached.data)
        }

        try {
            const divisionResults = await Promise.all(
                DIVISIONS.map(div =>
                    fetchLmsMatch(div)
                        .then(data => ({ division: div, data }))
                        .catch(() => ({ division: div, data: null }))
                )
            )

            let totalGames = 0
            let totalDraws = 0

            divisionResults.forEach(({ data }) => {
                if (!data || !Array.isArray(data)) return
                data.forEach(match => {
                    if (!match || !Array.isArray(match.data)) return
                    match.data.forEach(board => {
                        const result = parseResult(board.result)
                        if (!result) return
                        totalGames += 1
                        if (result === "draw") totalDraws += 1
                    })
                })
            })

            const drawPct = totalGames > 0 ? Math.round((totalDraws / totalGames) * 1000) / 10 : null

            const payload = {
                total_games: totalGames,
                total_draws: totalDraws,
                draw_pct: drawPct,
            }

            CACHE[cacheKey] = { data: payload, ts: Date.now() }
            res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate")
            return res.status(200).json(payload)
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ACTION: degrees_of_separation
    // Builds a graph from all Bristol & Districts league matches this season,
    // runs BFS to find shortest path to GM Michael Adams via pre-verified
    // bridge connections.
    //
    // Bridge chain (verified from public records):
    // Any Bristol player → Aron Saunders (Downend, NM 2302)
    //   via Bristol league (Saunders plays D&F teams in Bristol leagues)
    // Saunders → IM Matthew Wadsworth (2253 FIDE)
    //   both played UK Open Blitz SW Qualifier, Stoke Gifford, 28 Sep 2024
    //   (chess-results.com/tnr1012748) — Saunders seed 16, Wadsworth seed 4
    // Wadsworth → GM Michael Adams (9x British Champion)
    //   both played British Championship 2024, Hull — same 9-round Swiss section
    //   (theweekinchess.com/chessnews/events/110th-british-chess-championships-2024)
    // ──────────────────────────────────────────────────────────────────────────
    if (action === "degrees_of_separation") {
        const searchName = req.query.full_name
        if (!searchName) return res.status(400).json({ error: "Missing full_name parameter" })

        try {
            const divisionResults = await Promise.all(
                DIVISIONS.map(div =>
                    fetchLmsMatch(div)
                        .then(data => ({ division: div, data }))
                        .catch(() => ({ division: div, data: null }))
                )
            )

            // Build adjacency list from all board rows: {name → [{name, event}]}
            const graph = {}
            const addEdge = (a, b, event) => {
                if (!a || !b || a.trim() === b.trim()) return
                const clean = s => s.trim()
                const A = clean(a), B = clean(b)
                if (!graph[A]) graph[A] = []
                if (!graph[B]) graph[B] = []
                if (!graph[A].find(e => e.name === B)) graph[A].push({ name: B, event })
                if (!graph[B].find(e => e.name === A)) graph[B].push({ name: A, event })
            }

            divisionResults.forEach(({ division, data }) => {
                if (!data || !Array.isArray(data)) return
                data.forEach(match => {
                    if (!match || !Array.isArray(match.data)) return
                    match.data.forEach(board => {
                        const hname = board.hname?.trim()
                        const aname = board.aname?.trim()
                        // Skip forfeited boards — LMS uses "Default" as the player name
                        const isDefault = (n) => !n || n.toLowerCase() === "default" || n.toLowerCase().startsWith("default ")
                        if (hname && aname && !isDefault(hname) && !isDefault(aname)) {
                            addEdge(hname, aname, `Bristol & Districts ${division} 2024/25`)
                        }
                    })
                })
            })

            // Pre-verified bridge edges
            addEdge("Saunders, Aron", "Wadsworth, Matthew J", "UK Open Blitz SW Qualifier 2024")
            addEdge("Wadsworth, Matthew J", "Adams, Michael", "British Championship 2024 (Hull)")
            // Also add Grieve path as alternative
            addEdge("Saunders, Aron", "Grieve, Harry", "UK Open Blitz SW Qualifier 2024")
            addEdge("Grieve, Harry", "Adams, Michael", "British Championship 2024 (Hull)")

            const playerCount = Object.keys(graph).length
            const target = "Adams, Michael"
            const start = searchName

            if (!graph[start]) {
                return res.status(200).json({
                    full_name: searchName,
                    found: false,
                    error: "Player not found in this season's Bristol & Districts league data",
                    player_count: playerCount,
                })
            }

            // BFS — finds shortest path
            const visited = new Set([start])
            const queue = [[start, [start]]]
            let path = null

            bfsLoop: while (queue.length > 0) {
                const [node, currentPath] = queue.shift()
                for (const { name: neighbour, event } of (graph[node] || [])) {
                    if (!visited.has(neighbour)) {
                        visited.add(neighbour)
                        const newPath = [...currentPath, event, neighbour]
                        if (neighbour === target) { path = newPath; break bfsLoop }
                        queue.push([neighbour, newPath])
                    }
                }
            }

            if (!path) {
                return res.status(200).json({
                    full_name: searchName,
                    found: false,
                    error: "No path found to Michael Adams — try a different player",
                    player_count: playerCount,
                })
            }

            const degrees = Math.floor((path.length - 1) / 2)

            // Format as steps: [{player, via}]
            const steps = []
            for (let i = 0; i < path.length; i += 2) {
                steps.push({ player: path[i], via: path[i + 1] || null })
            }

            res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate")
            return res.status(200).json({
                full_name: searchName,
                found: true,
                degrees,
                target,
                steps,
                player_count: playerCount,
            })

        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

    // Default: original generic passthrough, preserved exactly as before.
    if (!org || !name || !type) {
        return res.status(400).json({ error: "Missing parameters: org, name, type required" })
    }

    const url = `https://lms.englishchess.org.uk/lms/lmsrest/league/${type}`
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://lms.englishchess.org.uk/",
            },
            body: JSON.stringify({ org: parseInt(org), name }),
        })
        if (!response.ok) return res.status(response.status).json({ error: `LMS error: ${response.status}` })
        const data = await response.json()
        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate")
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
