import { NextResponse } from "next/server"

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_RETRIES = 3

const drafting_schema = {
  type: "ARRAY",
  items: { 
    type: "STRING", 
    description: "A distinct, professional response tweet (max 200 characters) that is ready to post. Include relevant hashtags and maintain the specified persona and tone." 
  },
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
          return NextResponse.json(JSON.parse(text ?? "[]"))
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
    const body = (await req.json()) as {
      narrative?: string
      sentiment?: string
      context?: string
      persona?: string
      tone?: string
    }

    const { narrative, sentiment, context, persona, tone } = body
    if (!narrative || !sentiment || typeof context !== "string" || !persona || !tone) {
      return NextResponse.json(
        {
          error:
            "Invalid body. Expected { narrative: string, sentiment: string, context: string, persona: string, tone: string }",
        },
        { status: 400 },
      )
    }

    const system_prompt = `You are a professional social media response team specializing in strategic communications. Draft exactly three distinct, engaging tweets based on the provided context. 

CRITICAL REQUIREMENTS:
- Each tweet must be MAXIMUM 200 characters (Twitter limit)
- Write from the perspective of a **${persona}** 
- Adopt a **${tone}** tone throughout
- Include relevant hashtags (2-3 per tweet)
- Make tweets ready-to-post (no placeholders)
- Each tweet should offer a different angle/approach
- Use professional language appropriate for the persona
- Ensure tweets are substantive and add value to the conversation

The output must be a JSON array containing three separate tweet strings.`
    const user_query = `Internal Analysis (Narrative: ${narrative}, Sentiment: ${sentiment}). External Context: ${context}. 

Generate three unique, tweetable response tweets that:
1. Address the narrative professionally
2. Reflect the ${persona} perspective
3. Maintain a ${tone} tone
4. Include relevant hashtags
5. Stay under 200 characters each
6. Are ready to post immediately`

    const payload = {
      contents: [{ parts: [{ text: user_query }] }],
      systemInstruction: { parts: [{ text: system_prompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: drafting_schema,
      },
    }

    // callGemini returns array JSON
    const geminiRes = await callGemini(payload, { structured: true })
    if (geminiRes instanceof NextResponse) {
      const cloned = geminiRes.clone()
      try {
        const data = await cloned.json()
        const drafts = Array.isArray(data) ? data.slice(0, 3) : []
        return NextResponse.json({ drafts })
      } catch {
        // If not JSON, pass through
        return geminiRes
      }
    }
    return geminiRes
  } catch (e: any) {
    return NextResponse.json({ error: `Handler error: ${e?.message || String(e)}` }, { status: 500 })
  }
}
