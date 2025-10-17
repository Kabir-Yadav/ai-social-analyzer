"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Hash } from "lucide-react";

interface HashtagData {
  tag: string;
  count: number;
}

interface HashtagChartProps {
  data?: HashtagData[];
  className?: string;
}

const defaultData: HashtagData[] = [
  { tag: "#AI", count: 324 },
  { tag: "#Technology", count: 280 },
  { tag: "#Innovation", count: 250 },
  { tag: "#Future", count: 220 },
  { tag: "#Digital", count: 190 },
].sort((a, b) => b.count - a.count);

export default function HashtagChart({
  data = defaultData,
  className = "",
}: HashtagChartProps) {
  return (
    <div
      className={`border border-slate-200 shadow-sm bg-white rounded-lg p-6 h-[450px] ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Hash className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Top Hashtags</h3>
          <p className="text-sm text-slate-500">Most trending hashtags</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, bottom: 70 }}>
          <XAxis
            dataKey="tag"
            stroke="#64748b"
            tick={{ fill: "#475569", fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              color: "#1e293b",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
