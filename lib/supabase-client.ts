import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Export types for database schema
export type Database = {
  public: {
    Tables: {
      tweets: {
        Row: {
          id: number;
          date: string;
          author_name: string;
          handle: string;
          text: string;
          keywords: string | null;
          region: string | null;
          language: string | null;
          engagement: number | null;
          likes: number | null;
          replies: number | null;
          reposts: number | null;
          sentiment: string | null;
          created_at: string;
          narrative_id: number | null;
          is_driving: boolean | null;
          narrative_tag: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["tweets"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["tweets"]["Insert"]>;
      };
    };
  };
};
