"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import {
  TrendingUp,
  MapPin,
  MessageSquare,
  Heart,
  Repeat2,
  Calendar,
  Grid3X3,
  List,
  Type,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/narrative";
import { ThemeToggle } from "@/components/theme-toggle";
import AnalyticsTweetList from "@/components/analytics/tweet-list";
import RepostedSlider from "@/components/analytics/reposted-slider";
import KeywordCloud from "@/components/analytics/keyword-cloud";
import {
  fetchTweetsBySentiment,
  fetchTweetsFiltered,
  getAnalyticsSummaryByRange,
  formatDateOnly,
  type TimeRange,
} from "@/lib/tweet-service";

function analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
  const positiveWords = [
    "best",
    "good",
    "better",
    "excellent",
    "great",
    "outstanding",
    "love",
    "amazing",
    "proud",
    "progressive",
    "blessed",
    "beautiful",
    "divine",
  ];
  const negativeWords = [
    "worst",
    "bad",
    "hate",
    "disappointed",
    "worse",
    "urgent",
    "needs",
    "alarming",
    "pollution",
  ];

  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter((word) =>
    lowerText.includes(word)
  ).length;
  const negativeCount = negativeWords.filter((word) =>
    lowerText.includes(word)
  ).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  return text.match(hashtagRegex) || [];
}

function extractKeywords(text: string, sentiment: string): string[] {
  const stopWords = [
    "the",
    "is",
    "are",
    "was",
    "were",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "up",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "among",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "shall",
    "been",
    "being",
    "said",
    "say",
    "says",
    "saying",
    "told",
    "tell",
    "tells",
    "telling",
    "come",
    "comes",
    "coming",
    "came",
    "go",
    "goes",
    "going",
    "went",
    "get",
    "gets",
    "getting",
    "got",
    "make",
    "makes",
    "making",
    "made",
    "take",
    "takes",
    "taking",
    "took",
    "see",
    "sees",
    "seeing",
    "saw",
    "know",
    "knows",
    "knowing",
    "knew",
    "think",
    "thinks",
    "thinking",
    "thought",
    "look",
    "looks",
    "looking",
    "looked",
    "want",
    "wants",
    "wanting",
    "wanted",
    "give",
    "gives",
    "giving",
    "gave",
    "use",
    "uses",
    "using",
    "used",
    "find",
    "finds",
    "finding",
    "found",
    "work",
    "works",
    "working",
    "worked",
    "call",
    "calls",
    "calling",
    "called",
    "try",
    "tries",
    "trying",
    "tried",
    "ask",
    "asks",
    "asking",
    "asked",
    "need",
    "needs",
    "needing",
    "needed",
    "feel",
    "feels",
    "feeling",
    "felt",
    "become",
    "becomes",
    "becoming",
    "became",
    "leave",
    "leaves",
    "leaving",
    "left",
    "put",
    "puts",
    "putting",
    "placed",
    "mean",
    "means",
    "meaning",
    "meant",
    "keep",
    "keeps",
    "keeping",
    "kept",
    "let",
    "lets",
    "letting",
    "allowed",
    "begin",
    "begins",
    "beginning",
    "began",
    "seem",
    "seems",
    "seeming",
    "seemed",
    "help",
    "helps",
    "helping",
    "helped",
    "talk",
    "talks",
    "talking",
    "talked",
    "turn",
    "turns",
    "turning",
    "turned",
    "start",
    "starts",
    "starting",
    "started",
    "show",
    "shows",
    "showing",
    "showed",
    "hear",
    "hears",
    "hearing",
    "heard",
    "play",
    "plays",
    "playing",
    "played",
    "run",
    "runs",
    "running",
    "ran",
    "move",
    "moves",
    "moving",
    "moved",
    "live",
    "lives",
    "living",
    "lived",
    "believe",
    "believes",
    "believing",
    "believed",
    "hold",
    "holds",
    "holding",
    "held",
    "bring",
    "brings",
    "bringing",
    "brought",
    "happen",
    "happens",
    "happening",
    "happened",
    "write",
    "writes",
    "writing",
    "wrote",
    "provide",
    "provides",
    "providing",
    "provided",
    "sit",
    "sits",
    "sitting",
    "sat",
    "stand",
    "stands",
    "standing",
    "stood",
    "lose",
    "loses",
    "losing",
    "lost",
    "pay",
    "pays",
    "paying",
    "paid",
    "meet",
    "meets",
    "meeting",
    "met",
    "include",
    "includes",
    "including",
    "included",
    "continue",
    "continues",
    "continuing",
    "continued",
    "set",
    "sets",
    "setting",
    "placed",
    "learn",
    "learns",
    "learning",
    "learned",
    "change",
    "changes",
    "changing",
    "changed",
    "lead",
    "leads",
    "leading",
    "led",
    "understand",
    "understands",
    "understanding",
    "understood",
    "watch",
    "watches",
    "watching",
    "watched",
    "follow",
    "follows",
    "following",
    "followed",
    "stop",
    "stops",
    "stopping",
    "stopped",
    "create",
    "creates",
    "creating",
    "created",
    "speak",
    "speaks",
    "speaking",
    "spoke",
    "read",
    "reads",
    "reading",
    "read",
    "allow",
    "allows",
    "allowing",
    "allowed",
    "add",
    "adds",
    "adding",
    "added",
    "spend",
    "spends",
    "spending",
    "spent",
    "grow",
    "grows",
    "growing",
    "grew",
    "open",
    "opens",
    "opening",
    "opened",
    "walk",
    "walks",
    "walking",
    "walked",
    "win",
    "wins",
    "winning",
    "won",
    "offer",
    "offers",
    "offering",
    "offered",
    "remember",
    "remembers",
    "remembering",
    "remembered",
    "love",
    "loves",
    "loving",
    "loved",
    "consider",
    "considers",
    "considering",
    "considered",
    "appear",
    "appears",
    "appearing",
    "appeared",
    "buy",
    "buys",
    "buying",
    "bought",
    "wait",
    "waits",
    "waiting",
    "waited",
    "serve",
    "serves",
    "serving",
    "served",
    "die",
    "dies",
    "dying",
    "died",
    "send",
    "sends",
    "sending",
    "sent",
    "expect",
    "expects",
    "expecting",
    "expected",
    "build",
    "builds",
    "building",
    "built",
    "stay",
    "stays",
    "staying",
    "stayed",
    "fall",
    "falls",
    "falling",
    "fell",
    "cut",
    "cuts",
    "cutting",
    "cut",
    "reach",
    "reaches",
    "reaching",
    "reached",
    "kill",
    "kills",
    "killing",
    "killed",
    "remain",
    "remains",
    "remaining",
    "remained",
    "suggest",
    "suggests",
    "suggesting",
    "suggested",
    "raise",
    "raises",
    "raising",
    "raised",
    "pass",
    "passes",
    "passing",
    "passed",
    "sell",
    "sells",
    "selling",
    "sold",
    "require",
    "requires",
    "requiring",
    "required",
    "report",
    "reports",
    "reporting",
    "reported",
    "decide",
    "decides",
    "deciding",
    "decided",
    "pull",
    "pulls",
    "pulling",
    "pulled",
  ];

  // Extract words from text
  const words = text
    .toLowerCase()
    .replace(/[#@.,!?;:()\[\]{}'"]/g, " ") // Remove special characters
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .split(" ")
    .filter(
      (word) =>
        word.length > 1 &&
        !stopWords.includes(word) &&
        !/^\d+$/.test(word) && // Remove pure numbers
        /^\p{L}+$/u.test(word) // Any Unicode letters (supports Hindi)
    );

  return words;
}

// Local adapter to map Supabase tweets to the component's expected shape
type UiTweet = {
  id: number | string;
  author: string;
  date: string;
  text: string;
  metrics: { replies: number; retweets: number; likes: number };
  sentiment?: string;
};

function resolveSentiment(tweet: UiTweet): "positive" | "negative" | "neutral" {
  const s = (tweet.sentiment || "").trim().toLowerCase();
  if (s === "positive" || s === "negative" || s === "neutral") {
    return s as any;
  }
  return analyzeSentiment(tweet.text);
}

function parseTweetDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]) - 1;
    const day = Number(dateOnly[3]);
    const local = new Date(year, month, day);
    return Number.isNaN(local.getTime()) ? null : local;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(base: Date, offset: number): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

function enumerateDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function daysForRange(range: TimeRange, tweets: UiTweet[]): Date[] {
  if (range !== "all") {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const count =
      range === "24h" ? 2 : range === "30d" ? 30 : range === "90d" ? 90 : 7;
    return enumerateDays(addDays(end, -(count - 1)), end);
  }

  const parsedDates = tweets
    .map((t) => parseTweetDate(t.date))
    .filter((d): d is Date => d !== null)
    .map((d) => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy;
    });

  if (parsedDates.length === 0) {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    return enumerateDays(addDays(end, -6), end);
  }

  const min = new Date(Math.min(...parsedDates.map((d) => d.getTime())));
  const max = new Date(Math.max(...parsedDates.map((d) => d.getTime())));
  if (min.getTime() === max.getTime()) {
    return enumerateDays(addDays(min, -3), addDays(max, 3));
  }
  return enumerateDays(min, max);
}

function buildEngagementSeries(
  tweets: UiTweet[],
  range: TimeRange
): { day: string; likes: number; retweets: number; replies: number }[] {
  const totals = new Map<
    string,
    { likes: number; retweets: number; replies: number }
  >();

  tweets.forEach((t) => {
    const parsed = parseTweetDate(t.date);
    if (!parsed) return;
    const key = formatDateOnly(parsed);
    const current = totals.get(key) || { likes: 0, retweets: 0, replies: 0 };
    current.likes += t.metrics.likes;
    current.retweets += t.metrics.retweets;
    current.replies += t.metrics.replies;
    totals.set(key, current);
  });

  return daysForRange(range, tweets).map((d) => {
    const key = formatDateOnly(d);
    const metrics = totals.get(key) || { likes: 0, retweets: 0, replies: 0 };
    return {
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      ...metrics,
    };
  });
}

export default function AnalyticsDashboard() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sentimentFilter, setSentimentFilter] = useState<
    "all" | "positive" | "negative" | "neutral"
  >("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const [totalTweets, setTotalTweets] = useState(0);
  const [sentimentData, setSentimentData] = useState<any>({
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: [
          "rgba(52, 168, 83, 0.75)", // Soft green
          "rgba(234, 67, 53, 0.75)", // Soft red
          "rgba(158, 158, 158, 0.7)", // Soft gray
        ],
        borderColor: [
          "rgba(52, 168, 83, 1)",
          "rgba(234, 67, 53, 1)",
          "rgba(158, 158, 158, 1)",
        ],
        borderWidth: 2,
      },
    ],
    counts: { positive: 0, negative: 0, neutral: 0 },
    percentages: { positive: 0, negative: 0, neutral: 0 },
  });
  const [locationData, setLocationData] = useState<
    { location: string; count: number }[]
  >([]);
  const [wordCloudData, setWordCloudData] = useState<{
    positive: { word: string; count: number }[];
    negative: { word: string; count: number }[];
  }>({ positive: [], negative: [] });
  const [engagementData, setEngagementData] = useState<
    { day: string; likes: number; retweets: number; replies: number }[]
  >([]);
  const [uiTweets, setUiTweets] = useState<UiTweet[]>([]);
  useEffect(() => {
    async function loadAnalytics() {
      try {
        const summary = await getAnalyticsSummaryByRange(timeRange);
        const pos = summary.sentimentCounts["positive"] || 0;
        const neg = summary.sentimentCounts["negative"] || 0;
        const neu = summary.sentimentCounts["neutral"] || 0;
        const total = summary.totalTweets || 0;

        setTotalTweets(total);
        setSentimentData({
          labels: ["Positive", "Negative", "Neutral"],
          datasets: [
            {
              data: [pos, neg, neu],
              backgroundColor: ["#22c55e", "#ef4444", "#3b82f6"],
              borderColor: ["#16a34a", "#dc2626", "#2563eb"],
              borderWidth: 2,
            },
          ],
          counts: { positive: pos, negative: neg, neutral: neu },
          percentages: {
            positive: total ? Math.round((pos / total) * 100) : 0,
            negative: total ? Math.round((neg / total) * 100) : 0,
            neutral: total ? Math.round((neu / total) * 100) : 0,
          },
        });

        const regions = Object.entries(summary.regionCounts || {})
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        setLocationData(regions);
      } catch (error) {
        console.error("Failed to load analytics summary:", error);
      }
    }

    async function loadTweets() {
      try {
        const { tweets } = await fetchTweetsFiltered({
          range: timeRange,
          sentiment: sentimentFilter === "all" ? undefined : sentimentFilter,
          page: 0,
          limit: 500,
        });
        const mapped: UiTweet[] = (tweets || []).map((t) => {
          const parsed = parseTweetDate(t.date);
          return {
            id: t.id,
            author: t.author_name || t.handle || "Unknown",
            text: t.text,
            date: parsed ? formatDateOnly(parsed) : t.date || "",
            metrics: {
              replies: t.replies ?? 0,
              retweets: t.reposts ?? 0,
              likes: t.likes ?? 0,
            },
            sentiment: (t.sentiment || "").toLowerCase(),
          };
        });
        setUiTweets(mapped);
        setEngagementData(buildEngagementSeries(mapped, timeRange));
      } catch (error) {
        console.error("Failed to load analytics tweets:", error);
      }
    }

    async function loadKeywords() {
      try {
        const [posTweets, negTweets] = await Promise.all([
          fetchTweetsBySentiment("positive"),
          fetchTweetsBySentiment("negative"),
        ]);

        const countWords = (texts: string[]) => {
          const counts: Record<string, number> = {};
          texts.forEach((t) => {
            extractKeywords(t, "").forEach((w) => {
              counts[w] = (counts[w] || 0) + 1;
            });
          });
          return Object.entries(counts)
            .map(([word, count]) => ({ word, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 25);
        };

        setWordCloudData({
          positive: countWords((posTweets || []).map((t) => t.text)),
          negative: countWords((negTweets || []).map((t) => t.text)),
        });
      } catch (error) {
        console.error("Failed to load keyword clouds:", error);
      }
    }

    loadAnalytics();
    loadTweets();
    loadKeywords();
  }, [timeRange, sentimentFilter]);

  const statsCards = [
    {
      title: "Total Tweets",
      value: totalTweets.toLocaleString(),
      change: "+12%",
      trend: "up",
      icon: MessageSquare,
      color: "blue",
    },
    {
      title: "Total Engagement",
      value: uiTweets
        .reduce(
          (sum, t) =>
            sum + t.metrics.likes + t.metrics.retweets + t.metrics.replies,
          0
        )
        .toLocaleString(),
      change: "+8%",
      trend: "up",
      icon: Heart,
      color: "red",
    },
    {
      title: "Avg. Positive Sentiment",
      value: `${sentimentData.percentages.positive}%`,
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
      color: "green",
    },
    {
      title: "Top Location",
      value: locationData[0]?.location || "N/A",
      change: locationData[0]?.count?.toLocaleString() || "0",
      trend: "neutral",
      icon: MapPin,
      color: "orange",
    },
  ];

  const filteredTweets = useMemo(() => {
    if (sentimentFilter === "all") return uiTweets;
    return uiTweets.filter((t) => {
      const s = t.sentiment || analyzeSentiment(t.text);
      return s === sentimentFilter;
    });
  }, [uiTweets, sentimentFilter]);

  return (
    <div className="flex overflow-x-hidden min-h-dvh bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 h-screen ml-64">
        {/* Persistent Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-[1600px] mx-auto px-8">
            <div className="flex items-center justify-between py-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Social media insights and performance metrics
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-muted-foreground">
                    {totalTweets} tweets analyzed
                  </span>
                </div>
                <Select
                  value={timeRange}
                  onValueChange={(v) => setTimeRange(v as TimeRange)}
                >
                  <SelectTrigger className="w-[160px] h-11 bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>

                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <Card
                key={index}
                className="border border-border shadow-sm bg-card py-0"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp
                          className={`h-3 w-3 ${
                            stat.trend === "up"
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            stat.trend === "up"
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        stat.color === "blue"
                          ? "bg-blue-50"
                          : stat.color === "red"
                          ? "bg-red-50"
                          : stat.color === "green"
                          ? "bg-emerald-50"
                          : "bg-orange-50"
                      }`}
                    >
                      <stat.icon
                        className={`h-6 w-6 ${
                          stat.color === "blue"
                            ? "text-blue-600"
                            : stat.color === "red"
                            ? "text-red-600"
                            : stat.color === "green"
                            ? "text-emerald-600"
                            : "text-orange-600"
                        }`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Sentiment Analysis */}
            <Card className="border border-border shadow-sm bg-card">
              <CardContent className="p-0">
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Sentiment Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Overall distribution
                      </p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="relative h-72 px-6">
                  <Doughnut
                    data={{
                      labels: sentimentData.labels,
                      datasets: sentimentData.datasets,
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      layout: {
                        padding: 8,
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: "rgba(15, 23, 42, 0.95)",
                          titleColor: "#f8fafc",
                          bodyColor: "#e2e8f0",
                          borderColor: "rgba(148, 163, 184, 0.2)",
                          borderWidth: 1,
                          cornerRadius: 12,
                          padding: 12,
                          titleFont: {
                            size: 14,
                            weight: "bold" as const,
                          },
                          bodyFont: {
                            size: 13,
                          },
                          displayColors: true,
                          boxPadding: 8,
                        },
                      },
                      cutout: "62%",
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 px-6 pb-6">
                  {sentimentData.labels.map((label: string, index: number) => {
                    const percentage =
                      sentimentData.percentages[
                        label.toLowerCase() as keyof typeof sentimentData.percentages
                      ];
                    const value = sentimentData.datasets[0].data[index];
                    const bgColor = sentimentData.datasets[0]
                      .backgroundColor as string[];
                    const color = bgColor[index];

                    return (
                      <div
                        key={label}
                        className="rounded-lg border border-border bg-gradient-to-br from-muted/50 to-muted p-4 text-center transition-all hover:shadow-md hover:border-border/80"
                      >
                        <div className="flex items-center justify-center mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {label}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {percentage}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {value} tweets
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Engagement Trend - Spans 2 columns */}
            <Card className="lg:col-span-2 border border-border shadow-sm bg-card py-0 justify-start">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Engagement Trend
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Likes, retweets, and replies over time
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Heart className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="h-96">
                  <Bar
                    data={{
                      labels: engagementData.map((d) => d.day),
                      datasets: [
                        {
                          label: "Likes",
                          data: engagementData.map((d) => d.likes),
                          backgroundColor: "rgba(239, 68, 68, 0.75)",
                          borderRadius: 4,
                        },
                        {
                          label: "Retweets",
                          data: engagementData.map((d) => d.retweets),
                          backgroundColor: "rgba(59, 130, 246, 0.75)",
                          borderRadius: 4,
                        },
                        {
                          label: "Replies",
                          data: engagementData.map((d) => d.replies),
                          backgroundColor: "rgba(34, 197, 94, 0.75)",
                          borderRadius: 4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: "index" as const,
                        intersect: false,
                      },
                      plugins: {
                        legend: {
                          display: true,
                          position: "top" as const,
                          labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: { size: 12 },
                            usePointStyle: true,
                          },
                        },
                        tooltip: {
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          padding: 12,
                          cornerRadius: 8,
                          titleFont: { size: 13, weight: "bold" as const },
                          bodyFont: { size: 12 },
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 11 } },
                        },
                        y: {
                          grid: { color: "rgba(0, 0, 0, 0.05)" },
                          ticks: { font: { size: 11 } },
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Most Reposted Content */}
          <div className="mb-8">
            <RepostedSlider tweets={uiTweets as any} />
          </div>

          {/* Keywords and Location Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Locations - Moved here to replace hashtag chart */}
            <Card className="border border-border shadow-sm bg-card py-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Top Locations
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Most mentioned regions
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: locationData.map((d) => d.location),
                      datasets: [
                        {
                          label: "Tweet Count",
                          data: locationData.map((d) => d.count),
                          backgroundColor: "rgba(249, 115, 22, 0.7)",
                          borderColor: "rgba(249, 115, 22, 1)",
                          borderWidth: 0,
                          borderRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      indexAxis: "y" as const,
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          padding: 12,
                          cornerRadius: 8,
                          titleFont: { size: 13, weight: "bold" as const },
                          bodyFont: { size: 12 },
                        },
                      },
                      scales: {
                        x: {
                          grid: { color: "rgba(0, 0, 0, 0.05)" },
                          ticks: { font: { size: 11 } },
                          beginAtZero: true,
                        },
                        y: {
                          grid: { display: false },
                          ticks: { font: { size: 11 } },
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Keyword Analysis */}
            <Card className="border border-border shadow-sm bg-card py-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Type className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Keyword Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Most frequent words by sentiment
                      </p>
                    </div>
                  </div>
                </div>
                <Tabs defaultValue="positive" className="w-full">
                  <TabsList className="w-full mb-4 bg-muted">
                    <TabsTrigger
                      value="positive"
                      className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-orange-600 dark:text-white"
                    >
                      Positive
                    </TabsTrigger>
                    <TabsTrigger
                      value="negative"
                      className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-orange-600 dark:text-white"
                    >
                      Negative
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="positive" className="mt-0">
                    <KeywordCloud
                      type="positive"
                      words={wordCloudData.positive}
                    />
                  </TabsContent>
                  <TabsContent value="negative" className="mt-0">
                    <KeywordCloud
                      type="negative"
                      words={wordCloudData.negative}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Tweets Grid Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  All Tweets
                </h2>
                <p className="text-sm text-muted-foreground">
                  Browse through all collected tweets
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex border border-border rounded-lg bg-card overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-none h-10 px-4 ${
                      viewMode === "grid"
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-none h-10 px-4 border-l border-slate-200 ${
                      viewMode === "list"
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Select
                  value={sentimentFilter}
                  onValueChange={(v: any) => setSentimentFilter(v)}
                >
                  <SelectTrigger className="w-[160px] h-10 bg-input border-border">
                    <SelectValue placeholder="Filter sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sentiments</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTweets.map((tweet) => (
                  <Card
                    key={tweet.id}
                    className="border border-border shadow-sm bg-card hover:shadow-md transition-shadow py-0"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {tweet.author.charAt(1)?.toUpperCase?.() || "A"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {tweet.author}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tweet.author}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${
                            resolveSentiment(tweet) === "positive"
                              ? "bg-emerald-100 text-emerald-700"
                              : resolveSentiment(tweet) === "negative"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          } border-0 font-medium text-xs`}
                        >
                          {resolveSentiment(tweet)}
                        </Badge>
                      </div>

                      <p className="text-foreground/90 text-sm mb-4 line-clamp-3">
                        {tweet.text}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{tweet.metrics.replies}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Repeat2 className="h-3 w-3" />
                            <span>{tweet.metrics.retweets}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{tweet.metrics.likes}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(tweet.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <AnalyticsTweetList
                tweets={filteredTweets as any}
                className="h-auto"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
