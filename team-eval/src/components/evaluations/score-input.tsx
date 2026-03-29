"use client";

import { useCallback } from "react";

interface ScoreInputProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
}

function getScoreColor(score: number): string {
  if (score >= 9) return "text-emerald-400";
  if (score >= 7) return "text-blue-400";
  if (score >= 5) return "text-amber-400";
  if (score >= 3) return "text-orange-400";
  return "text-red-400";
}

function getScoreBgColor(score: number): string {
  if (score >= 9) return "bg-emerald-400";
  if (score >= 7) return "bg-blue-400";
  if (score >= 5) return "bg-amber-400";
  if (score >= 3) return "bg-orange-400";
  return "bg-red-400";
}

function getScoreLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 7) return "Strong";
  if (score >= 5) return "Adequate";
  if (score >= 3) return "Developing";
  return "Needs Improvement";
}

function getScoreTrackColor(score: number): string {
  if (score >= 9) return "from-emerald-500/30 to-emerald-400";
  if (score >= 7) return "from-blue-500/30 to-blue-400";
  if (score >= 5) return "from-amber-500/30 to-amber-400";
  if (score >= 3) return "from-orange-500/30 to-orange-400";
  return "from-red-500/30 to-red-400";
}

export function ScoreInput({ label, description, value, onChange }: ScoreInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  const handleNumberClick = useCallback(
    (num: number) => {
      onChange(num);
    },
    [onChange]
  );

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-100">{label}</h4>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className={`text-2xl font-bold tabular-nums ${getScoreColor(value)}`}>
            {value}
          </span>
          <span className="text-sm text-gray-600">/10</span>
        </div>
      </div>

      {/* Score label badge */}
      <div className="mb-3">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getScoreColor(value)} bg-gray-800`}
        >
          {getScoreLabel(value)}
        </span>
      </div>

      {/* Range slider */}
      <div className="relative mb-3">
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getScoreTrackColor(value)} transition-all duration-150`}
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
        />
      </div>

      {/* Number buttons */}
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleNumberClick(num)}
            className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${
              num === value
                ? `${getScoreBgColor(value)} text-gray-950`
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
