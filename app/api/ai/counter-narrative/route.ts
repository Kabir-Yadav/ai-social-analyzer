import { NextResponse } from "next/server"

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent"
const MAX_RETRIES = 3

async function callGemini(
  payload: Record<string, any>,
  { structured = false, useSearch = false }: { structured?: boolean; useSearch?: boolean } = {},
) {
  const RAW_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || ""
  const API_KEY = RAW_API_KEY.trim().replace(/^['"]+|['"]+$/g, "")
  if (!API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY/GOOGLE_GENAI_API_KEY not set" }, { status: 500 })
  }
  if (useSearch) {
    payload.tools = [...(payload.tools || []), { google_search: {} }]
  }

  let lastError: any
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const url = new URL(API_URL)
      url.searchParams.set("key", API_KEY)
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`${res.status} ${res.statusText}: ${text}`)
      }
      const json = await res.json()
      const candidate = json?.candidates?.[0]
      const text = candidate?.content?.parts?.[0]?.text
      if (structured) {
        try {
          return NextResponse.json(JSON.parse(text ?? "{}"))
        } catch {
          throw new Error("API returned invalid JSON content.")
        }
      }
      return NextResponse.json(text ?? "")
    } catch (e: any) {
      lastError = e
      if (attempt < MAX_RETRIES - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  return NextResponse.json(
    { error: `Failed to call Gemini API after ${MAX_RETRIES} attempts: ${String(lastError)}` },
    { status: 502 },
  )
}

export async function POST(req: Request) {
  try {
    const { narrative, sentiment } = (await req.json()) as {
      narrative?: string
      sentiment?: string
    }
    if (!narrative || !sentiment) {
      return NextResponse.json(
        { error: "Invalid body. Expected { narrative: string, sentiment: string }" },
        { status: 400 },
      )
    }

    const system_prompt =
      "You are a strategic communications expert. Given the current narrative and sentiment, generate a compelling, well-structured paragraph (max 150 words) that presents the STRONGEST counter-argument or opposing viewpoint. The response must be professional and objective, suitable for a policy briefing."
    const user_query = `Current Narrative: "${narrative}". Overall Sentiment: ${sentiment}. Generate the opposing argument.`

    const payload = {
      contents: [{ parts: [{ text: user_query }] }],
      systemInstruction: { parts: [{ text: system_prompt }] },
    }

    const res = await callGemini(payload)
    if (res instanceof NextResponse) {
      // Wrap into { counter }
      const cloned = res.clone()
      try {
        const txt = await cloned.text()
        try {
          JSON.parse(txt)
          return res
        } catch {
          return NextResponse.json({ counter: txt })
        }
      } catch {
        return res
      }
    }
    return res
  } catch (e: any) {
    return NextResponse.json({ error: `Handler error: ${e?.message || String(e)}` }, { status: 500 })
  }
}
