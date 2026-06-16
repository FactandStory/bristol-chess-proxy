export default async function handler(req, res) {
    // Allow requests from Framer and local dev
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
        return res.status(200).end()
    }

    const { path } = req.query
    if (!path) {
        return res.status(400).json({ error: "Missing path parameter" })
    }

    const url = `https://lms.englishchess.org.uk/lms/${path}`

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Bristol Chess Hub/1.0",
            },
        })

        if (!response.ok) {
            return res.status(response.status).json({ error: `LMS error: ${response.status}` })
        }

        const text = await response.text()

        // Cache for 10 minutes
        res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate")
        res.setHeader("Content-Type", "text/plain")
        return res.status(200).send(text)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
