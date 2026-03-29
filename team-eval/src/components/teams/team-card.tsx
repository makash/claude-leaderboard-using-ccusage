import Link from "next/link";
import { Users, Brain, Code2 } from "lucide-react";

interface TeamCardProps {
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  totalClaudeSpend: number;
  totalCodexTasks: number;
}

export function TeamCard({
  name,
  slug,
  description,
  memberCount,
  totalClaudeSpend,
  totalCodexTasks,
}: TeamCardProps) {
  return (
    <Link
      href={`/teams/${slug}`}
      className="group block rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition hover:border-indigo-700/50 hover:shadow-lg hover:shadow-indigo-500/5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-zinc-50 group-hover:text-indigo-400 transition-colors">
          {name}
        </h3>
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-2.5 py-1">
          <Users className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-400">
            {memberCount}
          </span>
        </div>
      </div>

      <p className="mb-5 text-sm text-zinc-500 line-clamp-2">{description}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-zinc-800/60 px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-[11px] font-medium text-zinc-500">
              Claude Spend
            </span>
          </div>
          <p className="text-sm font-semibold text-zinc-200">
            ${totalClaudeSpend.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-zinc-800/60 px-3 py-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Code2 className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-[11px] font-medium text-zinc-500">
              Codex Tasks
            </span>
          </div>
          <p className="text-sm font-semibold text-zinc-200">
            {totalCodexTasks.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
