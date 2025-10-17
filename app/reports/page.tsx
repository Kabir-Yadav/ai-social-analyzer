"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  ArrowUpDown,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchTweetsFiltered,
  getUniqueColumnValues,
  type SupabaseTweet,
  type TimeRange,
} from "@/lib/tweet-service";

export default function ReportsPage() {
  const [tweets, setTweets] = useState<SupabaseTweet[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentiment, setSentiment] = useState<string | undefined>();
  const [region, setRegion] = useState<string | undefined>();
  const [language, setLanguage] = useState<string | undefined>();
  const [timeRange, setTimeRange] = useState<TimeRange | undefined>();
  const [loading, setLoading] = useState(false);

  // Filter options
  const [sentiments, setSentiments] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadTweets();
  }, [page, sentiment, region, language, timeRange]);

  const loadFilterOptions = async () => {
    const [s, r, l] = await Promise.all([
      getUniqueColumnValues("sentiment"),
      getUniqueColumnValues("region"),
      getUniqueColumnValues("language"),
    ]);
    setSentiments(s);
    setRegions(r);
    setLanguages(l);
  };

  const loadTweets = async () => {
    setLoading(true);
    try {
      const { tweets: data, total: count } = await fetchTweetsFiltered({
        sentiment: sentiment === "all" ? undefined : (sentiment as any),
        range: timeRange,
        page,
        limit,
      });
      setTweets(data);
      setTotal(count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "pdf") => {
    // Get all tweets for export
    const allTweets = [];
    const totalPages = Math.ceil(total / limit);
    for (let p = 0; p < totalPages; p++) {
      const { tweets } = await fetchTweetsFiltered({
        sentiment: sentiment as any,
        range: timeRange,
        page: p,
        limit,
      });
      allTweets.push(...tweets);
    }

    if (format === "csv") {
      const headers = [
        "Date",
        "Text",
        "Author",
        "Sentiment",
        "Region",
        "Language",
        "Likes",
        "Replies",
        "Reposts",
        "Engagement",
      ];
      const rows = allTweets.map((t) => [
        t.date,
        `"${t.text.replace(/"/g, '""')}"`,
        t.author_name,
        t.sentiment,
        t.region,
        t.language,
        t.likes,
        t.replies,
        t.reposts,
        t.engagement,
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n"
      );
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tweets-export-${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For PDF, we'll use browser's print functionality
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tweets Export</title>
          <style>
            body { font-family: system-ui, sans-serif; margin: 2rem; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Tweets Export</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Text</th>
                <th>Author</th>
                <th>Sentiment</th>
                <th>Region</th>
                <th>Language</th>
                <th>Engagement</th>
              </tr>
            </thead>
            <tbody>
              ${allTweets
                .map(
                  (t) => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>${t.text}</td>
                  <td>${t.author_name}</td>
                  <td>${t.sentiment || ""}</td>
                  <td>${t.region || ""}</td>
                  <td>${t.language || ""}</td>
                  <td>${t.engagement || 0}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredTweets = tweets.filter((tweet) =>
    tweet.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  Reports
                </h1>
                <p className="text-sm text-muted-foreground">
                  View and export tweet data
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-600 dark:hover:bg-orange-700 px-6 py-2.5 rounded-lg shadow-sm font-medium transition-all">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-popover border-border"
                  >
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto px-8 py-8">
          {/* Search and Filters */}
          <div className="flex items-center gap-3 flex-wrap mb-6">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tweets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-input border-border focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
            <Select
              value={timeRange}
              onValueChange={(v) => setTimeRange(v as TimeRange)}
            >
              <SelectTrigger className="w-[140px] h-11 bg-input border-border">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sentiment} onValueChange={setSentiment}>
              <SelectTrigger className="w-[140px] h-11 bg-input border-border">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Sentiments</SelectItem>
                {sentiments.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-[140px] h-11 bg-input border-border">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px] h-11 bg-input border-border">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tweets Table */}
          <Card className="border border-border shadow-sm bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                        <div className="flex items-center gap-2">
                          Date
                          <ArrowUpDown className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                        Text
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                        Author
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                        Sentiment
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                        Region
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                        Language
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-foreground text-sm">
                        Engagement
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Loading tweets...
                        </td>
                      </tr>
                    ) : filteredTweets.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          No tweets found matching your filters
                        </td>
                      </tr>
                    ) : (
                      filteredTweets.map((tweet) => (
                        <tr
                          key={tweet.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(tweet.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground line-clamp-2">
                              {tweet.text}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {tweet.author_name}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="secondary"
                              className={`${
                                tweet.sentiment === "positive"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : tweet.sentiment === "negative"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                  : "bg-secondary text-secondary-foreground"
                              } hover:bg-opacity-90 border-0 font-medium`}
                            >
                              {tweet.sentiment || "Unknown"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {tweet.region || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {tweet.language || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {tweet.engagement || 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-card border border-border rounded-lg px-6 py-4 mt-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">
                Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)}{" "}
                of {total}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-9 border-border hover:bg-muted/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * limit >= total}
                className="h-9 border-border hover:bg-muted/50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
