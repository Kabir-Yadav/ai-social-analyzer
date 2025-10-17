import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DraftsList } from "@/components/pipeline/drafts-list";
import type { DraftItem } from "@/lib/types";

interface Stage5CardProps {
  isLoading: boolean;
  responseDrafts: DraftItem[] | null;
  counterArgument: string | null;
  onRunCounterNarrative: () => void;
  onStartNewAnalysis: () => void;
}

export function Stage5Card({
  isLoading,
  responseDrafts,
  counterArgument,
  onRunCounterNarrative,
  onStartNewAnalysis,
}: Stage5CardProps) {
  return (
    <Card className="border-2 shadow-lg h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
            5
          </div>
          <div>
            <CardTitle className="text-2xl">
              Response Drafts & Counter-Narrative
            </CardTitle>
            <CardDescription className="text-base">
              {responseDrafts?.length || 0} AI-generated tweet replies
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div>
            <h3 className="font-semibold mb-4">Response Drafts</h3>
            <DraftsList drafts={responseDrafts ?? []} />
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-4">Counter-Narrative (Optional)</h3>
            <Button
              onClick={onRunCounterNarrative}
              variant="secondary"
              size="lg"
              className="w-full h-14 text-lg mb-4 text-white"
              disabled={isLoading}
            >
              {isLoading ? "⚡ Generating..." : "⚡ Generate Counter-Narrative"}
            </Button>
            {counterArgument && (
              <div className="rounded-lg border-2 bg-secondary/5 p-4 text-sm leading-relaxed">
                {counterArgument}
              </div>
            )}
          </div>

          <Button
            onClick={onStartNewAnalysis}
            variant="outline"
            size="lg"
            className="w-full"
          >
            🔄 Start New Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
