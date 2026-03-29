"use client";

import { useState, useMemo } from "react";

interface DayData {
  date: string;
  cost: number;
}

interface UsageHeatmapProps {
  data?: DayData[];
  weeks?: number;
}

function generateMockData(weeks: number): DayData[] {
  const days: DayData[] = [];
  const today = new Date();
  const totalDays = weeks * 7;

  for (let i = totalDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseCost = isWeekend ? 2 : 12;
    const variance = isWeekend ? 5 : 25;
    const cost =
      Math.random() > 0.15
        ? Math.round((Math.random() * variance + baseCost) * 100) / 100
        : 0;
    days.push({
      date: date.toISOString().split("T")[0],
      cost,
    });
  }
  return days;
}

function getCellColor(cost: number, max: number): string {
  if (cost === 0) return "bg-zinc-800/60";
  const ratio = cost / max;
  if (ratio < 0.25) return "bg-indigo-900/70";
  if (ratio < 0.5) return "bg-indigo-700/80";
  if (ratio < 0.75) return "bg-indigo-500";
  return "bg-indigo-400";
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAY_LABELS = ["Mon", "Wed", "Fri"];

export function UsageHeatmap({ data, weeks = 20 }: UsageHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    date: string;
    cost: number;
  } | null>(null);

  const days = useMemo(() => data ?? generateMockData(weeks), [data, weeks]);

  const maxCost = useMemo(
    () => Math.max(...days.map((d) => d.cost), 1),
    [days]
  );

  // Organize into columns (weeks). Each column = 7 rows (Sun-Sat).
  const columns = useMemo(() => {
    const cols: DayData[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      cols.push(days.slice(i, i + 7));
    }
    return cols;
  }, [days]);

  // Month labels positioned at the first week of each month
  const monthPositions = useMemo(() => {
    const positions: { label: string; col: number }[] = [];
    let lastMonth = -1;
    columns.forEach((week, colIdx) => {
      const firstDay = new Date(week[0].date);
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        positions.push({ label: MONTH_LABELS[month], col: colIdx });
        lastMonth = month;
      }
    });
    return positions;
  }, [columns]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">
            Usage Activity
          </h3>
          <p className="text-sm text-zinc-500">
            Daily Claude spend over the last {weeks} weeks
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span>Less</span>
          <div className="h-3 w-3 rounded-sm bg-zinc-800/60" />
          <div className="h-3 w-3 rounded-sm bg-indigo-900/70" />
          <div className="h-3 w-3 rounded-sm bg-indigo-700/80" />
          <div className="h-3 w-3 rounded-sm bg-indigo-500" />
          <div className="h-3 w-3 rounded-sm bg-indigo-400" />
          <span>More</span>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        {/* Month labels */}
        <div className="flex pl-10 mb-1">
          {monthPositions.map((mp, i) => (
            <span
              key={i}
              className="text-[10px] text-zinc-500 absolute"
              style={{ left: `${mp.col * 16 + 40}px` }}
            >
              {mp.label}
            </span>
          ))}
        </div>

        <div className="flex gap-0 mt-5">
          {/* Day labels column */}
          <div className="flex flex-col gap-[3px] pr-2 pt-0">
            {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
              <div
                key={dayIdx}
                className="h-[13px] flex items-center justify-end"
              >
                <span className="text-[10px] text-zinc-500 leading-none">
                  {dayIdx === 1
                    ? DAY_LABELS[0]
                    : dayIdx === 3
                    ? DAY_LABELS[1]
                    : dayIdx === 5
                    ? DAY_LABELS[2]
                    : ""}
                </span>
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {columns.map((week, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-[3px]">
              {week.map((day, rowIdx) => (
                <div
                  key={day.date}
                  className={`h-[13px] w-[13px] rounded-sm ${getCellColor(
                    day.cost,
                    maxCost
                  )} cursor-pointer transition-all hover:ring-1 hover:ring-zinc-400`}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const container =
                      e.currentTarget.closest(".relative")!.getBoundingClientRect();
                    setTooltip({
                      x: rect.left - container.left + rect.width / 2,
                      y: rect.top - container.top - 8,
                      date: day.date,
                      cost: day.cost,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs shadow-lg"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <p className="font-medium text-zinc-200">
              ${tooltip.cost.toFixed(2)}
            </p>
            <p className="text-zinc-400">
              {new Date(tooltip.date + "T00:00:00").toLocaleDateString(
                "en-US",
                {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
