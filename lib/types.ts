export type Tweet = {
  id: number | string
  date: string // YYYY-MM-DD
  author: string
  text: string
  metrics: {
    replies: number
    retweets: number
    likes: number
  }
}

export type SentimentKeywords = {
  overall_sentiment: string
  sentiment_percentage: number
  sentiment_reason: string
  keywords: string[]
}

export type NarrativeData = {
  narrative_summary: string
  driving_tweets: string[]
}

export type AnalysisResultsType = SentimentKeywords & NarrativeData

export type DraftItem = { current: string }
