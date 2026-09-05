"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const PROFILE_LABELS: Record<string, string> = {
  D: "Dominância",
  I: "Influência",
  S: "Estabilidade",
  C: "Conformidade",
};
const PROFILE_COLORS: Record<string, string> = {
  D: "#E4572E",
  I: "#F2B705",
  S: "#07C97F",
  C: "#2E6BE4",
};

export function ResultCharts({
  percentageD, percentageI, percentageS, percentageC,
}: { percentageD: number; percentageI: number; percentageS: number; percentageC: number }) {
  const chartData = [
    { profile: "D", value: percentageD },
    { profile: "I", value: percentageI },
    { profile: "S", value: percentageS },
    { profile: "C", value: percentageC },
  ];
  const bars = [
    { key: "D", pct: percentageD },
    { key: "I", pct: percentageI },
    { key: "S", pct: percentageS },
    { key: "C", pct: percentageC },
  ].sort((a, b) => b.pct - a.pct);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="card flex flex-col gap-3">
        {bars.map((b) => (
          <div key={b.key}>
            <div className="flex justify-between text-sm font-medium">
              <span>{PROFILE_LABELS[b.key]}</span>
              <span>{b.pct.toFixed(0)}%</span>
            </div>
            <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-eloca-border">
              <div
                className="h-full rounded-full"
                style={{ width: `${b.pct}%`, backgroundColor: PROFILE_COLORS[b.key] }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="card h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="profile" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar dataKey="value" stroke="#07C97F" fill="#07C97F" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
