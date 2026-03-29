import Link from "next/link";
import { Plus } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { TeamCard } from "@/components/teams/team-card";

const mockTeams = [
  {
    name: "Platform Engineering",
    slug: "platform-engineering",
    description:
      "Core infrastructure team building internal developer tools and managing cloud resources.",
    memberCount: 12,
    totalClaudeSpend: 4_820,
    totalCodexTasks: 347,
  },
  {
    name: "Frontend Guild",
    slug: "frontend-guild",
    description:
      "Cross-functional group focused on UI/UX consistency, design systems, and frontend performance.",
    memberCount: 8,
    totalClaudeSpend: 2_150,
    totalCodexTasks: 218,
  },
  {
    name: "Data Science",
    slug: "data-science",
    description:
      "ML and analytics team working on recommendation engines, forecasting, and data pipelines.",
    memberCount: 6,
    totalClaudeSpend: 6_430,
    totalCodexTasks: 92,
  },
  {
    name: "Mobile Squad",
    slug: "mobile-squad",
    description:
      "iOS and Android development team shipping the consumer mobile application.",
    memberCount: 9,
    totalClaudeSpend: 1_890,
    totalCodexTasks: 156,
  },
  {
    name: "Security & Compliance",
    slug: "security-compliance",
    description:
      "Responsible for vulnerability assessments, penetration testing, and regulatory compliance.",
    memberCount: 5,
    totalClaudeSpend: 980,
    totalCodexTasks: 64,
  },
  {
    name: "DevOps & SRE",
    slug: "devops-sre",
    description:
      "Site reliability and operations team ensuring uptime, monitoring, and incident response.",
    memberCount: 7,
    totalClaudeSpend: 3_210,
    totalCodexTasks: 283,
  },
];

// Mock current user role
const currentUserRole = "ADMIN" as const;

export default function TeamsPage() {
  const canCreateTeam =
    currentUserRole === "ADMIN" || currentUserRole === "OWNER";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
              Teams
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage your organization&rsquo;s teams and track their AI usage.
            </p>
          </div>

          {canCreateTeam && (
            <Link
              href="/teams/create"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              Create Team
            </Link>
          )}
        </div>

        {/* Teams Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mockTeams.map((team) => (
            <TeamCard key={team.slug} {...team} />
          ))}
        </div>
      </main>
    </div>
  );
}
