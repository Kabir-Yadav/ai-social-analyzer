"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  sentiment_keyword_agent,
  narrative_agent,
  grounding_agent,
  drafting_agent,
  counter_narrative_agent,
  x_api_fetcher,
} from "@/lib/agents";
import type { Tweet, AnalysisResultsType, DraftItem } from "@/lib/types";
import {
  Sidebar,
  Header,
  StatsOverview,
  StageSlider,
} from "@/components/narrative";

export default function Page() {
  // --- State ---
  const [currentStage, setCurrentStage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedTweets, setFetchedTweets] = useState<Tweet[]>([]);
  const [selectedTweetIds, setSelectedTweetIds] = useState<
    Array<number | string>
  >([]);
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResultsType | null>(null);
  const [groundedContext, setGroundedContext] = useState<string | null>(null);
  const [responseDrafts, setResponseDrafts] = useState<DraftItem[] | null>(
    null
  );
  const [counterArgument, setCounterArgument] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string>("AI Ethics in Hiring");
  const [startDate, setStartDate] = useState<string>("2025-09-01");
  const [endDate, setEndDate] = useState<string>("2025-10-14");
  const [persona, setPersona] = useState("Chief Ethics Officer");
  const [tone, setTone] = useState("apologetic and committed to fixing bias");

  const { toast } = useToast();

  // Pipeline step status
  const step1Done = fetchedTweets.length > 0;
  const step2Done = selectedTweetIds.length > 0;
  const step3Done = !!analysisResults;
  const step4Done = !!groundedContext;
  const step5Done = !!responseDrafts?.length;

  const selectedCount = selectedTweetIds.length;

  // Navigation functions
  const goToNextStage = () => {
    if (currentStage < 5) {
      setCurrentStage(currentStage + 1);
    }
  };

  const goToPreviousStage = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    }
  };

  // Check if user can navigate to a stage
  const canNavigateToStage = (stage: number) => {
    if (stage === 1) return true;
    if (stage === 2) return step1Done;
    if (stage === 3) return step2Done;
    if (stage === 4) return step3Done;
    if (stage === 5) return step4Done;
    return false;
  };

  // Pipeline functions
  async function run_fetch_pipeline() {
    setAnalysisResults(null);
    setGroundedContext(null);
    setResponseDrafts(null);
    setCounterArgument(null);
    setSelectedTweetIds([]);

    if (!keyword.trim()) {
      toast({
        title: "Keyword required",
        description: "Please enter a keyword.",
        variant: "destructive",
      });
      return;
    }

    const previousStage = currentStage;
    setIsLoading(true);
    goToNextStage();

    try {
      const tweets = x_api_fetcher(keyword, startDate, endDate);
      setFetchedTweets(tweets);
      if (!tweets.length) {
        toast({
          title: "No tweets found",
          description:
            "No data matched your filter. Add mock tweets or adjust filter.",
          variant: "destructive",
        });
        setCurrentStage(previousStage);
      } else {
        toast({
          title: "Fetched",
          description: `Found ${tweets.length} tweets.`,
        });
      }
    } catch (e: any) {
      toast({
        title: "Data Filtering Error",
        description: e?.message || String(e),
        variant: "destructive",
      });
      setCurrentStage(previousStage);
    } finally {
      setIsLoading(false);
    }
  }

  async function run_analysis_pipeline() {
    if (!selectedTweetIds.length) {
      toast({
        title: "Selection required",
        description: "Select at least one tweet to analyze.",
        variant: "destructive",
      });
      return;
    }
    const selectedText = fetchedTweets
      .filter((t) => selectedTweetIds.includes(t.id))
      .map((t) => t.text)
      .join("\n---\n");

    if (!selectedText.trim()) {
      toast({
        title: "No text",
        description: "Selected tweets resulted in empty text.",
        variant: "destructive",
      });
      return;
    }

    const previousStage = currentStage;
    setGroundedContext(null);
    setResponseDrafts(null);
    setCounterArgument(null);

    setIsLoading(true);
    goToNextStage();

    try {
      const sk = await sentiment_keyword_agent(selectedText);
      const nar = await narrative_agent(selectedText);

      if (sk && nar) {
        setAnalysisResults({
          overall_sentiment: sk.overall_sentiment,
          sentiment_percentage: sk.sentiment_percentage ?? 0,
          sentiment_reason: sk.sentiment_reason,
          keywords: sk.keywords ?? [],
          narrative_summary: nar.narrative_summary,
          driving_tweets: nar.driving_tweets ?? [],
        });
        toast({
          title: "Analysis complete",
          description: "Sentiment, keywords and narrative extracted.",
        });
      } else {
        toast({
          title: "Analysis Error",
          description: "Agents did not return valid data. Connect your API.",
          variant: "destructive",
        });
        setCurrentStage(previousStage);
      }
    } catch (e: any) {
      toast({
        title: "Analysis Pipeline Error",
        description: e?.message || String(e),
        variant: "destructive",
      });
      setCurrentStage(previousStage);
    } finally {
      setIsLoading(false);
    }
  }

  async function run_grounding_pipeline() {
    if (!analysisResults) {
      toast({
        title: "Run analysis first",
        description: "Complete Step 3 before grounding.",
        variant: "destructive",
      });
      return;
    }

    const previousStage = currentStage;
    setIsLoading(true);
    goToNextStage();

    try {
      const ctx = await grounding_agent(
        analysisResults.narrative_summary || "",
        analysisResults.keywords || []
      );
      console.log("run_grounding_pipeline", ctx);
      setGroundedContext(ctx || "");
      toast({ title: "Grounded", description: "External context summarized." });
    } catch (e: any) {
      toast({
        title: "Grounding Error",
        description: e?.message || String(e),
        variant: "destructive",
      });
      setCurrentStage(previousStage);
    } finally {
      setIsLoading(false);
    }
  }

  async function run_drafting_pipeline() {
    if (!analysisResults || !groundedContext) {
      toast({
        title: "Complete previous steps",
        description: "Finish Steps 3 and 4 first.",
        variant: "destructive",
      });
      return;
    }

    const previousStage = currentStage;
    setIsLoading(true);
    goToNextStage();

    try {
      const drafts = await drafting_agent(
        analysisResults.narrative_summary || "",
        analysisResults.overall_sentiment || "",
        groundedContext || "",
        persona,
        tone
      );
      const normalized: DraftItem[] = (drafts || []).map((d) => ({
        current: d,
      }));
      setResponseDrafts(normalized);
      toast({
        title: "Drafts ready",
        description: "Three response drafts created.",
      });
    } catch (e: any) {
      toast({
        title: "Drafting Error",
        description: e?.message || String(e),
        variant: "destructive",
      });
      setCurrentStage(previousStage);
    } finally {
      setIsLoading(false);
    }
  }

  async function run_counter_narrative() {
    if (!analysisResults) {
      toast({
        title: "Run analysis first",
        description: "Complete Step 3 before generating counter-narrative.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const text = await counter_narrative_agent(
        analysisResults.narrative_summary || "",
        analysisResults.overall_sentiment || ""
      );
      setCounterArgument(text || "");
      toast({
        title: "Counter-narrative generated",
        description: "Opposing argument created.",
      });
    } catch (e: any) {
      toast({
        title: "Counter-Narrative Error",
        description: e?.message || String(e),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const pipelineSteps = [
    { id: 1, title: "Fetch", done: step1Done },
    { id: 2, title: "Select", done: step2Done },
    { id: 3, title: "Analyze", done: step3Done },
    { id: 4, title: "Ground", done: step4Done },
    { id: 5, title: "Draft", done: step5Done },
  ];

  const statCards = [
    { label: "Fetched", value: fetchedTweets.length, hint: "Tweets" },
    { label: "Selected", value: selectedCount, hint: "To analyze" },
    { label: "Drafts", value: responseDrafts?.length ?? 0, hint: "Replies" },
  ];

  return (
    <div
      className="
        flex overflow-x-hidden
        min-h-dvh
        bg-gradient-to-br from-background via-background to-accent/5
      "
    >
      <Sidebar />

      {/* Main Content - Always has left margin for sidebar */}
      <main
        className="
          flex-1 overflow-y-auto overflow-x-hidden
          min-w-0 h-screen
          ml-64
        "
      >
        <Header
          keyword={keyword}
          setKeyword={setKeyword}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          persona={persona}
          setPersona={setPersona}
          tone={tone}
          setTone={setTone}
          pipelineSteps={pipelineSteps}
        />

        {/* Main Content */}
        <div
          className="
            w-full max-w-full
            px-4 py-4
            sm:px-6 sm:py-6
            lg:px-8
          "
        >
          <StatsOverview stats={statCards} />

          <StageSlider
            currentStage={currentStage}
            isLoading={isLoading}
            canNavigateToStage={canNavigateToStage}
            onStageChange={setCurrentStage}
            onNextStage={goToNextStage}
            onPreviousStage={goToPreviousStage}
            onRunFetchPipeline={run_fetch_pipeline}
            fetchedTweets={fetchedTweets}
            selectedTweetIds={selectedTweetIds}
            onSelectionChange={setSelectedTweetIds}
            onRunAnalysisPipeline={run_analysis_pipeline}
            analysisResults={analysisResults}
            onRunGroundingPipeline={run_grounding_pipeline}
            groundedContext={groundedContext}
            onRunDraftingPipeline={run_drafting_pipeline}
            responseDrafts={responseDrafts}
            counterArgument={counterArgument}
            onRunCounterNarrative={run_counter_narrative}
            onStartNewAnalysis={() => {
              setCurrentStage(1);
              setFetchedTweets([]);
              setSelectedTweetIds([]);
              setAnalysisResults(null);
              setGroundedContext(null);
              setResponseDrafts(null);
              setCounterArgument(null);
            }}
          />
        </div>
      </main>
    </div>
  );
}
