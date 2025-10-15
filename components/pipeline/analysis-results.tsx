import type { AnalysisResultsType } from "@/lib/types"
import { cn } from "@/lib/utils"

function sentimentStyle(sentiment?: string) {
  const s = (sentiment || "").toLowerCase()
  // Mapping inspired by get_sentiment_color; converted to tokens
  if (!s) return "bg-muted text-foreground border"
  if (s.includes("positive")) return "bg-[var(--chart-2)]/15 text-[var(--chart-2)] border"
  if (s.includes("negative")) return "bg-[var(--destructive)]/15 text-[var(--destructive)] border"
  if (s.includes("mixed") || s.includes("neutral")) return "bg-[var(--chart-4)]/15 text-[var(--chart-4)] border"
  return "bg-[var(--chart-3)]/15 text-[var(--chart-3)] border"
}

export function AnalysisResults({ results }: { results: AnalysisResultsType | null }) {
  if (!results) {
    return <p className="text-sm text-muted-foreground">Complete Steps 1 and 2, then run analysis (Step 3).</p>
  }

  return (
    <div className="space-y-4">
      <div className={cn("rounded-md p-3 border", sentimentStyle(results.overall_sentiment))}>
        <div className="text-sm">
          <strong>Overall Sentiment (Agent 1): </strong>
          {results.overall_sentiment}
        </div>
        <div className="text-sm mt-1">
          <strong>Reason: </strong>
          {results.sentiment_reason}
        </div>
      </div>

      <div className="text-sm">
        <strong>Narrative Summary (Agent 2): </strong>
        {results.narrative_summary}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Driving Tweets (Highlights):</div>
        {results.driving_tweets?.map((t, i) => (
          <blockquote
            key={i}
            className="text-sm italic rounded-md border-l-4 pl-3 py-2 bg-muted"
            style={{ borderColor: "oklch(var(--chart-4))" } as any}
          >
            “{t}”
          </blockquote>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Keywords/Topics:</div>
        <div className="flex flex-wrap gap-2">
          {(results.keywords ?? []).map((kw, i) => (
            <span
              key={i}
              className="inline-block rounded-full px-3 py-1 text-xs bg-muted text-foreground"
              aria-label={`keyword ${kw}`}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
