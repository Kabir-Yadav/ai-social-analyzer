import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TweetList } from "@/components/pipeline/tweet-list";
import type { Tweet } from "@/lib/types";

interface Stage2CardProps {
  isLoading: boolean;
  fetchedTweets: Tweet[];
  selectedTweetIds: Array<number | string>;
  onSelectionChange: (ids: Array<number | string>) => void;
  onRunPipeline: () => void;
}

export function Stage2Card({
  isLoading,
  fetchedTweets,
  selectedTweetIds,
  onSelectionChange,
  onRunPipeline,
}: Stage2CardProps) {
  return (
    <Card className="border-2 shadow-lg h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
            2
          </div>
          <div>
            <CardTitle className="text-2xl">
              Select Tweets for Analysis
            </CardTitle>
            <CardDescription className="text-base">
              {fetchedTweets.length} tweets found • {selectedTweetIds.length}{" "}
              selected
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <TweetList
            tweets={fetchedTweets}
            selectedIds={selectedTweetIds}
            onChangeSelected={onSelectionChange}
          />
        </div>
        <Button
          onClick={onRunPipeline}
          disabled={selectedTweetIds.length === 0 || isLoading}
          size="lg"
          className="w-full h-14 text-lg flex-shrink-0 text-white"
        >
          {isLoading
            ? "🧠 Analyzing..."
            : `🧠 Analyze ${selectedTweetIds.length} Selected Tweet${
                selectedTweetIds.length !== 1 ? "s" : ""
              }`}
        </Button>
      </CardContent>
    </Card>
  );
}
