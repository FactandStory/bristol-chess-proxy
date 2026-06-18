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
function parseMatchDate(totals) {
    if (!Array.isArray(totals)) return 0
    for (const t of totals) {
        if (typeof t === "string" && /\d{2}\/\d{2}\/\d{4}/.test(t)) {
            const [d, m, y] = t.trim().match(/\d{2}\/\d{2}\/\d{4}/)[0].split("/")
            return new Date(`${y}-${m}-${d}`).getTime()
        }
    }
    return 0
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
    if (action === "debug_board") {
        try {
            const data = await fetchLmsMatch(DIVISIONS[0])
            if (!data || !Array.isArray(data) || !data[0]?.data?.[0]) {
                return res.status(200).json({ error: "No match data found", raw: data })
            }
            const sampleBoard = data[0].data[0]
            const sampleMatch = { totals: data[0].totals }
            return res.status(200).json({
                board_keys: Object.keys(sampleBoard),
                board_sample: sampleBoard,
                match_keys: Object.keys(data[0]),
                match_totals: sampleMatch.totals,
            })
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }

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
                    const matchTs = parseMatchDate(match.totals || [])

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

                        // board number confirmed present in LMS API via third-party
                        // library inspection (github.com/ojb500/ecf-lms-api). Field
                        // may be "board", "board_no", or similar — storing raw value
                        // so you can verify the exact field name against a real response
                        // before the colour derivation is relied upon by the UI.
                        const boardNo = board.board ?? board.board_no ?? board.boardNo ?? null
                        // Colour convention: in English league chess, away team
                        // typically has White on odd boards. This may vary by league —
                        // verify against a known game before shipping the colour module.
                        const colour = boardNo !== null
                            ? (!playerIsHome && boardNo % 2 === 1) || (playerIsHome && boardNo % 2 === 0)
                                ? "white"
                                : "black"
                            : null

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
