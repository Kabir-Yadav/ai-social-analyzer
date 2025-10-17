import { supabase, Database } from "./supabase-client";

export type SupabaseTweet = Database["public"]["Tables"]["tweets"]["Row"];

export type TimeRange = "24h" | "7d" | "30d" | "90d";

export function getSinceFromRange(range: TimeRange): string {
  const now = new Date();
  const d = new Date(now);
  if (range === "24h") d.setDate(now.getDate() - 1);
  else if (range === "7d") d.setDate(now.getDate() - 7);
  else if (range === "30d") d.setDate(now.getDate() - 30);
  else if (range === "90d") d.setDate(now.getDate() - 90);
  return d.toISOString();
}

/**
 * Fetch all tweets from Supabase
 */
export async function fetchAllTweets(): Promise<SupabaseTweet[]> {
  try {
    const { data, error } = await supabase
      .from("tweets")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching tweets:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching tweets:", error);
    return [];
  }
}

/**
 * Fetch tweets filtered by optional sentiment and time range
 */
export async function fetchTweetsFiltered(params: {
  sentiment?: "positive" | "negative" | "neutral";
  range?: TimeRange;
  page?: number;
  limit?: number;
}): Promise<{ tweets: SupabaseTweet[]; total: number }> {
  const page = params.page ?? 0;
  const limit = params.limit ?? 50;
  try {
    let query = supabase
      .from("tweets")
      .select("*", { count: "exact" })
      .order("date", { ascending: false });

    if (params.sentiment) {
      query = query.eq("sentiment", params.sentiment);
    }
    if (params.range) {
      const since = getSinceFromRange(params.range);
      query = query.gte("date", since);
    }

    const { data, error, count } = await query.range(
      page * limit,
      page * limit + limit - 1
    );

    if (error) {
      console.error("Error fetching filtered tweets:", error.message);
      return { tweets: [], total: 0 };
    }

    return { tweets: data || [], total: count || 0 };
  } catch (error) {
    console.error("Unexpected error fetching filtered tweets:", error);
    return { tweets: [], total: 0 };
  }
}

/**
 * Fetch tweets with pagination
 */
export async function fetchTweetsWithPagination(
  page: number = 0,
  limit: number = 50
): Promise<{ tweets: SupabaseTweet[]; total: number }> {
  try {
    const { data, error, count } = await supabase
      .from("tweets")
      .select("*", { count: "exact" })
      .order("date", { ascending: false })
      .range(page * limit, page * limit + limit - 1);

    if (error) {
      console.error("Error fetching tweets with pagination:", error.message);
      return { tweets: [], total: 0 };
    }

    return { tweets: data || [], total: count || 0 };
  } catch (error) {
    console.error("Unexpected error fetching tweets with pagination:", error);
    return { tweets: [], total: 0 };
  }
}

/**
 * Fetch tweets filtered by sentiment
 */
export async function fetchTweetsBySentiment(
  sentiment: string
): Promise<SupabaseTweet[]> {
  try {
    const { data, error } = await supabase
      .from("tweets")
      .select("*")
      .eq("sentiment", sentiment)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching tweets by sentiment:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching tweets by sentiment:", error);
    return [];
  }
}

/**
 * Fetch tweets filtered by region
 */
export async function fetchTweetsByRegion(region: string): Promise<SupabaseTweet[]> {
  try {
    const { data, error } = await supabase
      .from("tweets")
      .select("*")
      .eq("region", region)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching tweets by region:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching tweets by region:", error);
    return [];
  }
}

/**
 * Fetch tweets filtered by language
 */
export async function fetchTweetsByLanguage(language: string): Promise<SupabaseTweet[]> {
  try {
    const { data, error } = await supabase
      .from("tweets")
      .select("*")
      .eq("language", language)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching tweets by language:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching tweets by language:", error);
    return [];
  }
}

/**
 * Get unique values for a column (for filters)
 */
export async function getUniqueColumnValues(
  column: "sentiment" | "region" | "language"
): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("tweets")
      .select(column)
      .not(column, "is", null);

    if (error) {
      console.error(
        `Error fetching unique ${column} values:`,
        error.message
      );
      return [];
    }

    const unique = Array.from(
      new Set((data || []).map((item: any) => item[column]).filter(Boolean))
    );

    return unique.sort();
  } catch (error) {
    console.error(`Unexpected error fetching unique ${column} values:`, error);
    return [];
  }
}

/**
 * Get analytics summary
 */
export async function getAnalyticsSummary(): Promise<{
  totalTweets: number;
  sentimentCounts: Record<string, number>;
  regionCounts: Record<string, number>;
  avgEngagement: number;
  avgLikes: number;
  avgReplies: number;
  avgReposts: number;
  languageCounts: Record<string, number>;
}> {
  try {
    const { data, error } = await supabase.from("tweets").select("*");

    if (error || !data) {
      console.error("Error fetching analytics data:", error?.message);
      return {
        totalTweets: 0,
        sentimentCounts: {},
        regionCounts: {},
        avgEngagement: 0,
        avgLikes: 0,
        avgReplies: 0,
        avgReposts: 0,
        languageCounts: {},
      };
    }

    const sentimentCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    const languageCounts: Record<string, number> = {};
    let totalEngagement = 0;
    let totalLikes = 0;
    let totalReplies = 0;
    let totalReposts = 0;
    let validEngagementCount = 0;

    data.forEach((tweet) => {
      // Count sentiments
      if (tweet.sentiment) {
        sentimentCounts[tweet.sentiment] = (sentimentCounts[tweet.sentiment] || 0) + 1;
      }

      // Count regions
      if (tweet.region) {
        regionCounts[tweet.region] = (regionCounts[tweet.region] || 0) + 1;
      }

      // Count languages
      if (tweet.language) {
        languageCounts[tweet.language] = (languageCounts[tweet.language] || 0) + 1;
      }

      // Calculate averages
      if (tweet.engagement !== null) {
        totalEngagement += tweet.engagement;
        validEngagementCount++;
      }
      if (tweet.likes !== null) totalLikes += tweet.likes;
      if (tweet.replies !== null) totalReplies += tweet.replies;
      if (tweet.reposts !== null) totalReposts += tweet.reposts;
    });

    return {
      totalTweets: data.length,
      sentimentCounts,
      regionCounts,
      avgEngagement: validEngagementCount > 0 ? totalEngagement / validEngagementCount : 0,
      avgLikes: data.length > 0 ? totalLikes / data.length : 0,
      avgReplies: data.length > 0 ? totalReplies / data.length : 0,
      avgReposts: data.length > 0 ? totalReposts / data.length : 0,
      languageCounts,
    };
  } catch (error) {
    console.error("Unexpected error getting analytics summary:", error);
    return {
      totalTweets: 0,
      sentimentCounts: {},
      regionCounts: {},
      avgEngagement: 0,
      avgLikes: 0,
      avgReplies: 0,
      avgReposts: 0,
      languageCounts: {},
    };
  }
}

/**
 * Get analytics summary filtered by time range
 */
export async function getAnalyticsSummaryByRange(range: TimeRange): Promise<{
  totalTweets: number;
  sentimentCounts: Record<string, number>;
  regionCounts: Record<string, number>;
  avgEngagement: number;
  avgLikes: number;
  avgReplies: number;
  avgReposts: number;
  languageCounts: Record<string, number>;
}> {
  try {
    const since = getSinceFromRange(range);
    const { data, error } = await supabase
      .from("tweets")
      .select("*")
      .gte("date", since);

    if (error || !data) {
      console.error("Error fetching analytics (range):", error?.message);
      return {
        totalTweets: 0,
        sentimentCounts: {},
        regionCounts: {},
        avgEngagement: 0,
        avgLikes: 0,
        avgReplies: 0,
        avgReposts: 0,
        languageCounts: {},
      };
    }

    const sentimentCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    const languageCounts: Record<string, number> = {};
    let totalEngagement = 0;
    let totalLikes = 0;
    let totalReplies = 0;
    let totalReposts = 0;
    let validEngagementCount = 0;

    data.forEach((tweet) => {
      if (tweet.sentiment) {
        sentimentCounts[tweet.sentiment] = (sentimentCounts[tweet.sentiment] || 0) + 1;
      }
      if (tweet.region) {
        regionCounts[tweet.region] = (regionCounts[tweet.region] || 0) + 1;
      }
      if (tweet.language) {
        languageCounts[tweet.language] = (languageCounts[tweet.language] || 0) + 1;
      }
      if (tweet.engagement !== null) {
        totalEngagement += tweet.engagement;
        validEngagementCount++;
      }
      if (tweet.likes !== null) totalLikes += tweet.likes;
      if (tweet.replies !== null) totalReplies += tweet.replies;
      if (tweet.reposts !== null) totalReposts += tweet.reposts;
    });

    return {
      totalTweets: data.length,
      sentimentCounts,
      regionCounts,
      avgEngagement: validEngagementCount > 0 ? totalEngagement / validEngagementCount : 0,
      avgLikes: data.length > 0 ? totalLikes / data.length : 0,
      avgReplies: data.length > 0 ? totalReplies / data.length : 0,
      avgReposts: data.length > 0 ? totalReposts / data.length : 0,
      languageCounts,
    };
  } catch (error) {
    console.error("Unexpected error getting analytics by range:", error);
    return {
      totalTweets: 0,
      sentimentCounts: {},
      regionCounts: {},
      avgEngagement: 0,
      avgLikes: 0,
      avgReplies: 0,
      avgReposts: 0,
      languageCounts: {},
    };
  }
}

/**
 * Get keywords from all tweets (aggregate)
 */
export async function getKeywordsCloud(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from("tweets")
      .select("keywords")
      .not("keywords", "is", null);

    if (error || !data) {
      console.error("Error fetching keywords:", error?.message);
      return {};
    }

    const keywordCounts: Record<string, number> = {};

    data.forEach((row) => {
      if (row.keywords) {
        const keywords = row.keywords
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean);

        keywords.forEach((keyword: string) => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
      }
    });

    return keywordCounts;
  } catch (error) {
    console.error("Unexpected error getting keywords cloud:", error);
    return {};
  }
}

/**
 * Get hashtags from all tweets
 */
export async function getHashtags(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.from("tweets").select("text");

    if (error || !data) {
      console.error("Error fetching hashtags:", error?.message);
      return {};
    }

    const hashtagCounts: Record<string, number> = {};
    const hashtagRegex = /#[\w]+/g;

    data.forEach((row) => {
      if (row.text) {
        const hashtags = row.text.match(hashtagRegex) || [];
        hashtags.forEach((hashtag: string) => {
          hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
        });
      }
    });

    return hashtagCounts;
  } catch (error) {
    console.error("Unexpected error getting hashtags:", error);
    return {};
  }
}

/**
 * Get driving narratives
 */
export async function getDrivingNarratives(): Promise<SupabaseTweet[]> {
  try {
    const { data, error } = await supabase
      .from("tweets")
      .select("*")
      .eq("is_driving", true)
      .order("engagement", { ascending: false });

    if (error) {
      console.error("Error fetching driving narratives:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching driving narratives:", error);
    return [];
  }
}

/**
 * Search tweets by text
 */
export async function searchTweets(query: string): Promise<SupabaseTweet[]> {
  try {
    const { data, error } = await supabase
      .from("tweets")
      .select("*")
      .ilike("text", `%${query}%`)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error searching tweets:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error searching tweets:", error);
    return [];
  }
}

/**
 * Fetch tweets by author name
 */
export async function fetchTweetsByAuthor(authorName: string): Promise<SupabaseTweet[]> {
  try {
    const { data, error } = await supabase
      .from("tweets")
      .select("*")
      .eq("author_name", authorName)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching tweets by author:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching tweets by author:", error);
    return [];
  }
}

/**
 * Get author analytics
 */
export async function getAuthorAnalytics(): Promise<{
  authors: Array<{
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
  }>;
}> {
  try {
    const { data, error } = await supabase.from("tweets").select("*");

    if (error || !data) {
      console.error("Error fetching author analytics:", error?.message);
      return { authors: [] };
    }

    type AuthorStats = {
      name: string;
      tweets: SupabaseTweet[];
      totalEngagement: number;
      totalLikes: number;
      totalReplies: number;
      totalReposts: number;
      sentiments: Record<string, number>;
      tweetsPerDay: Record<string, number>;
      tweetsPerMonth: Record<string, number>;
    };

    const authorStats = new Map<string, AuthorStats>();

    // Process each tweet
    data.forEach((tweet) => {
      const authorName = tweet.author_name;
      if (!authorName) return;

      const stats: AuthorStats = authorStats.get(authorName) ?? {
        name: authorName,
        tweets: [] as SupabaseTweet[],
        totalEngagement: 0,
        totalLikes: 0,
        totalReplies: 0,
        totalReposts: 0,
        sentiments: {} as Record<string, number>,
        tweetsPerDay: {} as Record<string, number>,
        tweetsPerMonth: {} as Record<string, number>,
      };

      stats.tweets.push(tweet as SupabaseTweet);
      stats.totalEngagement += tweet.engagement || 0;
      stats.totalLikes += tweet.likes || 0;
      stats.totalReplies += tweet.replies || 0;
      stats.totalReposts += tweet.reposts || 0;

      if (tweet.sentiment) {
        stats.sentiments[tweet.sentiment] = (stats.sentiments[tweet.sentiment] || 0) + 1;
      }

      const date = new Date(tweet.date);
      const dayKey = date.toISOString().split('T')[0];
      const monthKey = dayKey.substring(0, 7);

      stats.tweetsPerDay[dayKey] = (stats.tweetsPerDay[dayKey] || 0) + 1;
      stats.tweetsPerMonth[monthKey] = (stats.tweetsPerMonth[monthKey] || 0) + 1;

      authorStats.set(authorName, stats);
    });

    // Convert to array and calculate averages
    const authors = Array.from(authorStats.values()).map((stats) => ({
      name: stats.name,
      totalTweets: stats.tweets.length,
      totalEngagement: stats.totalEngagement,
      avgEngagement: stats.tweets.length > 0 ? stats.totalEngagement / stats.tweets.length : 0,
      totalLikes: stats.totalLikes,
      totalReplies: stats.totalReplies,
      totalReposts: stats.totalReposts,
      sentiments: stats.sentiments,
      tweetsPerDay: stats.tweetsPerDay,
      tweetsPerMonth: stats.tweetsPerMonth,
    }));

    // Sort by total engagement
    authors.sort((a, b) => b.totalEngagement - a.totalEngagement);

    return { authors };
  } catch (error) {
    console.error("Unexpected error getting author analytics:", error);
    return { authors: [] };
  }
}