"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { ArrowLeft, Users, Loader2 } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreateTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (!slugManuallyEdited) {
        setSlug(slugify(value));
      }
    },
    [slugManuallyEdited],
  );

  const handleSlugChange = useCallback((value: string) => {
    setSlugManuallyEdited(true);
    setSlug(slugify(value));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to create team");
      }

      router.push("/teams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/teams"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-600/10 p-2.5">
            <Users className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-50">
              Create Team
            </h1>
            <p className="text-sm text-gray-500">
              Set up a new team to track AI usage and evaluations
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 rounded-xl border border-gray-800 bg-gray-900/40 p-6">
            {/* Team Name */}
            <div>
              <label
                htmlFor="team-name"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Team Name
              </label>
              <input
                id="team-name"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Platform Engineering"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="team-slug"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Slug
              </label>
              <div className="flex items-center rounded-lg border border-gray-700 bg-gray-800 transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                <span className="pl-4 text-sm text-gray-500">/teams/</span>
                <input
                  id="team-slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="platform-engineering"
                  className="w-full bg-transparent px-1 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Auto-generated from the team name. You can edit it manually.
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="team-description"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Description
              </label>
              <textarea
                id="team-description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this team does..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/teams"
                className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !name.trim() || !slug.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Creating..." : "Create Team"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
