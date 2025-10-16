import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Stage1CardProps {
  isLoading: boolean;
  onRunPipeline: () => void;
}

export function Stage1Card({ isLoading, onRunPipeline }: Stage1CardProps) {
  return (
    <Card className="border-2 shadow-lg h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
            1
          </div>
          <div>
            <CardTitle className="text-2xl">
              Configure Search Parameters
            </CardTitle>
            <CardDescription className="text-base">
              Set your filters to fetch relevant tweets
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col justify-between overflow-y-auto">
        <div className="text-sm text-muted-foreground">
          Use the filters above to customize your search parameters, then click
          the button below to start fetching tweets.
        </div>
        <Button
          onClick={onRunPipeline}
          size="lg"
          className="w-full h-14 text-lg flex-shrink-0"
          disabled={isLoading}
        >
          {isLoading ? "🔄 Fetching..." : "🔍 Search & Fetch Tweets"}
        </Button>
      </CardContent>
    </Card>
  );
}
