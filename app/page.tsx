"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { StageStepper } from "@/components/pipeline/stage-stepper"
import { TweetList } from "@/components/pipeline/tweet-list"
import { AnalysisResults } from "@/components/pipeline/analysis-results"
import { DraftsList } from "@/components/pipeline/drafts-list"
import {
  sentiment_keyword_agent,
  narrative_agent,
  grounding_agent,
  drafting_agent,
  counter_narrative_agent,
  x_api_fetcher,
} from "@/lib/agents"
import type { Tweet, AnalysisResultsType, DraftItem } from "@/lib/types"

export default function Page() {
  // --- State (replicates Streamlit session_state keys) ---
  const [fetchedTweets, setFetchedTweets] = useState<Tweet[]>([])
  const [selectedTweetIds, setSelectedTweetIds] = useState<Array<number | string>>([])
  const [analysisResults, setAnalysisResults] = useState<AnalysisResultsType | null>(null)
  const [groundedContext, setGroundedContext] = useState<string | null>(null)
  const [responseDrafts, setResponseDrafts] = useState<DraftItem[] | null>(null)
  const [counterArgument, setCounterArgument] = useState<string | null>(null)
  const [keyword, setKeyword] = useState<string>("AI Ethics in Hiring")
  const [startDate, setStartDate] = useState<string>("2025-09-01")
  const [endDate, setEndDate] = useState<string>("2025-10-14")

  const [persona, setPersona] = useState("Chief Ethics Officer")
  const [tone, setTone] = useState("apologetic and committed to fixing bias")

  const { toast } = useToast()

  // --- Pipeline Step Status ---
  const step1Done = fetchedTweets.length > 0
  const step3Done = !!analysisResults
  const step4Done = !!groundedContext
  const step5Done = !!responseDrafts?.length

  // --- Derived UI text ---
  const selectedCount = selectedTweetIds.length

  // --- Functions replicated (WORKING placeholders for API) ---
  async function run_fetch_pipeline() {
    // Reset downstream stages
    setAnalysisResults(null)
    setGroundedContext(null)
    setResponseDrafts(null)
    setCounterArgument(null)
    setSelectedTweetIds([])

    if (!keyword.trim()) {
      toast({ title: "Keyword required", description: "Please enter a keyword.", variant: "destructive" })
      return
    }

    try {
      // Filter local mock tweets (empty by default; you add content in data/mock-tweets.ts)
      const tweets = x_api_fetcher(keyword, startDate, endDate)
      setFetchedTweets(tweets)
      if (!tweets.length) {
        toast({
          title: "No tweets found",
          description: "No data matched your filter. Add mock tweets or adjust filter.",
        })
      } else {
        toast({ title: "Fetched", description: `Found ${tweets.length} tweets.` })
      }
    } catch (e: any) {
      toast({ title: "Data Filtering Error", description: e?.message || String(e), variant: "destructive" })
    }
  }

  async function run_analysis_pipeline() {
    if (!selectedTweetIds.length) {
      toast({
        title: "Selection required",
        description: "Select at least one tweet to analyze.",
        variant: "destructive",
      })
      return
    }
    const selectedText = fetchedTweets
      .filter((t) => selectedTweetIds.includes(t.id))
      .map((t) => t.text)
      .join("\n---\n")

    if (!selectedText.trim()) {
      toast({ title: "No text", description: "Selected tweets resulted in empty text.", variant: "destructive" })
      return
    }

    // Reset downstream
    setGroundedContext(null)
    setResponseDrafts(null)
    setCounterArgument(null)

    try {
      // Agent 1: Sentiment & Keywords
      const sk = await sentiment_keyword_agent(selectedText)
      // Agent 2: Narrative & Driving Tweets
      const nar = await narrative_agent(selectedText)

      if (sk && nar) {
        setAnalysisResults({
          overall_sentiment: sk.overall_sentiment,
          sentiment_reason: sk.sentiment_reason,
          keywords: sk.keywords ?? [],
          narrative_summary: nar.narrative_summary,
          driving_tweets: nar.driving_tweets ?? [],
        })
        toast({ title: "Analysis complete", description: "Sentiment, keywords and narrative extracted." })
      } else {
        toast({
          title: "Analysis Error",
          description: "Agents did not return valid data. Connect your API.",
          variant: "destructive",
        })
      }
    } catch (e: any) {
      toast({ title: "Analysis Pipeline Error", description: e?.message || String(e), variant: "destructive" })
    }
  }

  async function run_grounding_pipeline() {
    if (!analysisResults) {
      toast({ title: "Run analysis first", description: "Complete Step 3 before grounding.", variant: "destructive" })
      return
    }
    try {
      const ctx = await grounding_agent(analysisResults.narrative_summary || "", analysisResults.keywords || [])
      setGroundedContext(ctx || "")
      toast({ title: "Grounded", description: "External context summarized." })
    } catch (e: any) {
      toast({ title: "Grounding Error", description: e?.message || String(e), variant: "destructive" })
    }
  }

  async function run_drafting_pipeline() {
    if (!analysisResults || !groundedContext) {
      toast({
        title: "Complete previous steps",
        description: "Finish Steps 3 and 4 first.",
        variant: "destructive",
      })
      return
    }
    try {
      const drafts = await drafting_agent(
        analysisResults.narrative_summary || "",
        analysisResults.overall_sentiment || "",
        groundedContext || "",
        persona,
        tone,
      )
      const normalized: DraftItem[] = (drafts || []).map((d) => ({ current: d }))
      setResponseDrafts(normalized)
      toast({ title: "Drafts ready", description: "Three response drafts created." })
    } catch (e: any) {
      toast({ title: "Drafting Error", description: e?.message || String(e), variant: "destructive" })
    }
  }

  async function run_counter_narrative() {
    if (!analysisResults) {
      toast({
        title: "Run analysis first",
        description: "Complete Step 3 before generating counter-narrative.",
        variant: "destructive",
      })
      return
    }
    try {
      const text = await counter_narrative_agent(
        analysisResults.narrative_summary || "",
        analysisResults.overall_sentiment || "",
      )
      setCounterArgument(text || "")
      toast({ title: "Counter-narrative generated", description: "Opposing argument created." })
    } catch (e: any) {
      toast({ title: "Counter-Narrative Error", description: e?.message || String(e), variant: "destructive" })
    }
  }

  // --- Layout ---
  const pipelineSteps = [
    { id: 1, title: "Fetch", done: step1Done },
    { id: 2, title: "Select", done: selectedCount > 0 },
    { id: 3, title: "Analyze", done: step3Done },
    { id: 4, title: "Ground", done: step4Done },
    { id: 5, title: "Draft", done: step5Done },
  ]

  const statCards = [
    { label: "Fetched", value: fetchedTweets.length, hint: "Tweets" },
    { label: "Selected", value: selectedCount, hint: "To analyze" },
    { label: "Drafts", value: responseDrafts?.length ?? 0, hint: "Replies" },
  ]

  return (
    <main className="min-h-dvh grid grid-cols-1 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col border-r bg-sidebar">
        <div className="p-5 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="sr-only">Logo</span>
            <span className="text-primary font-mono text-sm">AI</span>
          </div>
          <div className="text-sm font-semibold">Strategic Social</div>
        </div>
        <nav className="px-3 py-2 space-y-1 text-sm">
          <div className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">Dashboard</div>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent">Articles</button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent">Videos</button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent">Documents</button>
          <Separator className="my-2" />
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent">Developer API</button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent">Learn more</button>
        </nav>
        <div className="mt-auto p-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">19 summaries used of 30</div>
              <Button size="sm" className="mt-2 w-full">
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-col min-h-dvh">
        {/* App bar */}
        <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                aria-label="Search"
                placeholder="Search for article, video or document"
                className="h-11 rounded-full pl-10"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">⌘K</span>
            </div>
            <ThemeToggle />
            <Button variant="outline" className="rounded-full bg-transparent">
              New summarize
            </Button>
          </div>

          {/* Pipeline at top */}
          <div className="border-t">
            <div className="mx-auto max-w-7xl px-4 py-3">
              <StageStepper steps={pipelineSteps} />
            </div>
          </div>
        </header>

        {/* Hero section */}
        <section className="mx-auto max-w-7xl w-full px-4 py-6 grid gap-6">
          <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-semibold text-balance">Hello, John.</h1>
              <p className="text-muted-foreground">
                Explore conversations deeply and effectively. Run your pipeline and craft strategic, on-brand replies.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {statCards.map((s, i) => (
                  <Card key={i} className="rounded-2xl bg-accent/60 border-dashed">
                    <CardContent className="p-5">
                      <div className="text-sm text-muted-foreground">{s.label}</div>
                      <div className="mt-2 text-3xl font-semibold">{s.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-[1fr_220px]">
                    <div className="p-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs border rounded-full px-2 py-0.5">PRO</span>
                        <span className="text-xs text-muted-foreground">Tips</span>
                      </div>
                      <h3 className="mt-3 text-lg font-medium">Switch to Professional for higher rate limits</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Faster grounding, richer drafts, and deeper analysis.
                      </p>
                      <Button className="mt-4 rounded-full">Upgrade</Button>
                    </div>
                    <div className="relative h-40 md:h-full">
                      <img
                        src="/images/dashboard-hero.png"
                        alt="Dashboard preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right info cards */}
            <div className="grid gap-4">
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Your usage</CardTitle>
                  <CardDescription>Current plan: Personal</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (responseDrafts?.length ?? 0) * 33)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm">{responseDrafts?.length ?? 0} summaries used of 3</div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" className="rounded-full bg-transparent">
                      Pricing plans
                    </Button>
                    <Button className="rounded-full">Upgrade</Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Top sources</CardTitle>
                  <CardDescription>Popular sources</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">Leave space for API sources</CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pipeline content */}
        <section className="mx-auto max-w-7xl w-full px-4 pb-10 grid gap-6">
          <div className="grid lg:grid-cols-[340px_1fr] gap-6">
            {/* Filters and drafting inputs */}
            <div className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base">1) Data Fetch & Filters</CardTitle>
                  <CardDescription>Leave space for mock tweets in data/mock-tweets.ts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="kw">Keyword/Topic</Label>
                    <Input id="kw" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="sd">Start Date</Label>
                      <Input id="sd" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ed">End Date</Label>
                      <Input id="ed" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>
                  <Button className="w-full rounded-full" onClick={run_fetch_pipeline}>
                    Search & Fetch Tweets (Step 1)
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base">5) Drafting Inputs</CardTitle>
                  <CardDescription>Persona and tone</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="persona">Persona</Label>
                    <Input id="persona" value={persona} onChange={(e) => setPersona(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Input id="tone" value={tone} onChange={(e) => setTone(e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main pipeline panels */}
            <div className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">2) Select Tweets ({fetchedTweets.length} found)</CardTitle>
                  <CardDescription>Leave space for mock tweets; you will paste them</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TweetList
                    tweets={fetchedTweets}
                    selectedIds={selectedTweetIds}
                    onChangeSelected={setSelectedTweetIds}
                  />
                  <Button
                    className="w-full rounded-full"
                    onClick={run_analysis_pipeline}
                    disabled={selectedTweetIds.length === 0}
                  >
                    ▶️ Step 3: Run AI Analysis Agents ({selectedTweetIds.length} selected)
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">3) Analysis Results</CardTitle>
                  <CardDescription>Sentiment, keywords, narrative</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnalysisResults results={analysisResults} />
                  <Button className="w-full rounded-full" onClick={run_grounding_pipeline}>
                    ▶️ Step 4: Ground Conversation Context
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">4) External Context (Grounding)</CardTitle>
                  <CardDescription>Summarized, real-world references</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Card className={cn("border-dashed", groundedContext ? "" : "opacity-80")}>
                    <CardContent className="p-4">
                      {groundedContext ? (
                        <div className="rounded-md border bg-accent p-4 text-sm">{groundedContext}</div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          After Step 3, click Ground to gather external context using your API.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  <Button className="w-full rounded-full" onClick={run_drafting_pipeline}>
                    ▶️ Step 5: Draft Response Tweets (3)
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Drafted Replies</CardTitle>
                  <CardDescription>Copy to clipboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <DraftsList drafts={responseDrafts ?? []} />
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Optional: Strategic Counter-Narrative</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={run_counter_narrative}
                    disabled={!analysisResults}
                  >
                    ✨ Generate Opposing Argument
                  </Button>
                  {counterArgument && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="rounded-md border bg-card p-4 text-sm">{counterArgument}</div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
