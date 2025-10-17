'use client';

import { useState, useEffect } from 'react';
import {
  fetchAllTweets,
  fetchTweetsWithPagination,
  fetchTweetsBySentiment,
  fetchTweetsByRegion,
  fetchTweetsByLanguage,
  getAnalyticsSummary,
  getKeywordsCloud,
  getHashtags,
  getDrivingNarratives,
  searchTweets,
  SupabaseTweet,
} from '@/lib/tweet-service';

interface UseAllTweetsReturn {
  tweets: SupabaseTweet[];
  loading: boolean;
  error: string | null;
}

interface UsePaginatedTweetsReturn extends UseAllTweetsReturn {
  total: number;
  page: number;
  setPage: (page: number) => void;
}

interface UseAnalyticsSummaryReturn {
  analytics: any;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch all tweets
 */
export function useAllTweets(): UseAllTweetsReturn {
  const [tweets, setTweets] = useState<SupabaseTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTweets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllTweets();
        setTweets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
      } finally {
        setLoading(false);
      }
    };

    loadTweets();
  }, []);

  return { tweets, loading, error };
}

/**
 * Hook to fetch tweets with pagination
 */
export function usePaginatedTweets(
  limit: number = 50
): UsePaginatedTweetsReturn {
  const [tweets, setTweets] = useState<SupabaseTweet[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTweets = async () => {
      try {
        setLoading(true);
        setError(null);
        const { tweets: data, total: count } = await fetchTweetsWithPagination(
          page,
          limit
        );
        setTweets(data);
        setTotal(count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
      } finally {
        setLoading(false);
      }
    };

    loadTweets();
  }, [page, limit]);

  return { tweets, total, page, setPage, loading, error };
}

/**
 * Hook to fetch tweets by sentiment
 */
export function useTweetsBySentiment(sentiment: string): UseAllTweetsReturn {
  const [tweets, setTweets] = useState<SupabaseTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sentiment) {
      setTweets([]);
      setLoading(false);
      return;
    }

    const loadTweets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTweetsBySentiment(sentiment);
        setTweets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
      } finally {
        setLoading(false);
      }
    };

    loadTweets();
  }, [sentiment]);

  return { tweets, loading, error };
}

/**
 * Hook to fetch tweets by region
 */
export function useTweetsByRegion(region: string): UseAllTweetsReturn {
  const [tweets, setTweets] = useState<SupabaseTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!region) {
      setTweets([]);
      setLoading(false);
      return;
    }

    const loadTweets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTweetsByRegion(region);
        setTweets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
      } finally {
        setLoading(false);
      }
    };

    loadTweets();
  }, [region]);

  return { tweets, loading, error };
}

/**
 * Hook to fetch tweets by language
 */
export function useTweetsByLanguage(language: string): UseAllTweetsReturn {
  const [tweets, setTweets] = useState<SupabaseTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!language) {
      setTweets([]);
      setLoading(false);
      return;
    }

    const loadTweets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTweetsByLanguage(language);
        setTweets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
      } finally {
        setLoading(false);
      }
    };

    loadTweets();
  }, [language]);

  return { tweets, loading, error };
}

/**
 * Hook to get analytics summary
 */
export function useAnalyticsSummary(): UseAnalyticsSummaryReturn {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAnalyticsSummary();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return { analytics, loading, error };
}

/**
 * Hook to get keywords cloud
 */
export function useKeywordsCloud(): {
  keywords: Record<string, number>;
  loading: boolean;
  error: string | null;
} {
  const [keywords, setKeywords] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadKeywords = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getKeywordsCloud();
        setKeywords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch keywords');
      } finally {
        setLoading(false);
      }
    };

    loadKeywords();
  }, []);

  return { keywords, loading, error };
}

/**
 * Hook to get hashtags
 */
export function useHashtags(): {
  hashtags: Record<string, number>;
  loading: boolean;
  error: string | null;
} {
  const [hashtags, setHashtags] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHashtags = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getHashtags();
        setHashtags(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch hashtags');
      } finally {
        setLoading(false);
      }
    };

    loadHashtags();
  }, []);

  return { hashtags, loading, error };
}

/**
 * Hook to get driving narratives
 */
export function useDrivingNarratives(): UseAllTweetsReturn {
  const [tweets, setTweets] = useState<SupabaseTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNarratives = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDrivingNarratives();
        setTweets(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch narratives'
        );
      } finally {
        setLoading(false);
      }
    };

    loadNarratives();
  }, []);

  return { tweets, loading, error };
}

/**
 * Hook to search tweets
 */
export function useSearchTweets(query: string): UseAllTweetsReturn {
  const [tweets, setTweets] = useState<SupabaseTweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setTweets([]);
      setLoading(false);
      return;
    }

    const loadResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await searchTweets(query);
        setTweets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search tweets');
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to avoid too many queries
    const timeoutId = setTimeout(loadResults, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return { tweets, loading, error };
}
