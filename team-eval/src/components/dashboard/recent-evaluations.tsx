import { ClipboardCheck } from "lucide-react";

interface Evaluation {
  id: string;
  memberName: string;
  score: number;
  date: string;
  status: "completed" | "pending" | "in_review";
}

const mockEvaluations: Evaluation[] = [
  { id: "1", memberName: "Alice Chen", score: 92, date: "2026-03-20", status: "completed" },
  { id: "2", memberName: "Bob Martinez", score: 85, date: "2026-03-19", status: "completed" },
  { id: "3", memberName: "Carol Kim", score: 78, date: "2026-03-18", status: "in_review" },
  { id: "4", memberName: "David Patel", score: 88, date: "2026-03-17", status: "completed" },
  { id: "5", memberName: "Eva Johansson", score: 0, date: "2026-03-16", status: "pending" },
];

function getStatusBadge(status: Evaluation["status"]) {
  const styles: Record<Evaluation["status"], string> = {
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    pending: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
    in_review: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  };
  const labels: Record<Evaluation["status"], string> = {
    completed: "Completed",
    pending: "Pending",
    in_review: "In Review",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 75) return "text-amber-400";
  if (score > 0) return "text-red-400";
  return "text-zinc-600";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RecentEvaluations() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-zinc-50">Recent Evaluations</h3>
      </div>
      <div className="space-y-1">
        {mockEvaluations.map((evaluation) => (
          <div
            key={evaluation.id}
            className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-zinc-800/30"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {evaluation.memberName}
              </p>
              <p className="text-xs text-zinc-500">{formatDate(evaluation.date)}</p>
            </div>
            <div className="flex items-center gap-4">
              {evaluation.status !== "pending" && (
                <span className={`text-lg font-bold font-mono ${getScoreColor(evaluation.score)}`}>
                  {evaluation.score}
                </span>
              )}
              {getStatusBadge(evaluation.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
