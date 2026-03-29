import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000) return `${(tokens / 1_000_000_000).toFixed(2)}B`;
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toString();
}

export function getTitle(cost: number): { name: string; color: string; emoji: string } {
  if (cost >= 1000) return { name: "AI Architect", color: "text-amber-400", emoji: "👑" };
  if (cost >= 500) return { name: "Power User", color: "text-purple-400", emoji: "⚡" };
  if (cost >= 100) return { name: "Heavy Hitter", color: "text-cyan-400", emoji: "🎯" };
  if (cost >= 25) return { name: "Active User", color: "text-green-400", emoji: "🚀" };
  return { name: "Getting Started", color: "text-gray-400", emoji: "🌱" };
}

export function getCacheRate(cacheRead: number, total: number): number {
  if (total === 0) return 0;
  return (cacheRead / total) * 100;
}

export function getOutputPerDollar(output: number, cost: number): number {
  if (cost === 0) return 0;
  return output / cost;
}

export function getDateRange(period: "day" | "week" | "month" | "quarter"): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case "day": start.setDate(end.getDate() - 1); break;
    case "week": start.setDate(end.getDate() - 7); break;
    case "month": start.setMonth(end.getMonth() - 1); break;
    case "quarter": start.setMonth(end.getMonth() - 3); break;
  }
  return { start, end };
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-500";
  if (score >= 6) return "text-yellow-500";
  if (score >= 4) return "text-orange-500";
  return "text-red-500";
}

export function getScoreLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 7) return "Strong";
  if (score >= 5) return "Adequate";
  if (score >= 3) return "Developing";
  return "Needs Improvement";
}
