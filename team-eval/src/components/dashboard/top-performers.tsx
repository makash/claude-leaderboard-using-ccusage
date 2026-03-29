import { Trophy } from "lucide-react";

const mockPerformers = [
  { rank: 1, name: "Alice Chen", cost: 2847.50, tokens: 14_250_000 },
  { rank: 2, name: "Bob Martinez", cost: 2134.20, tokens: 10_670_000 },
  { rank: 3, name: "Carol Kim", cost: 1892.75, tokens: 9_460_000 },
  { rank: 4, name: "David Patel", cost: 1456.30, tokens: 7_280_000 },
  { rank: 5, name: "Eva Johansson", cost: 1201.90, tokens: 6_010_000 },
];

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toString();
}

function getRankBadge(rank: number) {
  const colors: Record<number, string> = {
    1: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    2: "bg-zinc-400/20 text-zinc-300 border-zinc-400/30",
    3: "bg-amber-600/20 text-amber-500 border-amber-600/30",
  };
  return colors[rank] || "bg-zinc-800 text-zinc-400 border-zinc-700";
}

export function TopPerformers() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-zinc-50">Top Performers</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Rank
              </th>
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Name
              </th>
              <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                Cost
              </th>
              <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                Tokens
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {mockPerformers.map((performer) => (
              <tr key={performer.rank} className="group hover:bg-zinc-800/30">
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${getRankBadge(performer.rank)}`}
                  >
                    {performer.rank}
                  </span>
                </td>
                <td className="py-3 text-sm font-medium text-zinc-200">
                  {performer.name}
                </td>
                <td className="py-3 text-right text-sm font-mono text-zinc-300">
                  ${performer.cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 text-right text-sm font-mono text-zinc-400">
                  {formatTokens(performer.tokens)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
