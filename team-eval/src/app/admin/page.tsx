import Link from "next/link";
import {
  Users,
  BarChart3,
  ClipboardCheck,
  DollarSign,
  Shield,
  Upload,
  Download,
  Mail,
  ArrowLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const currentUser = { role: "OWNER" as const };

const stats = [
  { label: "Total Users", value: "48", icon: Users, change: "+5 this month" },
  { label: "Total Teams", value: "7", icon: BarChart3, change: "+1 this month" },
  {
    label: "Total Evaluations",
    value: "312",
    icon: ClipboardCheck,
    change: "+27 this week",
  },
  {
    label: "Total Usage Cost",
    value: "$4,218.34",
    icon: DollarSign,
    change: "+$612 this month",
  },
];

interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  active: boolean;
  joinedAt: string;
}

const mockUsers: OrgUser[] = [
  { id: "u1", name: "Jane Cooper", email: "jane@acme.dev", role: "OWNER", active: true, joinedAt: "2025-08-12" },
  { id: "u2", name: "Alex Johnson", email: "alex@acme.dev", role: "ADMIN", active: true, joinedAt: "2025-09-01" },
  { id: "u3", name: "Sam Rivera", email: "sam@acme.dev", role: "MEMBER", active: true, joinedAt: "2025-09-15" },
  { id: "u4", name: "Chris Lee", email: "chris@acme.dev", role: "MEMBER", active: true, joinedAt: "2025-10-03" },
  { id: "u5", name: "Taylor Kim", email: "taylor@acme.dev", role: "MEMBER", active: false, joinedAt: "2025-11-20" },
  { id: "u6", name: "Jordan Patel", email: "jordan@acme.dev", role: "VIEWER", active: true, joinedAt: "2026-01-08" },
  { id: "u7", name: "Morgan Chen", email: "morgan@acme.dev", role: "MEMBER", active: true, joinedAt: "2026-02-14" },
  { id: "u8", name: "Riley Davis", email: "riley@acme.dev", role: "MEMBER", active: true, joinedAt: "2026-03-01" },
];

const roleBadgeColor: Record<string, string> = {
  OWNER: "bg-purple-600/20 text-purple-400 border-purple-700/40",
  ADMIN: "bg-indigo-600/20 text-indigo-400 border-indigo-700/40",
  MEMBER: "bg-gray-700/40 text-gray-300 border-gray-600/40",
  VIEWER: "bg-gray-800/60 text-gray-500 border-gray-700/40",
};

/* ------------------------------------------------------------------ */
/*  Access guard (server-side)                                         */
/* ------------------------------------------------------------------ */

function isAuthorized(role: string): boolean {
  return role === "ADMIN" || role === "OWNER";
}

/* ------------------------------------------------------------------ */
/*  Page (Server Component)                                            */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  if (!isAuthorized(currentUser.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-100">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-gray-600" />
          <h1 className="mt-4 text-2xl font-bold text-gray-200">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            You need an ADMIN or OWNER role to access this page.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Link
            href="/dashboard"
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-800 hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-100">Admin Panel</h1>
            <p className="text-xs text-gray-500">
              Manage users, invitations, and organization settings
            </p>
          </div>
          <Link
            href="/admin/invites"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Mail className="h-4 w-4" />
            Manage Invites
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        {/* ---- Stats overview ---- */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-xl border border-gray-800 bg-gray-900/50 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        {s.label}
                      </p>
                      <p className="mt-1 text-3xl font-bold tracking-tight text-gray-50">
                        {s.value}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-800 p-2.5">
                      <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">{s.change}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---- User Management ---- */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              User Management
            </h2>
            <span className="text-xs text-gray-600">
              {mockUsers.length} users
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/80">
                  <th className="px-4 py-3 font-medium text-gray-400">User</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-400">
                    Joined
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-200">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleBadgeColor[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{u.joinedAt}</td>
                    <td className="px-4 py-3">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                          u.active
                            ? "border border-red-800/50 bg-red-900/20 text-red-400 hover:bg-red-900/40"
                            : "border border-emerald-800/50 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40"
                        }`}
                      >
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---- Invite Members ---- */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Invite Members
            </h2>
            <Link
              href="/admin/invites"
              className="flex items-center gap-1 text-xs text-indigo-400 transition hover:text-indigo-300"
            >
              Manage all invites
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="w-full sm:w-44">
                <label className="block text-sm font-medium text-gray-300">
                  Role
                </label>
                <select className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
                  <Mail className="h-4 w-4" />
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Bulk Actions ---- */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Bulk Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <button className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-5 text-left transition hover:border-gray-700 hover:bg-gray-800/40">
              <div className="rounded-lg bg-indigo-600/10 p-3">
                <Upload className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-200">
                  Import Users CSV
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Bulk add users from a CSV file with name, email, and role
                  columns.
                </p>
              </div>
            </button>

            <button className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-5 text-left transition hover:border-gray-700 hover:bg-gray-800/40">
              <div className="rounded-lg bg-indigo-600/10 p-3">
                <Download className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-200">
                  Export Data
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Download evaluations, usage metrics, and team data as CSV or
                  JSON.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* ---- Organization Settings ---- */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Organization Settings
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Plan management */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-600/10 p-2.5">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">
                    Plan Management
                  </p>
                  <p className="text-xs text-gray-500">
                    Current plan:{" "}
                    <span className="font-medium text-indigo-400">
                      Team Pro
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-400">
                <p>48 / 100 seats used</p>
                <div className="h-2 w-full rounded-full bg-gray-800">
                  <div
                    className="h-2 rounded-full bg-indigo-600"
                    style={{ width: "48%" }}
                  />
                </div>
              </div>
              <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700">
                Upgrade Plan
              </button>
            </div>

            {/* Billing placeholder */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-600/10 p-2.5">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">
                    Billing
                  </p>
                  <p className="text-xs text-gray-500">
                    Manage payment methods and invoices
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-dashed border-gray-700 bg-gray-800/30 p-4 text-center">
                <CreditCard className="mx-auto h-8 w-8 text-gray-600" />
                <p className="mt-2 text-sm text-gray-500">
                  Billing integration coming soon
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
