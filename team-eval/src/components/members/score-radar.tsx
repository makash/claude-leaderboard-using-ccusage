"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface Dimension {
  dimension: string;
  score: number;
  orgAverage: number;
}

interface ScoreRadarProps {
  data?: Dimension[];
}

const defaultData: Dimension[] = [
  { dimension: "Code Quality", score: 88, orgAverage: 72 },
  { dimension: "Prompt Craft", score: 92, orgAverage: 68 },
  { dimension: "Efficiency", score: 76, orgAverage: 70 },
  { dimension: "Collaboration", score: 84, orgAverage: 75 },
  { dimension: "Innovation", score: 90, orgAverage: 65 },
  { dimension: "Output Volume", score: 78, orgAverage: 71 },
];

export function ScoreRadar({ data }: ScoreRadarProps) {
  const chartData = data ?? defaultData;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-50">
          Evaluation Dimensions
        </h3>
        <p className="text-sm text-zinc-500">
          Performance scores vs. organization average
        </p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#3f3f46" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "#52525b", fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name="Member"
              dataKey="score"
              stroke="#818cf8"
              fill="#818cf8"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Radar
              name="Org Average"
              dataKey="orgAverage"
              stroke="#52525b"
              fill="#52525b"
              fillOpacity={0.1}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#fafafa",
                fontSize: "13px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
              iconType="circle"
              iconSize={8}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
