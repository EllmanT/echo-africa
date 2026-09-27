"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartSpec } from "@/data/case-studies";

const COLORS = { purple: "#7C3AED", tint: "#CBACF9", ink: "#1a1b25" } as const;

const compact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toLocaleString("en", { maximumFractionDigits: 1 })}k` : String(n);

const ResultsChart = ({ chart }: { chart: ChartSpec }) => {
  const showLegend = chart.series.length > 1;

  return (
    <figure className="w-full">
      <figcaption>
        <h3 className="font-display text-xl font-bold tracking-tight md:text-2xl">{chart.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{chart.caption}</p>
      </figcaption>

      <div className="mt-6 h-64 w-full md:h-72" role="img" aria-label={`${chart.title}. ${chart.caption}.`}>
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "line" ? (
            <LineChart data={chart.points} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#5c6070", fontSize: 13 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#5c6070", fontSize: 13 }} tickFormatter={compact} width={48} />
              <Tooltip
                cursor={{ stroke: "rgba(0,0,0,0.1)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 24px rgba(20,20,40,0.08)" }}
                formatter={(v: number) => v.toLocaleString("en")}
              />
              {showLegend && <Legend iconType="circle" />}
              {chart.series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={COLORS[s.color]}
                  strokeWidth={3}
                  dot={{ r: 5, fill: COLORS[s.color], strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                  isAnimationActive
                  animationDuration={900}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={chart.points} margin={{ top: 8, right: 12, bottom: 0, left: -8 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#5c6070", fontSize: 13 }} interval={0} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#5c6070", fontSize: 13 }} tickFormatter={compact} width={48} />
              <Tooltip
                cursor={{ fill: "rgba(124,58,237,0.06)" }}
                contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 24px rgba(20,20,40,0.08)" }}
                formatter={(v: number) => v.toLocaleString("en")}
              />
              {showLegend && <Legend iconType="circle" />}
              {chart.series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  fill={COLORS[s.color]}
                  radius={[8, 8, 0, 0]}
                  isAnimationActive
                  animationDuration={900}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>{chart.title}</caption>
        <thead>
          <tr>
            <th>Period</th>
            {chart.series.map((s) => (
              <th key={s.key}>{s.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.points.map((p) => (
            <tr key={p.label}>
              <td>{p.label}</td>
              {chart.series.map((s) => (
                <td key={s.key}>{p[s.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};

export default ResultsChart;
