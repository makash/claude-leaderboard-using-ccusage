import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import {
  ClipboardCheck,
  Plus,
  ArrowRight,
  FileText,
  Send,
  CheckCircle2,
  Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data - replace with real DB queries                          */
/* ------------------------------------------------------------------ */

interface Evaluation {
  id: string;
  memberName: string;
  memberAvatar?: string;
  period: string;
  overallScore: number;
  status: "Draft" | "Submitted" | "Acknowledged";
  date: string;
}

const receivedEvaluations: Evaluation[] = [
  {
    id: "eval-1",
    memberName: "Sarah Chen",
    period: "Feb 2026",
    overallScore: 8.5,
    status: "Submitted",
    date: "2026-03-15",
  },
  {
    id: "eval-2",
    memberName: "James Rodriguez",
    period: "Feb 2026",
    overallScore: 7.2,
    status: "Acknowledged",
    date: "2026-03-10",
  },
  {
    id: "eval-3",
    memberName: "Maria Kim",
    period: "Jan 2026",
    overallScore: 6.0,
    status: "Submitted",
    date: "2026-02-12",
  },
];

const givenEvaluations: Evaluation[] = [
  {
    id: "eval-4",
    memberName: "Liam Patel",
    period: "Feb 2026",
    overallScore: 9.1,
    status: "Acknowledged",
    date: "2026-03-14",
  },
  {
    id: "eval-5",
    memberName: "Emma Wilson",
    period: "Feb 2026",
    overallScore: 5.4,
    status: "Draft",
    date: "2026-03-18",
  },
  {
    id: "eval-6",
    memberName: "Noah Brooks",
    period: "Jan 2026",
    overallScore: 7.8,
    status: "Submitted",
    date: "2026-02-09",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 9) return "text-emerald-400";
  if (score >= 7) return "text-blue-400";
  if (score >= 5) return "text-amber-400";
  if (score >= 3) return "text-orange-400";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 9) return "bg-emerald-950/60 border-emerald-800/40";
  if (score >= 7) return "bg-blue-950/60 border-blue-800/40";
  if (score >= 5) return "bg-amber-950/60 border-amber-800/40";
  if (score >= 3) return "bg-orange-950/60 border-orange-800/40";
  return "bg-red-950/60 border-red-800/40";
}

function statusBadge(status: Evaluation["status"]) {
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Table component                                                   */
/* ------------------------------------------------------------------ */

function EvaluationTable({
  evaluations,
  showActions,
}: {
  evaluations: Evaluation[];
  showActions?: "evaluator" | "evaluated";
}) {
  if (evaluations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Clock className="h-10 w-10 text-gray-700 mb-3" />
        <p className="text-sm text-gray-500">No evaluations yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3 font-medium">Member</th>
            <th className="px-4 py-3 font-medium">Period</th>
            <th className="px-4 py-3 font-medium text-center">Overall</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {evaluations.map((ev) => (
            <tr
              key={ev.id}
              className="group transition-colors hover:bg-gray-900/50"
            >
              {/* Member */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-400">
                    {ev.memberName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="text-sm font-medium text-gray-200">
                    {ev.memberName}
                  </span>
                </div>
              </td>

              {/* Period */}
              <td className="px-4 py-3 text-sm text-gray-400">{ev.period}</td>

              {/* Overall Score */}
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-sm font-bold tabular-nums ${scoreColor(ev.overallScore)} ${scoreBg(ev.overallScore)}`}
                >
                  {ev.overallScore.toFixed(1)}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3">{statusBadge(ev.status)}</td>

              {/* Date */}
              <td className="px-4 py-3 text-sm text-gray-500">{ev.date}</td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/evaluations/${ev.id}`}
                  className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-600/10 hover:text-indigo-300"
                >
                  View
                  <ArrowRight className="h-3 w-3" />
                </Link>
                {showActions === "evaluator" && ev.status === "Draft" && (
                  <Link
                    href={`/evaluations/${ev.id}`}
                    className="ml-1 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-600/10 hover:text-amber-300"
                  >
                    Edit
                  </Link>
                )}
                {showActions === "evaluated" && ev.status === "Submitted" && (
                  <button className="ml-1 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-600/10 hover:text-emerald-300">
                    Acknowledge
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tabs (server-side via searchParams)                               */
/* ------------------------------------------------------------------ */

export default async function EvaluationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = params.tab === "given" ? "given" : "received";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-600/10 p-2.5">
              <ClipboardCheck className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-50">
                Evaluations
              </h1>
              <p className="text-sm text-gray-500">
                Review and manage team AI proficiency evaluations
              </p>
            </div>
          </div>

          <Link
            href="/evaluations/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            New Evaluation
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-lg bg-gray-900/60 p-1 border border-gray-800 w-fit">
          <Link
            href="/evaluations?tab=received"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "received"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
            }`}
          >
            My Evaluations
          </Link>
          <Link
            href="/evaluations?tab=given"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "given"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
            }`}
          >
            Evaluations I&apos;ve Given
          </Link>
        </div>

        {/* Table */}
        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/40 overflow-hidden">
          {activeTab === "received" ? (
            <EvaluationTable
              evaluations={receivedEvaluations}
              showActions="evaluated"
            />
          ) : (
            <EvaluationTable
              evaluations={givenEvaluations}
              showActions="evaluator"
            />
          )}
        </div>
      </main>
    </div>
  );
}
