"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar } from "@/components/narrative";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  Repeat,
  BarChart3,
  Sparkles,
  Award,
} from "lucide-react";
import {
  getAuthorAnalytics,
  fetchTweetsByAuthor,
  type SupabaseTweet,
} from "@/lib/tweet-service";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type AuthorStats = {
  name: string;
  totalTweets: number;
  totalEngagement: number;
  avgEngagement: number;
  totalLikes: number;
  totalReplies: number;
  totalReposts: number;
  sentiments: Record<string, number>;
  tweetsPerDay: Record<string, number>;
  tweetsPerMonth: Record<string, number>;
};

// Subtle color palette
const COLORS = {
  positive: "rgba(52, 168, 83, 0.85)", // muted green
  neutral: "rgba(158, 158, 158, 0.6)", // muted gray
  negative: "rgba(234, 67, 53, 0.85)", // muted red
  primary: "rgba(234, 88, 12, 0.85)", // muted orange
  likes: "rgba(239, 68, 68, 0.75)", // soft red
  replies: "rgba(59, 130, 246, 0.75)", // soft blue
  reposts: "rgba(16, 185, 129, 0.75)", // soft green
  line: "rgba(234, 88, 12, 1)", // solid orange
};

export default function InfluencersPage() {
  const [authors, setAuthors] = useState<AuthorStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [tweetBucket, setTweetBucket] = useState<"day" | "month">("day");
  const [openAuthor, setOpenAuthor] = useState<string | null>(null);
  const [authorTweets, setAuthorTweets] = useState<
    Record<string, SupabaseTweet[]>
  >({});
  const [authorLoading, setAuthorLoading] = useState<string | null>(null);

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      const { authors: data } = await getAuthorAnalytics();
      setAuthors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const topAuthors = authors.slice(0, 10);

  // 1) Sentiment per Author (100% stacked)
  const sentimentPerAuthor = topAuthors.map((a) => {
    const p = a.sentiments.positive || 0;
    const n = a.sentiments.neutral || 0;
    const neg = a.sentiments.negative || 0;
    const total = p + n + neg || 1;
    return {
      author: a.name.split(" ")[0],
      positive: Math.round((p / total) * 100),
      neutral: Math.round((n / total) * 100),
      negative: Math.round((neg / total) * 100),
    };
  });

  // 2) Engagement chart
  const engagementData = topAuthors.map((a) => ({
    name: a.name.split(" ")[0],
    likes: a.totalLikes,
    replies: a.totalReplies,
    reposts: a.totalReposts,
    rate: Math.round(a.avgEngagement),
  }));

  // 3) Tweet counts per author
  const lastNDaysKeys = (n: number) => {
    const keys: string[] = [];
    for (let i = 0; i < n; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      keys.push(d.toISOString().split("T")[0]);
    }
    return keys;
  };
  const lastNMonthsKeys = (n: number) => {
    const keys: string[] = [];
    const now = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      keys.push(monthKey);
    }
    return keys;
  };
  const tweetCountsPerAuthor = topAuthors.map((a) => {
    if (tweetBucket === "day") {
      const keys = lastNDaysKeys(14);
      const count = keys.reduce((sum, k) => sum + (a.tweetsPerDay[k] || 0), 0);
      return { name: a.name.split(" ")[0], count };
    } else {
      const keys = lastNMonthsKeys(12);
      const count = keys.reduce(
        (sum, k) => sum + (a.tweetsPerMonth[k] || 0),
        0
      );
      return { name: a.name.split(" ")[0], count };
    }
  });

  // Chart.js data
  const sentimentChartData = {
    labels: sentimentPerAuthor.map((d) => d.author),
    datasets: [
      {
        label: "Positive",
        data: sentimentPerAuthor.map((d) => d.positive),
        backgroundColor: COLORS.positive,
        borderWidth: 0,
      },
      {
        label: "Neutral",
        data: sentimentPerAuthor.map((d) => d.neutral),
        backgroundColor: COLORS.neutral,
        borderWidth: 0,
      },
      {
        label: "Negative",
        data: sentimentPerAuthor.map((d) => d.negative),
        backgroundColor: COLORS.negative,
        borderWidth: 0,
      },
    ],
  };

  const tweetVolumeChartData = {
    labels: tweetCountsPerAuthor.map((d) => d.name),
    datasets: [
      {
        label: tweetBucket === "day" ? "Tweets (14d)" : "Tweets (12m)",
        data: tweetCountsPerAuthor.map((d) => d.count),
        backgroundColor: COLORS.primary,
        borderWidth: 0,
      },
    ],
  };

  const engagementChartData = {
    labels: engagementData.map((d) => d.name),
    datasets: [
      {
        type: "bar" as const,
        label: "Likes",
        data: engagementData.map((d) => d.likes),
        backgroundColor: COLORS.likes,
        borderWidth: 0,
        yAxisID: "y",
      },
      {
        type: "bar" as const,
        label: "Replies",
        data: engagementData.map((d) => d.replies),
        backgroundColor: COLORS.replies,
        borderWidth: 0,
        yAxisID: "y",
      },
      {
        type: "bar" as const,
        label: "Reposts",
        data: engagementData.map((d) => d.reposts),
        backgroundColor: COLORS.reposts,
        borderWidth: 0,
        yAxisID: "y",
      },
      {
        type: "line" as const,
        label: "Engagement Rate",
        data: engagementData.map((d) => d.rate),
        borderColor: COLORS.line,
        backgroundColor: "transparent",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: COLORS.line,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          padding: 8,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 10,
        cornerRadius: 6,
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
      },
    },
    layout: {
      padding: { top: 5, bottom: 5, left: 5, right: 5 },
    },
  };

  const sentimentOptions = {
    ...chartOptions,
    indexAxis: "y" as const,
    scales: {
      x: {
        stacked: true,
        max: 100,
        grid: { display: false },
        ticks: {
          callback: (value: any) => value + "%",
          font: { size: 11 },
        },
      },
      y: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  const engagementOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: "top" as const,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        type: "linear" as const,
        position: "left" as const,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: { font: { size: 11 } },
      },
      y1: {
        type: "linear" as const,
        position: "right" as const,
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  const ensureAuthorTweets = async (authorName: string) => {
    if (authorTweets[authorName] || authorLoading === authorName) return;
    setAuthorLoading(authorName);
    const data = await fetchTweetsByAuthor(authorName);
    setAuthorTweets((prev) => ({ ...prev, [authorName]: data }));
    setAuthorLoading(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSentimentDominant = (sentiments: Record<string, number>) => {
    const entries = Object.entries(sentiments);
    if (entries.length === 0) return "neutral";
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  };

  return (
    <div className="flex overflow-x-hidden min-h-dvh bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 h-screen ml-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-[1600px] mx-auto px-8">
            <div className="flex items-center justify-between py-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  Influencer Analytics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track and analyze top content creators
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto px-8 py-8">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading influencer data...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border border-border shadow-sm bg-gradient-to-br from-orange-500 to-orange-600 text-white dark:from-orange-600 dark:to-orange-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-orange-100 text-sm mb-1">
                          Top Influencer
                        </div>
                        <div className="text-2xl font-bold">
                          {topAuthors[0]?.name.split(" ")[0] || "-"}
                        </div>
                      </div>
                      <Award className="h-10 w-10 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-muted-foreground text-sm mb-1">
                          Total Authors
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                          {authors.length}
                        </div>
                      </div>
                      <Users className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-muted-foreground text-sm mb-1">
                          Total Engagement
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                          {authors
                            .reduce((acc, a) => acc + a.totalEngagement, 0)
                            .toLocaleString()}
                        </div>
                      </div>
                      <TrendingUp className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-muted-foreground text-sm mb-1">
                          Avg. Engagement
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                          {Math.round(
                            authors.reduce(
                              (acc, a) => acc + a.avgEngagement,
                              0
                            ) / (authors.length || 1)
                          ).toLocaleString()}
                        </div>
                      </div>
                      <Sparkles className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row: Sentiment (2/3) + Tweet Volume (1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sentiment by Author (2/3 width) */}
                <Card className="border border-border shadow-sm bg-card lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Sentiment Distribution by Author
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="h-[380px]">
                      <Bar
                        data={sentimentChartData}
                        options={sentimentOptions}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tweet Volume (1/3 width) */}
                <Card className="border border-border shadow-sm bg-card">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Tweet Volume
                    </CardTitle>
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        onClick={() => setTweetBucket("day")}
                        className={`px-2 py-1 rounded ${
                          tweetBucket === "day"
                            ? "bg-orange-600 text-white"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        } transition-colors`}
                      >
                        Day
                      </button>
                      <button
                        onClick={() => setTweetBucket("month")}
                        className={`px-2 py-1 rounded ${
                          tweetBucket === "month"
                            ? "bg-orange-600 text-white"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        } transition-colors`}
                      >
                        Month
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="h-[380px]">
                      <Bar data={tweetVolumeChartData} options={chartOptions} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Engagement Chart (Full Width) */}
              <Card className="border border-border shadow-sm bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Engagement Metrics with Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="h-[320px]">
                    <Chart
                      type="bar"
                      data={engagementChartData}
                      options={engagementOptions}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Top Influencers List */}
              <Card className="border border-border shadow-sm bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <Users className="h-5 w-5 text-orange-600" />
                    Top Influencers Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {topAuthors.map((author, index) => {
                      const dominantSentiment = getSentimentDominant(
                        author.sentiments
                      );
                      const total =
                        (author.sentiments.positive || 0) +
                        (author.sentiments.neutral || 0) +
                        (author.sentiments.negative || 0);
                      const positivePercent =
                        total > 0
                          ? Math.round(
                              ((author.sentiments.positive || 0) / total) * 100
                            )
                          : 0;

                      const isOpen = openAuthor === author.name;
                      return (
                        <Accordion
                          key={author.name}
                          type="single"
                          collapsible
                          value={isOpen ? author.name : undefined}
                          onValueChange={async (v) => {
                            const next = v || null;
                            setOpenAuthor(next);
                            if (next) await ensureAuthorTweets(author.name);
                          }}
                        >
                          <AccordionItem
                            value={author.name}
                            className="border border-border rounded-lg bg-card"
                          >
                            <AccordionTrigger className="px-4 hover:no-underline">
                              <div className="w-full flex items-center gap-4">
                                <div className="flex items-center gap-3 min-w-[50px]">
                                  <div
                                    className={`text-lg font-bold ${
                                      index === 0
                                        ? "text-orange-600"
                                        : index === 1
                                        ? "text-muted-foreground"
                                        : index === 2
                                        ? "text-amber-600"
                                        : "text-muted-foreground/60"
                                    }`}
                                  >
                                    #{index + 1}
                                  </div>
                                  <Avatar className="h-10 w-10 border-2 border-border">
                                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold">
                                      {getInitials(author.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-foreground truncate">
                                    {author.name}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                      {author.totalTweets} tweets
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className={`${
                                        dominantSentiment === "positive"
                                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                          : dominantSentiment === "negative"
                                          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                          : "bg-secondary text-secondary-foreground"
                                      } hover:bg-opacity-90 border-0 text-xs`}
                                    >
                                      {positivePercent}% positive
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <div className="text-xs text-muted-foreground mb-1">
                                      Engagement
                                    </div>
                                    <div className="text-lg font-bold text-foreground">
                                      {author.totalEngagement.toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                      <Heart className="h-4 w-4" />
                                      <span className="font-medium">
                                        {(author.totalLikes / 1000).toFixed(1)}k
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                      <MessageCircle className="h-4 w-4" />
                                      <span className="font-medium">
                                        {author.totalReplies}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                      <Repeat className="h-4 w-4" />
                                      <span className="font-medium">
                                        {author.totalReposts}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="max-h-96 overflow-y-auto border-t border-border pt-4 px-4 bg-muted/30">
                                {authorLoading === author.name && (
                                  <div className="text-sm text-muted-foreground py-4">
                                    Loading tweets...
                                  </div>
                                )}
                                <div className="space-y-4">
                                  {(authorTweets[author.name] || []).map(
                                    (t) => (
                                      <div
                                        key={t.id}
                                        className="pb-4 border-b border-border last:border-0"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="text-xs text-muted-foreground">
                                            {new Date(t.date).toLocaleString()}
                                            {t.language && ` • ${t.language}`}
                                            {t.region && ` • ${t.region}`}
                                          </div>
                                          <Badge
                                            variant="secondary"
                                            className={`text-xs ${
                                              t.sentiment === "positive"
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                                : t.sentiment === "negative"
                                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                                                : "bg-secondary text-secondary-foreground border-border"
                                            }`}
                                          >
                                            {t.sentiment || "neutral"}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-foreground leading-relaxed mb-3">
                                          {t.text}
                                        </div>
                                        <div className="flex items-center gap-6 text-xs">
                                          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                                            <Heart className="h-3.5 w-3.5" />
                                            <span className="font-medium">
                                              {(t.likes || 0).toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                            <MessageCircle className="h-3.5 w-3.5" />
                                            <span className="font-medium">
                                              {(
                                                t.replies || 0
                                              ).toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                            <Repeat className="h-3.5 w-3.5" />
                                            <span className="font-medium">
                                              {(
                                                t.reposts || 0
                                              ).toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <BarChart3 className="h-3.5 w-3.5" />
                                            <span className="font-medium">
                                              {(
                                                t.engagement || 0
                                              ).toLocaleString()}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                                {authorTweets[author.name] &&
                                  authorTweets[author.name].length === 0 && (
                                    <div className="text-sm text-muted-foreground py-2">
                                      No tweets found for this author.
                                    </div>
                                  )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
