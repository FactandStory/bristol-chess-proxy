export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") return res.status(200).end()

    const { org, name, type } = req.query
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
