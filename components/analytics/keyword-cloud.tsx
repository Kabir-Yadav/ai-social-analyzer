"use client";

import { useEffect, useRef } from "react";
import { WordCloud, WordCloudProps } from "@isoterik/react-word-cloud";

interface KeywordCloudProps {
  type: "positive" | "negative";
  words?: { word: string; count: number }[];
  className?: string;
}

const defaultPositiveWords = [
  { word: "excellent", count: 64 },
  { word: "amazing", count: 55 },
  { word: "great", count: 42 },
  { word: "innovative", count: 38 },
  { word: "helpful", count: 35 },
  { word: "efficient", count: 32 },
  { word: "reliable", count: 28 },
  { word: "fantastic", count: 25 },
  { word: "impressive", count: 22 },
  { word: "outstanding", count: 20 },
  { word: "brilliant", count: 18 },
  { word: "wonderful", count: 16 },
  { word: "perfect", count: 15 },
  { word: "superb", count: 14 },
  { word: "exceptional", count: 12 },
  { word: "incredible", count: 11 },
  { word: "magnificent", count: 10 },
  { word: "remarkable", count: 9 },
  { word: "spectacular", count: 8 },
  { word: "phenomenal", count: 7 },
];

const defaultNegativeWords = [
  { word: "disappointing", count: 45 },
  { word: "slow", count: 40 },
  { word: "unreliable", count: 35 },
  { word: "poor", count: 32 },
  { word: "frustrating", count: 30 },
  { word: "difficult", count: 28 },
  { word: "expensive", count: 25 },
  { word: "confusing", count: 22 },
  { word: "inefficient", count: 20 },
  { word: "problematic", count: 18 },
  { word: "terrible", count: 16 },
  { word: "awful", count: 15 },
  { word: "horrible", count: 14 },
  { word: "useless", count: 13 },
  { word: "broken", count: 12 },
  { word: "failed", count: 11 },
  { word: "wrong", count: 10 },
  { word: "bad", count: 9 },
  { word: "worst", count: 8 },
  { word: "hate", count: 7 },
];

export default function KeywordCloud({
  type,
  words = type === "positive" ? defaultPositiveWords : defaultNegativeWords,
  className = "",
}: KeywordCloudProps) {
  const cloudRef = useRef<HTMLDivElement>(null);

  // Transform data for the word cloud
  const wordData = words.map((item) => ({
    text: item.word,
    value: item.count,
  }));

  // Color scheme based on type
  const colorScheme =
    type === "positive"
      ? ["#10b981", "#059669", "#047857", "#065f46", "#064e3b"] // Green shades
      : ["#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"]; // Red shades

  const resolveRotate: WordCloudProps["rotate"] = (word) => {
    return 0;
  };
  // Add Devanagari-capable fonts first
  const fonts: string[] = [
    "Noto Sans Devanagari",
    "Noto Serif Devanagari",
    "Mangal",
    "Arial",
    "Courier New",
    "Cursive",
  ];

  const resolveFont: WordCloudProps["font"] = (_word, index) => {
    return fonts[index % fonts.length];
  };

  const resolveFontWeight: WordCloudProps["fontWeight"] = (word) => {
    const value = word.value;

    if (value < 10) {
      return "normal";
    } else if (value < 20) {
      return "bold";
    } else {
      return "bolder";
    }
  };
  return (
    <div className={`h-64 w-full flex justify-center${className}`}>
      <WordCloud
        words={wordData}
        width={500}
        height={200}
        fontSize={(word) => Math.max(24, Math.min(40, word.value * 10))}
        font={resolveFont}
        fontWeight={resolveFontWeight}
        spiral="rectangular"
        padding={0}
        enableTooltip={true}
        rotate={resolveRotate}
      />
    </div>
  );
}
