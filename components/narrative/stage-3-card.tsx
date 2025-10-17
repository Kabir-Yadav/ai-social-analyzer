import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalysisResults } from "@/components/pipeline/analysis-results";
import type { AnalysisResultsType } from "@/lib/types";

interface Stage3CardProps {
  isLoading: boolean;
  analysisResults: AnalysisResultsType | null;
  onRunPipeline: () => void;
}

export function Stage3Card({
  isLoading,
  analysisResults,
  onRunPipeline,
}: Stage3CardProps) {
  return (
    <Card className="border-2 shadow-lg h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
            3
          </div>
          <div>
            <CardTitle className="text-2xl">Analysis Results</CardTitle>
            <CardDescription className="text-base">
              Sentiment, keywords, and narrative summary
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <AnalysisResults results={analysisResults} />
        </div>
        <Button
          onClick={onRunPipeline}
          size="lg"
          className="w-full h-14 text-lg flex-shrink-0 text-white"
          disabled={isLoading}
        >
          {isLoading ? "🌐 Grounding..." : "🌐 Ground with External Context"}
        </Button>
      </CardContent>
    </Card>
  );
}
