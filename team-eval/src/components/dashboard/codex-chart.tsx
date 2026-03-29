"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const mockData = [
  { week: "Week 1", completed: 42, failed: 3 },
  { week: "Week 2", completed: 58, failed: 5 },
  { week: "Week 3", completed: 35, failed: 2 },
  { week: "Week 4", completed: 67, failed: 4 },
  { week: "Week 5", completed: 49, failed: 6 },
  { week: "Week 6", completed: 72, failed: 3 },
];

export function CodexChart() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-50">Codex Performance</h3>
        <p className="text-sm text-zinc-500">Tasks completed vs failed by week</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="week"
              stroke="#52525b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#52525b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
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
            />
            <Bar
              dataKey="completed"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="Completed"
            />
            <Bar
              dataKey="failed"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              name="Failed"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
