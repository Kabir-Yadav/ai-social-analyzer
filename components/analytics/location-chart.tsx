"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MapPin } from "lucide-react";

interface LocationData {
  location: string;
  count: number;
}

interface LocationChartProps {
  data?: LocationData[];
  className?: string;
}

const defaultData: LocationData[] = [
  { location: "New York, USA", count: 245 },
  { location: "London, UK", count: 200 },
  { location: "Tokyo, Japan", count: 180 },
  { location: "Paris, France", count: 165 },
  { location: "Berlin, Germany", count: 140 },
].sort((a, b) => b.count - a.count);

export default function LocationChart({
  data = defaultData,
  className = "",
}: LocationChartProps) {
  return (
    <div
      className={`rounded-3xl border p-4 flex flex-col flex-1 min-h-0 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <MapPin className="w-5 h-5 text-orange-400" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Locations</h2>
          <p className="text-xs text-muted-foreground">Top regions</p>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 2, right: 15, left: 10, bottom: 2 }}
          >
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              tick={false}
            />
            <YAxis
              type="category"
              dataKey="location"
              width={50}
              stroke="hsl(var(--muted-foreground))"
              tick={{
                fill: "hsl(var(--foreground))",
                fontSize: 10,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "4px",
                color: "#e2e8f0",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" fill="#fb923c" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
