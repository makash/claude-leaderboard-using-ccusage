"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "flat";
    positive?: boolean; // whether the direction is good (green) or bad (red)
  };
  className?: string;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  trend,
  className = "",
}: SummaryCardProps) {
  const trendColor = trend
    ? trend.positive
      ? "text-emerald-400"
      : trend.direction === "flat"
        ? "text-zinc-400"
        : "text-red-400"
    : "";

  const TrendIcon = trend
    ? trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
        ? TrendingDown
        : Minus
    : null;

  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm ${className}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-50">
        {value}
      </p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
      )}
      {trend && TrendIcon && (
        <div className="mt-3 flex items-center gap-1.5">
          <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
          <span className={`text-xs font-medium ${trendColor}`}>
            {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
            {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-zinc-600">vs prior period</span>
        </div>
      )}
    </div>
  );
}
