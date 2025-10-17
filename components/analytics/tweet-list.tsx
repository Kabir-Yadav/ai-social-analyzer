"use client";

import { Calendar, User, Repeat2 } from "lucide-react";
import { MOCK_TWEETS } from "@/data/mock-tweets";

interface AnalyticsTweetListProps {
  tweets?: typeof MOCK_TWEETS;
  className?: string;
}

export default function AnalyticsTweetList({
  tweets = MOCK_TWEETS,
  className = "",
}: AnalyticsTweetListProps) {
  return (
    <div
      className={`rounded-lg border flex flex-col overflow-hidden ${className}`}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-4">
          {tweets.map((tweet) => (
            <div
              key={tweet.id}
              className="p-3 rounded-3xl border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">
                      {tweet.author}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(tweet.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-2 line-clamp-2">
                    {tweet.text}
                  </p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Repeat2 className="w-3 h-3" />
                      {tweet.metrics.retweets}
                    </span>
                    <span>❤️ {tweet.metrics.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
