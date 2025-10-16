import { MOCK_TWEETS } from "@/data/mock-tweets"
import type { Tweet, SentimentKeywords, NarrativeData } from "@/lib/types"

// get_sentiment_color is converted into a UI helper in analysis-results.tsx

// call_gemini_api equivalent: here we delegate to your API routes.
// Each agent has its own endpoint so you can wire any provider easily.
async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${text || "Not Implemented. Please add your API."}`)
  }
  return (await res.json()) as T
}

// --- Data Fetcher (Mock Implementation based on Date/Keyword) ---
export function x_api_fetcher(keyword: string, start_date: string, end_date: string): Tweet[] {
  // Parse dates safely
  let sd = Number.NEGATIVE_INFINITY
  let ed = Number.POSITIVE_INFINITY
  try {
    sd = new Date(start_date).getTime()
    ed = new Date(end_date).getTime()
  } catch {
    // ignore; keep broad range
  }

  const kw = keyword.toLowerCase().trim()

  const filtered = MOCK_TWEETS.filter((t) => {
    const td = new Date(t.date).getTime()
    if (!(sd <= td && td <= ed)) return false
    if (kw === "ai ethics in hiring") return true
    return t.text.toLowerCase().includes(kw)
  })

  // Simulate API caps if needed (keeping exactly the Python logic is optional for empty default)
  return filtered.length > 50 ? filtered.slice(0, 50) : filtered
}

// --- Gemini AI Agents (Specialized Functions) ---
export async function sentiment_keyword_agent(tweet_text: string): Promise<SentimentKeywords> {
  // POST to your API that returns { overall_sentiment, sentiment_reason, keywords[] }
  return postJSON<SentimentKeywords>("/api/ai/sentiment-keywords", { tweet_text })
}

export async function narrative_agent(tweet_text: string): Promise<NarrativeData> {
  // POST to your API that returns { narrative_summary, driving_tweets[] }
  return postJSON<NarrativeData>("/api/ai/narrative", { tweet_text })
}

export async function grounding_agent(narrative: string, keywords: string[]): Promise<string> {
  // POST to your API that returns a short string paragraph summary
  const data = await postJSON<string | { context: string }>("/api/ai/grounding", { narrative, keywords })
  console.log("grounding_agent", data)
  return typeof data === "string" ? data : data.context
}

export async function drafting_agent(
  narrative: string,
  sentiment: string,
  context: string,
  persona: string,
  tone: string,
): Promise<string[]> {
  // POST to your API that returns an array of three tweet strings
  const data = await postJSON<{ drafts: string[] }>("/api/ai/drafting", {
    narrative,
    sentiment,
    context,
    persona,
    tone,
  })
  return data.drafts
}

export async function counter_narrative_agent(narrative: string, sentiment: string): Promise<string> {
  // POST to your API that returns a paragraph string
  const data = await postJSON<{ counter: string }>("/api/ai/counter-narrative", { narrative, sentiment })
  return data.counter
}
