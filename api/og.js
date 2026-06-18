// /api/og.js — Bristol Chess Hub OG image generation
// Self-contained: imports @vercel/og via CDN, no package.json changes needed.
// Uses React element objects (not JSX) since this is not a Next.js project.
// Only flexbox + inline styles — CSS variables, SVG, grid not supported by Satori.

const OG_URL = "https://esm.sh/@vercel/og@0.6.2"

const COLORS = {
    white: "#FFFFFF",
    offWhite: "rgba(255,255,255,0.75)",
    muted: "rgba(255,255,255,0.45)",
    purple: "#5A237A",
}

const W = 1200
const H = 630

// Build the Where You Stand card as a React element object tree
function whereYouStandCard({ name, percentile, rank, total, domainLabel }) {
    const pct = parseFloat(percentile)
    const barFillW = Math.round((pct / 100) * 680)

    // Helper to make element objects less verbose
    const el = (type, style, children) => ({
        type,
        props: { style, children },
    })

    return el("div", {
        width: W, height: H,
        backgroundColor: COLORS.purple,
        display: "flex",
        flexDirection: "column",
        padding: "60px 80px",
        fontFamily: "Arial, sans-serif",
    }, [
        // Top bar: branding left, feature name right
        el("div", {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 44,
        }, [
            el("div", { fontSize: 18, fontWeight: 700, color: COLORS.offWhite, letterSpacing: 3 },
                "BRISTOL & DISTRICTS CHESS HUB"),
            el("div", { fontSize: 14, color: COLORS.muted, letterSpacing: 2 },
                "YOUR CHESS YEAR"),
        ]),

        // Module label
        el("div", { fontSize: 16, fontWeight: 700, color: COLORS.muted, letterSpacing: 4, marginBottom: 12 },
            "WHERE YOU STAND"),

        // Player name
        el("div", { fontSize: 30, fontWeight: 700, color: COLORS.white, marginBottom: 32 },
            name || "Bristol Player"),

        // Big percentile number
        el("div", {
            fontSize: 116,
            fontWeight: 700,
            color: COLORS.white,
            fontFamily: "'Courier New', monospace",
            letterSpacing: -2,
            lineHeight: 1,
            marginBottom: 10,
        }, `${percentile}%`),

        // Sub-label
        el("div", { fontSize: 20, color: COLORS.offWhite, marginBottom: 44 },
            `of rated Bristol & Districts players (${domainLabel})`),

        // Bar track + fill
        el("div", {
            width: 680,
            height: 12,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 6,
            display: "flex",
            alignItems: "stretch",
        }, [
            el("div", {
                width: barFillW,
                height: 12,
                backgroundColor: COLORS.white,
                borderRadius: 6,
            }, []),
        ]),

        // Rank context
        el("div", { fontSize: 18, color: COLORS.muted, marginTop: 20 },
            `Ranked #${rank} of ${total} rated players`),
    ])
}

export default async function handler(req) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
    }
    if (req.method === "OPTIONS") return new Response("", { headers })

    let ImageResponse
    try {
        const mod = await import(OG_URL)
        ImageResponse = mod.ImageResponse
    } catch (err) {
        return new Response(`Failed to load @vercel/og: ${err.message}`, { status: 500, headers })
    }

    const url = new URL(req.url)
    const p = url.searchParams
    const module = p.get("module") || "where_you_stand"

    try {
        if (module === "where_you_stand") {
            let percentile = p.get("percentile")
            let rank = p.get("rank")
            let total = p.get("total")
            let name = p.get("name") || "Bristol Player"
            const domain = p.get("domain") || "std"
            const domainLabel = domain === "rpd" ? "Rapid" : domain === "btz" ? "Blitz" : "Standard"

            // Fetch live if not pre-supplied
            if (!percentile) {
                const ecf_code = p.get("ecf_code")
                if (!ecf_code) return new Response("Missing ecf_code or percentile", { status: 400, headers })
                const data = await fetch(
                    `https://bristol-chess-proxy.vercel.app/api/ecf?action=player_percentile&ecf_code=${encodeURIComponent(ecf_code)}&domain=${domain}`
                ).then(r => r.json())
                if (data.error) return new Response(data.error, { status: 404, headers })
                percentile = String(data.percentile)
                rank = String(data.rank)
                total = String(data.total_players)
            }

            const element = whereYouStandCard({ name, percentile, rank, total, domainLabel })

            return new ImageResponse(element, {
                width: W,
                height: H,
                headers: { ...headers, "Cache-Control": "public, max-age=3600, s-maxage=3600" },
            })
        }

        return new Response(`Unknown module: ${module}`, { status: 400, headers })

    } catch (err) {
        return new Response(`OG error: ${err.message}`, { status: 500, headers })
    }
}
