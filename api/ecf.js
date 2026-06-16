// ECF Ratings proxy with caching
// Fetches from rating.englishchess.org.uk and caches for 24 hours

const CACHE = {}  // In-memory cache (persists for lifetime of serverless instance)
const CACHE_TTL = 60 * 60 * 24 * 1000  // 24 hours in ms

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") return res.status(200).end()

    const { endpoint } = req.query
    if (!endpoint) return res.status(400).json({ error: "Missing endpoint parameter" })

    // Only allow ECF rating API paths
    const allowed = /^v2\/(club_players|clubs|players|ratings|games)\//
    if (!allowed.test(endpoint)) {
        return res.status(403).json({ error: "Endpoint not allowed" })
    }

    // Check cache
    const cached = CACHE[endpoint]
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        res.setHeader("X-Cache", "HIT")
        res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
        return res.status(200).json(cached.data)
    }

    const url = `https://rating.englishchess.org.uk/v2/new/api.php?${endpoint}`

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Referer": "https://rating.englishchess.org.uk/",
            },
        })

        if (!response.ok) return res.status(response.status).json({ error: `ECF error: ${response.status}` })

        const data = await response.json()

        // Store in cache
        CACHE[endpoint] = { data, ts: Date.now() }

        res.setHeader("X-Cache", "MISS")
        res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate")
        return res.status(200).json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
