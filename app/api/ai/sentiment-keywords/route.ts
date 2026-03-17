import { NextResponse } from "next/server"

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_RETRIES = 3

type SentimentKeywords = {
  overall_sentiment: string
  sentiment_reason: string
  keywords: string[]
}

const sentiment_keyword_schema = {
  type: "OBJECT",
  properties: {
    overall_sentiment: {
      type: "STRING",
      description: "The overall sentiment (e.g., Highly Negative, Mixed, Cautiously Positive, etc.).",
    },
    sentiment_percentage: {
      type: "NUMBER",
      description: "Confidence percentage (0-100) for the sentiment analysis.",
    },
    sentiment_reason: {
      type: "STRING",
      description: "A concise sentence explaining the primary reason for the determined sentiment.",
    },
    keywords: {
      type: "ARRAY",
      items: {
        type: "STRING",
        description: "A list of the top 5 most relevant keywords/hashtags from the discussion.",
      },
    },
  },
  required: ["overall_sentiment", "sentiment_percentage", "sentiment_reason", "keywords"],
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
      "You are an AI Sentiment and Keyword Analyst. Analyze the collective text and determine the overall sentiment with confidence percentage (0-100), provide a single sentence reason for that sentiment, and extract the top 5 keywords/hashtags. Be precise with sentiment classification and provide realistic confidence scores. The output MUST be a JSON object adhering to the specified schema."
    const user_query = `Analyze the following aggregated tweet content:\n\n${tweet_text}`

    const payload = {
      contents: [{ parts: [{ text: user_query }] }],
      systemInstruction: { parts: [{ text: system_prompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: sentiment_keyword_schema,
      },
    }

    const res = await callGemini(payload, { structured: true })
    // callGemini already returns a NextResponse
    return res
  } catch (e: any) {
    return NextResponse.json({ error: `Handler error: ${e?.message || String(e)}` }, { status: 500 })
  }
}
