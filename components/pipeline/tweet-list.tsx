"use client";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Tweet } from "@/lib/types";

export function TweetList(props: {
  tweets: Tweet[];
  selectedIds: Array<number | string>;
  onChangeSelected: (ids: Array<number | string>) => void;
}) {
  const { tweets, selectedIds, onChangeSelected } = props;
  const [expandedIds, setExpandedIds] = useState<Set<number | string>>(
    new Set()
  );

  function toggle(id: number | string, checked: boolean) {
    if (checked) {
      onChangeSelected([...selectedIds, id]);
    } else {
      onChangeSelected(selectedIds.filter((x) => x !== id));
    }
  }

  function toggleExpand(id: number | string) {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border-2">
      <div className="p-3 space-y-3">
        {tweets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              Awaiting fetched tweets. Add mock items in data/mock-tweets.ts or
              run Step 1 after adjusting filters.
            </p>
          </div>
        ) : (
          tweets.map((t) => {
            const idKey = String(t.id);
            const isExpanded = expandedIds.has(t.id);
            const isLong = t.text.length > 120;
            const displayText =
              isExpanded || !isLong ? t.text : `${t.text.slice(0, 120)}...`;
            const isSelected = selectedIds.includes(t.id);

            return (
              <Card
                key={idKey}
                className={`transition-all duration-200 ${
                  isSelected
                    ? "border-2 border-primary bg-primary/5 shadow-md"
                    : "border hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(c) => toggle(t.id, Boolean(c))}
                      aria-label={`Select tweet by ${t.author}`}
                      className="mt-1 border-primary/50 hover:border-primary/70 hover:bg-primary/10 dark:border-primary/50 dark:hover:border-primary/70 dark:hover:bg-primary/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">
                          {t.author}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {t.date}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {displayText}
                      </p>
                      {isLong && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(t.id)}
                          className="mt-2 h-7 text-xs gap-1"
                        >
                          {isExpanded ? (
                            <>
                              Show less <ChevronUp className="size-3" />
                            </>
                          ) : (
                            <>
                              Show more <ChevronDown className="size-3" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
