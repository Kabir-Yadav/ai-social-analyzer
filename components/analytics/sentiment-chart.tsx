// sentiment-chart-chartjs.tsx
"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Plugin,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Shows a Doughnut chart with:
 *  - internal % labels (only for slices large enough to contain them)
 *  - an external legend below the chart with name + value + color swatch
 *  - animations and responsive layout
 */

export interface SentimentItem {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data?: SentimentItem[];
  className?: string;
  height?: number; // px height for container (responsive)
}

const DEFAULT_DATA: SentimentItem[] = [
  { name: "Positive", value: 45, color: "#22c55e" },
  { name: "Negative", value: 25, color: "#ef4444" },
  { name: "Neutral", value: 30, color: "#3b82f6" },
];

export default function SentimentChartChartJS({
  data = DEFAULT_DATA,
  className = "",
  height = 220,
}: Props) {
  // normalize values and safety guard (avoid division by zero)
  const total = useMemo(
    () =>
      Math.max(
        1,
        data.reduce((s, d) => s + Math.max(0, d.value), 0)
      ),
    [data]
  );

  const chartData = useMemo<ChartData<"doughnut">>(() => {
    return {
      labels: data.map((d) => d.name),
      datasets: [
        {
          data: data.map((d) => d.value),
          backgroundColor: data.map((d) => d.color),
          borderColor: "rgba(255,255,255,0.06)",
          borderWidth: 2,
          // spacing between arcs to help visual separation
          spacing: 2,
        },
      ],
    };
  }, [data]);

  const options = useMemo<ChartOptions<"doughnut">>(() => {
    return {
      responsive: true,
      maintainAspectRatio: false, // we control height via container
      cutout: "62%", // inner radius — tune to create space for central label if desired
      animation: {
        duration: 800,
        easing: "easeOutQuart",
      },
      layout: {
        padding: {
          // give breathing room so labels or tooltips don't clip
          left: 6,
          right: 6,
          top: 6,
          bottom: 6,
        },
      },
      plugins: {
        legend: {
          display: false, // we use a custom legend below to avoid overlap
        },
        tooltip: {
          enabled: true,
          padding: 8,
          bodySpacing: 6,
          // white label and dark background fits dark UIs; adjust as needed
          backgroundColor: "rgba(30,41,59,0.98)",
          titleColor: "#fff",
          bodyColor: "#e6eef8",
          cornerRadius: 6,
        },
        // datalabels plugin to draw percentages inside slices when there's room
        datalabels: {
          // display only when the slice percent is sufficiently large to avoid overlap
          display: (ctx: any) => {
            // ctx will be a ChartJS context for each data item
            const value = ctx.dataset.data?.[ctx.dataIndex] as number;
            if (!value || total <= 0) return false;
            const percent = (value / total) * 100;
            // show inside label only for slices >= 6% (tweak as needed)
            return percent >= 6;
          },
          formatter: (value: any, ctx: any) => {
            const val = Number(value ?? 0);
            if (total <= 0) return "0%";
            const percent = (val / total) * 100;
            return `${Math.round(percent)}%`;
          },
          color: "#ffffff",
          font: {
            weight: "600",
            size: 12,
          },
          anchor: "center",
          align: "center",
          clamp: true, // keep label inside chart area
          // clip true ensures labels are clipped by the canvas bounds
          clip: true,
        } as any,
      },
    };
  }, [total]);

  // Extra (optional) plugin: draw a central label with total or title
  const centerTextPlugin: Plugin<"doughnut"> = {
    id: "centerText",
    afterDraw: (chart) => {
      const { ctx, chartArea } = chart;
      if (!ctx) return;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "hsl(220 14% 96%)"; // mild foreground — adapt to theme
      ctx.font = "600 14px Inter, system-ui, -apple-system, 'Segoe UI', Roboto";
      ctx.fillText(`${total}`, centerX, centerY - 8);
      ctx.font = "400 11px Inter, system-ui, -apple-system, 'Segoe UI', Roboto";
      ctx.fillStyle = "hsl(220 14% 70%)";
      ctx.fillText(`tweets`, centerX, centerY + 12);
      ctx.restore();
    },
  };

  return (
    <div
      className={`rounded-3xl border p-4 flex flex-col min-h-0 ${className}`}
      style={{ minHeight: height }}
    >
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-foreground">Sentiment</h2>
        <p className="text-xs text-muted-foreground">Analysis</p>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0">
        <div
          style={{ width: "100%", height: height - 80, position: "relative" }}
        >
          <Doughnut
            data={chartData}
            options={options}
            plugins={[centerTextPlugin]}
          />
        </div>
      </div>

      {/* Simple colored labels on top of chart */}
      <div className="w-full mt-3 flex flex-wrap justify-center gap-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-sm text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
