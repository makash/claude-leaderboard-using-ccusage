interface ScoreDisplayProps {
  label: string;
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 9) return "text-emerald-400";
  if (score >= 7) return "text-blue-400";
  if (score >= 5) return "text-amber-400";
  if (score >= 3) return "text-orange-400";
  return "text-red-400";
}

function getBarGradient(score: number): string {
  if (score >= 9) return "from-emerald-600 to-emerald-400";
  if (score >= 7) return "from-blue-600 to-blue-400";
  if (score >= 5) return "from-amber-600 to-amber-400";
  if (score >= 3) return "from-orange-600 to-orange-400";
  return "from-red-600 to-red-400";
}

function getBarGlow(score: number): string {
  if (score >= 9) return "shadow-emerald-500/20";
  if (score >= 7) return "shadow-blue-500/20";
  if (score >= 5) return "shadow-amber-500/20";
  if (score >= 3) return "shadow-orange-500/20";
  return "shadow-red-500/20";
}

function getScoreLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 7) return "Strong";
  if (score >= 5) return "Adequate";
  if (score >= 3) return "Developing";
  return "Needs Improvement";
}

const sizeMap = {
  sm: { bar: "h-1.5", text: "text-xs", gap: "gap-1.5" },
  md: { bar: "h-2.5", text: "text-sm", gap: "gap-2" },
  lg: { bar: "h-3.5", text: "text-base", gap: "gap-2.5" },
};

export function ScoreDisplay({
  label,
  score,
  maxScore = 10,
  size = "md",
  showLabel = true,
}: ScoreDisplayProps) {
  const pct = Math.min((score / maxScore) * 100, 100);
  const s = sizeMap[size];

  return (
    <div className={`flex flex-col ${s.gap}`}>
      <div className="flex items-center justify-between">
        <span className={`font-medium text-gray-300 ${s.text}`}>{label}</span>
        <div className="flex items-center gap-2">
          {showLabel && (
            <span className={`text-xs ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </span>
          )}
          <span className={`font-bold tabular-nums ${getScoreColor(score)} ${s.text}`}>
            {score}
            <span className="text-gray-600 font-normal">/{maxScore}</span>
          </span>
        </div>
      </div>
      <div className={`w-full rounded-full bg-gray-800 ${s.bar} overflow-hidden`}>
        <div
          className={`${s.bar} rounded-full bg-gradient-to-r ${getBarGradient(score)} shadow-md ${getBarGlow(score)} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
