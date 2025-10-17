"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Repeat2,
  User,
  Calendar,
  Heart,
  MessageSquare,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_TWEETS } from "@/data/mock-tweets";

interface RepostedSliderProps {
  tweets?: typeof MOCK_TWEETS;
  className?: string;
}

export default function RepostedSlider({
  tweets = MOCK_TWEETS,
  className = "",
}: RepostedSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(true);

  const mostReposted = useMemo(() => {
    return [...tweets]
      .sort((a, b) => b.metrics.retweets - a.metrics.retweets)
      .slice(0, 5);
  }, [tweets]);

  // Improved auto-scroll for most reposted content
  useEffect(() => {
    if (!isScrolling) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const maxScroll =
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
        setScrollPosition((prev) => {
          const next = prev + 0.5; // Slower scroll speed
          return next >= maxScroll ? 0 : next;
        });
      }
    }, 50); // Slower interval to reduce glitching
    return () => clearInterval(interval);
  }, [isScrolling]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  // Pause scrolling on hover
  const handleMouseEnter = () => setIsScrolling(false);
  const handleMouseLeave = () => setIsScrolling(true);

  return (
    <Card
      className={`shadow-sm py-0 ${className} bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-600 dark:to-orange-700`}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-3 m-6">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Repeat2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Most Reposted Content
            </h2>
            <p className="text-sm text-white/80">
              Top performing tweets by engagement
            </p>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="overflow-x-hidden overflow-y-auto max-h-80 mb-6"
          style={{ scrollBehavior: "smooth" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex gap-4 pb-2" style={{ width: "max-content" }}>
            {[...mostReposted, ...mostReposted].map((tweet, idx) => (
              <div
                key={`${tweet.id}-${idx}`}
                className="p-5 rounded-lg border border-slate-200 w-80 flex-shrink-0 bg-white hover:border-orange-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {tweet.author.charAt(1).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">
                      {tweet.author}
                    </div>
                    <div className="text-xs text-slate-500">{tweet.author}</div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 border-0 font-medium text-xs"
                  >
                    Top {(idx % 5) + 1}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed mb-4 line-clamp-4 text-slate-700">
                  {tweet.text}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{tweet.metrics.replies}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{tweet.metrics.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(tweet.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Repeat2 className="w-4 h-4" />
                    <span className="font-bold text-sm">
                      {tweet.metrics.retweets.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
