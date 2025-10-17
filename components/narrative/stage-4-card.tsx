import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Stage4CardProps {
  isLoading: boolean;
  groundedContext: string | null;
  onRunPipeline: () => void;
}

export function Stage4Card({
  isLoading,
  groundedContext,
  onRunPipeline,
}: Stage4CardProps) {
  return (
    <Card className="border-2 shadow-lg h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
            4
          </div>
          <div>
            <CardTitle className="text-2xl">External Context</CardTitle>
            <CardDescription className="text-base">
              Real-world grounding for better responses
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          {groundedContext ? (
            <div className="rounded-xl border-2 bg-accent/30 p-6 text-base leading-relaxed">
              {groundedContext}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed bg-muted/20 p-12 text-center">
              <p className="text-muted-foreground">
                Run grounding to see external context...
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={onRunPipeline}
          size="lg"
          className="w-full h-14 text-lg flex-shrink-0 text-white"
          disabled={isLoading}
        >
          {isLoading ? "✍️ Generating..." : "✍️ Generate Response Drafts"}
        </Button>
      </CardContent>
    </Card>
  );
}
