import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import {
  ArrowLeft,
  ClipboardCheck,
  FileText,
  Send,
  CheckCircle2,
  User,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & mock data                                                  */
/* ------------------------------------------------------------------ */

interface EvaluationDetail {
  id: string;
  memberName: string;
  memberRole: string;
  period: { start: string; end: string };
  scores: {
    claudeProficiency: number;
    codexProficiency: number;
    productivity: number;
    quality: number;
    overall: number;
  };
  strengths: string;
  improvements: string;
  notes: string;
  status: "Draft" | "Submitted" | "Acknowledged";
  createdAt: string;
  evaluatorName: string;
}

const EVALUATIONS: Record<string, EvaluationDetail> = {
  "eval-1": {
    id: "eval-1",
    memberName: "Sarah Chen",
    memberRole: "Senior Engineer",
    period: { start: "2026-02-01", end: "2026-02-28" },
    scores: {
      claudeProficiency: 9,
      codexProficiency: 7,
      productivity: 8,
      quality: 9,
      overall: 8,
    },
    strengths:
      "Excellent prompt engineering skills. Consistently writes precise, well-structured prompts that minimize token usage while maximizing output quality. Strong ability to leverage Claude for complex code refactoring and architectural decisions.",
    improvements:
      "Could explore Codex more for automated testing workflows. Sometimes over-relies on Claude for tasks that could be handled with simpler tooling.",
    notes:
      "Sarah has been mentoring junior team members on effective AI usage patterns. Her documentation of prompt templates has been widely adopted across the team.",
    status: "Submitted",
    createdAt: "2026-03-15",
    evaluatorName: "James Rodriguez",
  },
  "eval-2": {
    id: "eval-2",
    memberName: "James Rodriguez",
    memberRole: "Tech Lead",
    period: { start: "2026-02-01", end: "2026-02-28" },
    scores: {
      claudeProficiency: 7,
      codexProficiency: 8,
      productivity: 7,
      quality: 6,
      overall: 7,
    },
    strengths:
      "Strong Codex integration for CI/CD pipelines. Has automated several repetitive deployment tasks using Codex, improving team velocity significantly.",
    improvements:
      "Prompt quality could be improved for Claude interactions. Tends to use overly broad prompts that result in higher token consumption and less focused responses.",
    notes:
      "James has shown great improvement over the past quarter, particularly in using AI for code review assistance.",
    status: "Acknowledged",
    createdAt: "2026-03-10",
    evaluatorName: "Sarah Chen",
  },
  "eval-4": {
    id: "eval-4",
    memberName: "Liam Patel",
    memberRole: "Staff Engineer",
    period: { start: "2026-02-01", end: "2026-02-28" },
    scores: {
      claudeProficiency: 9,
      codexProficiency: 9,
      productivity: 10,
      quality: 8,
      overall: 9,
    },
    strengths:
      "Outstanding across the board. Liam has developed internal tooling that wraps Claude and Codex APIs for the entire organization. His productivity metrics are the highest on the team.",
    improvements:
      "Quality scores could improve with more thorough review of AI-generated code before committing. A few minor bugs in production were traced to unreviewed AI output.",
    notes:
      "Liam is a strong candidate for the AI Champion award this quarter. His contributions to the shared prompt library are invaluable.",
    status: "Acknowledged",
    createdAt: "2026-03-14",
    evaluatorName: "Current User",
  },
  "eval-5": {
    id: "eval-5",
    memberName: "Emma Wilson",
    memberRole: "Junior Engineer",
    period: { start: "2026-02-01", end: "2026-02-28" },
    scores: {
      claudeProficiency: 5,
      codexProficiency: 4,
      productivity: 6,
      quality: 5,
      overall: 5,
    },
    strengths:
      "Enthusiastic learner who has rapidly improved AI usage since joining the team. Good instinct for knowing when to use AI vs. manual approaches.",
    improvements:
      "Needs more practice with advanced prompt engineering techniques. Codex usage is still basic and could benefit from pairing sessions with senior members.",
    notes:
      "Recommend pairing Emma with Liam or Sarah for a mentorship track focused on AI-assisted development workflows.",
    status: "Draft",
    createdAt: "2026-03-18",
    evaluatorName: "Current User",
  },
};

function getEvaluation(id: string): EvaluationDetail {
  return EVALUATIONS[id] ?? EVALUATIONS["eval-1"];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreBarColor(score: number): string {
  if (score >= 8) return "bg-emerald-500";
  if (score >= 6) return "bg-amber-400";
  if (score >= 4) return "bg-orange-400";
  return "bg-red-500";
}

function scoreBarTrack(score: number): string {
  if (score >= 8) return "bg-emerald-950/40";
  if (score >= 6) return "bg-amber-950/40";
  if (score >= 4) return "bg-orange-950/40";
  return "bg-red-950/40";
}

function scoreTextColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-amber-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

function statusBadge(status: EvaluationDetail["status"]) {
  const map = {
    Draft: {
      classes: "bg-amber-950/70 text-amber-300 border-amber-800/50",
      icon: FileText,
    },
    Submitted: {
      classes: "bg-blue-950/70 text-blue-300 border-blue-800/50",
      icon: Send,
    },
    Acknowledged: {
      classes: "bg-emerald-950/70 text-emerald-300 border-emerald-800/50",
      icon: CheckCircle2,
    },
  } as const;
  const cfg = map[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cfg.classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Score bar component                                                */
/* ------------------------------------------------------------------ */

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 10) * 100;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span
          className={`text-sm font-bold tabular-nums ${scoreTextColor(score)}`}
        >
          {score}/10
        </span>
      </div>
      <div className={`h-2.5 w-full rounded-full ${scoreBarTrack(score)}`}>
        <div
          className={`h-2.5 rounded-full transition-all ${scoreBarColor(score)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evaluation = getEvaluation(id);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/evaluations"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Evaluations
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-600/10 p-2.5">
              <ClipboardCheck className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-50">
                Evaluation Detail
              </h1>
              <p className="text-sm text-gray-500">
                {evaluation.period.start} &mdash; {evaluation.period.end}
              </p>
            </div>
          </div>
          {statusBadge(evaluation.status)}
        </div>

        <div className="space-y-6">
          {/* Member info card */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-lg font-bold text-indigo-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-100">
                  {evaluation.memberName}
                </h2>
                <p className="text-sm text-gray-400">
                  {evaluation.memberRole}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
              <span>
                <span className="text-gray-500">Evaluator:</span>{" "}
                {evaluation.evaluatorName}
              </span>
              <span>
                <span className="text-gray-500">Date:</span>{" "}
                {evaluation.createdAt}
              </span>
            </div>
          </div>

          {/* Scores */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Performance Scores
            </h2>
            <div className="space-y-5">
              <ScoreBar
                label="Claude Proficiency"
                score={evaluation.scores.claudeProficiency}
              />
              <ScoreBar
                label="Codex Proficiency"
                score={evaluation.scores.codexProficiency}
              />
              <ScoreBar
                label="Productivity"
                score={evaluation.scores.productivity}
              />
              <ScoreBar label="Quality" score={evaluation.scores.quality} />
              <ScoreBar label="Overall" score={evaluation.scores.overall} />
            </div>
          </div>

          {/* Strengths */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Strengths
            </h2>
            <p className="text-sm leading-relaxed text-gray-300">
              {evaluation.strengths}
            </p>
          </div>

          {/* Areas for Improvement */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Areas for Improvement
            </h2>
            <p className="text-sm leading-relaxed text-gray-300">
              {evaluation.improvements}
            </p>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Additional Notes
            </h2>
            <p className="text-sm leading-relaxed text-gray-300">
              {evaluation.notes}
            </p>
          </div>

          {/* Back action */}
          <div className="flex justify-end">
            <Link
              href="/evaluations"
              className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              Back to Evaluations
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
