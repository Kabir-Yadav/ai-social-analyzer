import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShimmerCard } from "./shimmer-card";
import { Stage1Card } from "./stage-1-card";
import { Stage2Card } from "./stage-2-card";
import { Stage3Card } from "./stage-3-card";
import { Stage4Card } from "./stage-4-card";
import { Stage5Card } from "./stage-5-card";
import type { Tweet, AnalysisResultsType, DraftItem } from "@/lib/types";

interface StageSliderProps {
  currentStage: number;
  isLoading: boolean;
  canNavigateToStage: (stage: number) => boolean;
  onStageChange: (stage: number) => void;
  onNextStage: () => void;
  onPreviousStage: () => void;
  // Stage 1 props
  onRunFetchPipeline: () => void;
  // Stage 2 props
  fetchedTweets: Tweet[];
  selectedTweetIds: Array<number | string>;
  onSelectionChange: (ids: Array<number | string>) => void;
  onRunAnalysisPipeline: () => void;
  // Stage 3 props
  analysisResults: AnalysisResultsType | null;
  onRunGroundingPipeline: () => void;
  // Stage 4 props
  groundedContext: string | null;
  onRunDraftingPipeline: () => void;
  // Stage 5 props
  responseDrafts: DraftItem[] | null;
  counterArgument: string | null;
  onRunCounterNarrative: () => void;
  onStartNewAnalysis: () => void;
}

export function StageSlider({
  currentStage,
  isLoading,
  canNavigateToStage,
  onStageChange,
  onNextStage,
  onPreviousStage,
  onRunFetchPipeline,
  fetchedTweets,
  selectedTweetIds,
  onSelectionChange,
  onRunAnalysisPipeline,
  analysisResults,
  onRunGroundingPipeline,
  groundedContext,
  onRunDraftingPipeline,
  responseDrafts,
  counterArgument,
  onRunCounterNarrative,
  onStartNewAnalysis,
}: StageSliderProps) {
  return (
    <div className="relative w-full max-w-full flex flex-col">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((stage) => (
          <button
            key={stage}
            onClick={() => canNavigateToStage(stage) && onStageChange(stage)}
            disabled={!canNavigateToStage(stage)}
            className={cn(
              "size-2 rounded-full transition-all duration-300",
              currentStage === stage
                ? "w-8 bg-primary"
                : canNavigateToStage(stage)
                ? "bg-muted-foreground/50"
                : "bg-muted cursor-not-allowed"
            )}
            aria-label={`Go to stage ${stage}`}
          />
        ))}
      </div>

      {/* Slider Content with fixed height */}
      <div className="overflow-hidden w-full h-[500px] mb-2">
        <div
          className="flex transition-transform duration-500 ease-in-out w-full h-full"
          style={{ transform: `translateX(-${(currentStage - 1) * 100}%)` }}
        >
          {/* Stage 1: Configuration */}
          <div className="w-full flex-shrink-0 px-2 flex flex-col">
            {isLoading && currentStage === 1 ? (
              <ShimmerCard />
            ) : (
              <Stage1Card
                isLoading={isLoading}
                onRunPipeline={onRunFetchPipeline}
              />
            )}
          </div>

          {/* Stage 2: Select Tweets */}
          <div className="w-full flex-shrink-0 px-2 flex flex-col">
            {isLoading && currentStage === 2 ? (
              <ShimmerCard />
            ) : (
              <Stage2Card
                isLoading={isLoading}
                fetchedTweets={fetchedTweets}
                selectedTweetIds={selectedTweetIds}
                onSelectionChange={onSelectionChange}
                onRunPipeline={onRunAnalysisPipeline}
              />
            )}
          </div>

          {/* Stage 3: Analysis Results */}
          <div className="w-full flex-shrink-0 px-2 flex flex-col">
            {isLoading && currentStage === 3 ? (
              <ShimmerCard />
            ) : (
              <Stage3Card
                isLoading={isLoading}
                analysisResults={analysisResults}
                onRunPipeline={onRunGroundingPipeline}
              />
            )}
          </div>

          {/* Stage 4: External Context */}
          <div className="w-full flex-shrink-0 px-2 flex flex-col">
            {isLoading && currentStage === 4 ? (
              <ShimmerCard />
            ) : (
              <Stage4Card
                isLoading={isLoading}
                groundedContext={groundedContext}
                onRunPipeline={onRunDraftingPipeline}
              />
            )}
          </div>

          {/* Stage 5: Response Drafts */}
          <div className="w-full flex-shrink-0 px-2 flex flex-col">
            {isLoading && currentStage === 5 ? (
              <ShimmerCard />
            ) : (
              <Stage5Card
                isLoading={isLoading}
                responseDrafts={responseDrafts}
                counterArgument={counterArgument}
                onRunCounterNarrative={onRunCounterNarrative}
                onStartNewAnalysis={onStartNewAnalysis}
              />
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onPreviousStage}
          disabled={currentStage === 1}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <ChevronLeft className="size-5" />
          Previous
        </Button>
        <div className="text-sm font-medium text-muted-foreground">
          Step {currentStage} of 5
        </div>
        <Button
          onClick={onNextStage}
          disabled={currentStage === 5 || !canNavigateToStage(currentStage + 1)}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          Next
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}
