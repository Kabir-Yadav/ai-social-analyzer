import { NextResponse } from "next/server"

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent"
const MAX_RETRIES = 3

const narrative_schema = {
  type: "OBJECT",
  properties: {
    narrative_summary: {
      type: "STRING",
      description: "A concise, single-paragraph summary of the main narrative and conversation topic.",
    },
    driving_tweets: {
      type: "ARRAY",
      items: {
        type: "STRING",
        description: "The full text of 2 most impactful tweets that strongly drove the narrative.",
      },
    },
  },
  required: ["narrative_summary", "driving_tweets"],
}

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
    const { tweet_text } = (await req.json()) as { tweet_text?: string }
    if (!tweet_text || typeof tweet_text !== "string") {
      return NextResponse.json({ error: "Invalid body. Expected { tweet_text: string }" }, { status: 400 })
    }

    const system_prompt =
      "You are an AI Narrative Specialist. Your job is to read the aggregated tweets, identify the dominant narrative and conversation topic, and select the 2 specific tweets that best represent or drove this narrative. The output MUST be a JSON object."
    const user_query = `Analyze the following aggregated tweet content to identify the main narrative and 2 driving tweets:\n\n${tweet_text}`

    const payload = {
      contents: [{ parts: [{ text: user_query }] }],
      systemInstruction: { parts: [{ text: system_prompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: narrative_schema,
      },
    }

    return await callGemini(payload, { structured: true })
  } catch (e: any) {
    return NextResponse.json({ error: `Handler error: ${e?.message || String(e)}` }, { status: 500 })
  }
}
