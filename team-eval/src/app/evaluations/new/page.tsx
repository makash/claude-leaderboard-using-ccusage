"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import {
  ArrowLeft,
  ClipboardCheck,
  Save,
  Send,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock members for the dropdown                                      */
/* ------------------------------------------------------------------ */

const teamMembers = [
  { id: "1", name: "Sarah Chen" },
  { id: "2", name: "Alex Rivera" },
  { id: "3", name: "Mika Tanaka" },
  { id: "4", name: "Liam Patel" },
  { id: "5", name: "Emma Wilson" },
  { id: "6", name: "Noah Brooks" },
];

/* ------------------------------------------------------------------ */
/*  Score range input                                                  */
/* ------------------------------------------------------------------ */

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  function scoreColor(v: number): string {
    if (v >= 8) return "accent-emerald-500";
    if (v >= 6) return "accent-amber-400";
    if (v >= 4) return "accent-orange-400";
    return "accent-red-400";
  }

  function scoreBadgeColor(v: number): string {
    if (v >= 8) return "bg-emerald-950/60 text-emerald-400 border-emerald-800/40";
    if (v >= 6) return "bg-amber-950/60 text-amber-400 border-amber-800/40";
    if (v >= 4) return "bg-orange-950/60 text-orange-400 border-orange-800/40";
    return "bg-red-950/60 text-red-400 border-red-800/40";
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span
          className={`inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-sm font-bold tabular-nums ${scoreBadgeColor(value)}`}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-lg bg-gray-700 cursor-pointer ${scoreColor(value)}`}
      />
      <div className="mt-1 flex justify-between text-xs text-gray-600">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function NewEvaluationPage() {
  const router = useRouter();

  const [memberId, setMemberId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const [claudeProficiency, setClaudeProficiency] = useState(5);
  const [codexProficiency, setCodexProficiency] = useState(5);
  const [productivity, setProductivity] = useState(5);
  const [quality, setQuality] = useState(5);
  const [overall, setOverall] = useState(5);

  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(isDraft: boolean) {
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          periodStart,
          periodEnd,
          scores: {
            claudeProficiency,
            codexProficiency,
            productivity,
            quality,
            overall,
          },
          strengths,
          improvements,
          notes,
          status: isDraft ? "Draft" : "Submitted",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to save evaluation");
      }

      router.push("/evaluations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const isValid = memberId && periodStart && periodEnd;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/evaluations"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Evaluations
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-600/10 p-2.5">
            <ClipboardCheck className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-50">
              New Evaluation
            </h1>
            <p className="text-sm text-gray-500">
              Evaluate a team member&apos;s AI proficiency and performance
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Member & Period */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Evaluation Target
            </h2>

            {/* Member */}
            <div>
              <label
                htmlFor="member"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Team Member
              </label>
              <select
                id="member"
                required
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-100 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select a member...</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Period */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="period-start"
                  className="mb-1.5 block text-sm font-medium text-gray-300"
                >
                  Period Start
                </label>
                <input
                  id="period-start"
                  type="date"
                  required
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-100 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="period-end"
                  className="mb-1.5 block text-sm font-medium text-gray-300"
                >
                  Period End
                </label>
                <input
                  id="period-end"
                  type="date"
                  required
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-100 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Scores */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Scores
            </h2>

            <ScoreInput
              label="Claude Proficiency"
              value={claudeProficiency}
              onChange={setClaudeProficiency}
            />
            <ScoreInput
              label="Codex Proficiency"
              value={codexProficiency}
              onChange={setCodexProficiency}
            />
            <ScoreInput
              label="Productivity"
              value={productivity}
              onChange={setProductivity}
            />
            <ScoreInput
              label="Quality"
              value={quality}
              onChange={setQuality}
            />
            <ScoreInput
              label="Overall"
              value={overall}
              onChange={setOverall}
            />
          </div>

          {/* Text feedback */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Written Feedback
            </h2>

            <div>
              <label
                htmlFor="strengths"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Strengths
              </label>
              <textarea
                id="strengths"
                rows={3}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="What does this team member do well with AI tools?"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label
                htmlFor="improvements"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Areas for Improvement
              </label>
              <textarea
                id="improvements"
                rows={3}
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="Where could they improve their AI usage?"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Additional Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any other observations or context..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/evaluations"
              className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              Cancel
            </Link>
            <button
              type="button"
              disabled={submitting || !isValid}
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </button>
            <button
              type="button"
              disabled={submitting || !isValid}
              onClick={() => handleSubmit(false)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
