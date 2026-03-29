import Link from "next/link";
import {
  Brain,
  Code2,
  Star,
  Activity,
  UserPlus,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

interface Member {
  id: string;
  name: string;
  avatar: string | null;
  role: "Lead" | "Member";
  claudeSpend: number;
  codexTasks: number;
  lastActive: string;
}

interface TeamData {
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  totalClaudeSpend: number;
  totalCodexTasks: number;
  avgEvalScore: number;
  activeMembers: number;
  members: Member[];
}

const mockTeams: Record<string, TeamData> = {
  "platform-engineering": {
    name: "Platform Engineering",
    slug: "platform-engineering",
    description:
      "Core infrastructure team building internal developer tools and managing cloud resources.",
    memberCount: 12,
    totalClaudeSpend: 4_820,
    totalCodexTasks: 347,
    avgEvalScore: 4.2,
    activeMembers: 10,
    members: [
      {
        id: "1",
        name: "Sarah Chen",
        avatar: null,
        role: "Lead",
        claudeSpend: 820,
        codexTasks: 64,
        lastActive: "2 hours ago",
      },
      {
        id: "2",
        name: "Marcus Johnson",
        avatar: null,
        role: "Member",
        claudeSpend: 610,
        codexTasks: 48,
        lastActive: "5 hours ago",
      },
      {
        id: "3",
        name: "Priya Patel",
        avatar: null,
        role: "Member",
        claudeSpend: 540,
        codexTasks: 42,
        lastActive: "1 day ago",
      },
      {
        id: "4",
        name: "James Kim",
        avatar: null,
        role: "Member",
        claudeSpend: 480,
        codexTasks: 38,
        lastActive: "3 hours ago",
      },
      {
        id: "5",
        name: "Elena Rossi",
        avatar: null,
        role: "Member",
        claudeSpend: 420,
        codexTasks: 35,
        lastActive: "6 hours ago",
      },
      {
        id: "6",
        name: "David Okonkwo",
        avatar: null,
        role: "Lead",
        claudeSpend: 390,
        codexTasks: 31,
        lastActive: "1 hour ago",
      },
      {
        id: "7",
        name: "Amy Nguyen",
        avatar: null,
        role: "Member",
        claudeSpend: 360,
        codexTasks: 28,
        lastActive: "4 hours ago",
      },
      {
        id: "8",
        name: "Tom Brennan",
        avatar: null,
        role: "Member",
        claudeSpend: 310,
        codexTasks: 22,
        lastActive: "2 days ago",
      },
      {
        id: "9",
        name: "Lina Müller",
        avatar: null,
        role: "Member",
        claudeSpend: 290,
        codexTasks: 18,
        lastActive: "12 hours ago",
      },
      {
        id: "10",
        name: "Raj Sharma",
        avatar: null,
        role: "Member",
        claudeSpend: 250,
        codexTasks: 12,
        lastActive: "3 days ago",
      },
      {
        id: "11",
        name: "Chloe Tanaka",
        avatar: null,
        role: "Member",
        claudeSpend: 200,
        codexTasks: 6,
        lastActive: "1 week ago",
      },
      {
        id: "12",
        name: "Owen Brooks",
        avatar: null,
        role: "Member",
        claudeSpend: 150,
        codexTasks: 3,
        lastActive: "1 week ago",
      },
    ],
  },
};

// Fallback team for any slug not in the map
const defaultTeam: TeamData = {
  name: "Team",
  slug: "team",
  description: "A team in your organization.",
  memberCount: 6,
  totalClaudeSpend: 2_400,
  totalCodexTasks: 180,
  avgEvalScore: 3.8,
  activeMembers: 5,
  members: [
    {
      id: "1",
      name: "Alex Rivera",
      avatar: null,
      role: "Lead",
      claudeSpend: 680,
      codexTasks: 52,
      lastActive: "1 hour ago",
    },
    {
      id: "2",
      name: "Jordan Lee",
      avatar: null,
      role: "Member",
      claudeSpend: 520,
      codexTasks: 41,
      lastActive: "3 hours ago",
    },
    {
      id: "3",
      name: "Morgan Taylor",
      avatar: null,
      role: "Member",
      claudeSpend: 430,
      codexTasks: 33,
      lastActive: "5 hours ago",
    },
    {
      id: "4",
      name: "Casey Zhao",
      avatar: null,
      role: "Member",
      claudeSpend: 380,
      codexTasks: 28,
      lastActive: "1 day ago",
    },
    {
      id: "5",
      name: "Sam Adeyemi",
      avatar: null,
      role: "Member",
      claudeSpend: 240,
      codexTasks: 16,
      lastActive: "2 days ago",
    },
    {
      id: "6",
      name: "Drew Petrov",
      avatar: null,
      role: "Member",
      claudeSpend: 150,
      codexTasks: 10,
      lastActive: "3 days ago",
    },
  ],
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const statCards = [
  {
    label: "Claude Spend",
    key: "totalClaudeSpend" as const,
    icon: Brain,
    format: (v: number) => `$${v.toLocaleString()}`,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    label: "Codex Tasks",
    key: "totalCodexTasks" as const,
    icon: Code2,
    format: (v: number) => v.toLocaleString(),
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    label: "Avg Eval Score",
    key: "avgEvalScore" as const,
    icon: Star,
    format: (v: number) => `${v.toFixed(1)} / 5.0`,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    label: "Active Members",
    key: "activeMembers" as const,
    icon: Activity,
    format: (v: number) => v.toString(),
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = mockTeams[slug] ?? { ...defaultTeam, name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), slug };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/teams"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Link>

        {/* Team Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
              {team.name}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-500">
              {team.description}
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              {team.memberCount} members
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500">
              <UserPlus className="h-4 w-4" />
              Add Member
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100">
              <Settings className="h-4 w-4" />
              Edit Team
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const value = team[stat.key];
            return (
              <div
                key={stat.key}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg ${stat.bg} p-2.5`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-zinc-50">
                      {stat.format(value)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Members Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-zinc-50">Members</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3 text-right">Claude Spend</th>
                  <th className="px-6 py-3 text-right">Codex Tasks</th>
                  <th className="px-6 py-3 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {team.members.map((member) => (
                  <tr
                    key={member.id}
                    className="transition hover:bg-zinc-800/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-semibold text-indigo-400">
                            {getInitials(member.name)}
                          </div>
                        )}
                        <span className="text-sm font-medium text-zinc-200">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          member.role === "Lead"
                            ? "bg-indigo-500/10 text-indigo-400"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-zinc-300">
                      ${member.claudeSpend.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-zinc-300">
                      {member.codexTasks}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-zinc-500">
                      {member.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
