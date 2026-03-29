"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Building2,
  Key,
  Bell,
  Save,
  Plus,
  Trash2,
  Copy,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const mockUser = {
  displayName: "Jane Cooper",
  avatarUrl: "https://i.pravatar.cc/128?u=jane",
  email: "jane.cooper@acme.dev",
  role: "OWNER" as const,
};

const mockOrg = {
  name: "Acme Corp",
  slug: "acme-corp",
  domain: "acme.dev",
  logoUrl: "https://ui-avatars.com/api/?name=Acme+Corp&background=4f46e5&color=fff",
  plan: "Team Pro",
};

interface ApiToken {
  id: string;
  name: string;
  prefix: string;
  lastUsed: string | null;
  createdAt: string;
}

const initialTokens: ApiToken[] = [
  {
    id: "tok_1",
    name: "CI Pipeline",
    prefix: "te_ci_****",
    lastUsed: "2026-03-21",
    createdAt: "2026-01-10",
  },
  {
    id: "tok_2",
    name: "Local Dev CLI",
    prefix: "te_dev_****",
    lastUsed: "2026-03-18",
    createdAt: "2026-02-05",
  },
  {
    id: "tok_3",
    name: "Staging Upload",
    prefix: "te_stg_****",
    lastUsed: null,
    createdAt: "2026-03-01",
  },
];

const notificationDefaults = {
  weeklyDigest: true,
  evaluationReminders: true,
  usageAlerts: false,
  newMemberJoined: true,
  billingAlerts: true,
};

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

const tabs = [
  { key: "profile", label: "Profile", icon: User },
  { key: "password", label: "Password", icon: Shield },
  { key: "organization", label: "Organization", icon: Building2 },
  { key: "tokens", label: "API Tokens", icon: Key },
  { key: "notifications", label: "Notifications", icon: Bell },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  /* Profile state */
  const [displayName, setDisplayName] = useState(mockUser.displayName);
  const [avatarUrl, setAvatarUrl] = useState(mockUser.avatarUrl);

  /* Org state */
  const [orgName, setOrgName] = useState(mockOrg.name);
  const [orgSlug, setOrgSlug] = useState(mockOrg.slug);
  const [orgDomain, setOrgDomain] = useState(mockOrg.domain);
  const [orgLogo, setOrgLogo] = useState(mockOrg.logoUrl);

  /* Tokens state */
  const [tokens, setTokens] = useState<ApiToken[]>(initialTokens);
  const [newTokenName, setNewTokenName] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  /* Password state */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  /* Notifications state */
  const [notifications, setNotifications] = useState(notificationDefaults);

  /* Saved feedback */
  const [saved, setSaved] = useState(false);
  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isAdmin = mockUser.role === "ADMIN" || mockUser.role === "OWNER";

  /* Token helpers */
  function handleCreateToken() {
    if (!newTokenName.trim()) return;
    const fakeSecret = `te_${newTokenName.toLowerCase().replace(/\s+/g, "_")}_${Math.random().toString(36).slice(2, 14)}`;
    const newTok: ApiToken = {
      id: `tok_${Date.now()}`,
      name: newTokenName.trim(),
      prefix: fakeSecret.slice(0, 10) + "****",
      lastUsed: null,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTokens((prev) => [...prev, newTok]);
    setNewTokenName("");
    setCreatedToken(fakeSecret);
  }

  function handleRevokeToken(id: string) {
    setTokens((prev) => prev.filter((t) => t.id !== id));
  }

  /* ---------------------------------------------------------------- */
  /*  Render helpers                                                   */
  /* ---------------------------------------------------------------- */

  function renderProfile() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">Profile</h2>
          <p className="mt-1 text-sm text-gray-400">
            Manage your personal information.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Display name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Avatar URL
            </label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              value={mockUser.email}
              readOnly
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email is managed by your identity provider and cannot be changed
              here.
            </p>
          </div>
        </div>

        {avatarUrl && (
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl}
              alt="Avatar preview"
              className="h-16 w-16 rounded-full border-2 border-gray-700 object-cover"
            />
            <span className="text-sm text-gray-400">Avatar preview</span>
          </div>
        )}

        <button
          onClick={flashSaved}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    );
  }

  async function handlePasswordChange() {
    setPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      flashSaved();
    } catch {
      setPasswordError("Network error. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  }

  function renderPassword() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">Change Password</h2>
          <p className="mt-1 text-sm text-gray-400">
            Update your password. If you were given a temporary password by your admin, change it here.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {passwordError && (
          <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {passwordError}
          </div>
        )}

        <button
          onClick={handlePasswordChange}
          disabled={passwordSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {passwordSaving ? "Updating..." : "Update Password"}
        </button>
      </div>
    );
  }

  function renderOrganization() {
    if (!isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shield className="h-12 w-12 text-gray-600" />
          <h3 className="mt-4 text-lg font-semibold text-gray-300">
            Access Restricted
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Only admins and owners can manage organization settings.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">Organization</h2>
          <p className="mt-1 text-sm text-gray-400">
            Configure your organization details.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Organization name
            </label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Slug
            </label>
            <input
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Domain
            </label>
            <input
              value={orgDomain}
              onChange={(e) => setOrgDomain(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Logo URL
            </label>
            <input
              value={orgLogo}
              onChange={(e) => setOrgLogo(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <p className="text-sm font-medium text-gray-300">Current Plan</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="inline-flex rounded-full bg-indigo-600/20 px-3 py-1 text-sm font-semibold text-indigo-400">
              {mockOrg.plan}
            </span>
            <span className="text-xs text-gray-500">
              Manage billing in the admin panel
            </span>
          </div>
        </div>

        <button
          onClick={flashSaved}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    );
  }

  function renderTokens() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">API Tokens</h2>
          <p className="mt-1 text-sm text-gray-400">
            Use API tokens to upload usage data from CLI tools. Tokens are
            scoped to your account.
          </p>
        </div>

        {/* Created token banner */}
        {createdToken && (
          <div className="rounded-lg border border-emerald-700/50 bg-emerald-900/20 p-4">
            <p className="text-sm font-medium text-emerald-300">
              Token created successfully. Copy it now -- you will not see it
              again.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 rounded bg-gray-800 px-3 py-2 text-sm text-emerald-400 font-mono">
                {createdToken}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdToken);
                }}
                className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-300 transition hover:bg-gray-700"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Token list */}
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80">
                <th className="px-4 py-3 font-medium text-gray-400">Name</th>
                <th className="px-4 py-3 font-medium text-gray-400">Prefix</th>
                <th className="px-4 py-3 font-medium text-gray-400">
                  Last Used
                </th>
                <th className="px-4 py-3 font-medium text-gray-400">
                  Created
                </th>
                <th className="px-4 py-3 font-medium text-gray-400" />
              </tr>
            </thead>
            <tbody>
              {tokens.map((tok) => (
                <tr
                  key={tok.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30"
                >
                  <td className="px-4 py-3 font-medium text-gray-200">
                    {tok.name}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400 font-mono">
                      {tok.prefix}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {tok.lastUsed ?? "Never"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{tok.createdAt}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRevokeToken(tok.id)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-800/50 bg-red-900/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-900/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
              {tokens.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No active tokens. Create one below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create token */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
          <h3 className="text-sm font-semibold text-gray-200">
            Create new token
          </h3>
          <div className="mt-3 flex gap-3">
            <input
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              placeholder="Token name, e.g. CI Pipeline"
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleCreateToken}
              disabled={!newTokenName.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-5">
          <h3 className="text-sm font-semibold text-gray-300">
            Usage Instructions
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Use API tokens to upload usage data from CLI tools. Include the
            token in the <code className="text-indigo-400">Authorization</code>{" "}
            header:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-800 p-4 text-xs text-gray-300 font-mono">
{`curl -X POST https://api.teameval.dev/v1/usage/upload \\
  -H "Authorization: Bearer <YOUR_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d @usage-data.json`}
          </pre>
        </div>
      </div>
    );
  }

  function renderNotifications() {
    const toggles: { key: keyof typeof notificationDefaults; label: string; description: string }[] = [
      {
        key: "weeklyDigest",
        label: "Weekly Digest",
        description: "Receive a summary of your team's AI usage every Monday.",
      },
      {
        key: "evaluationReminders",
        label: "Evaluation Reminders",
        description: "Get notified when evaluations are due or assigned to you.",
      },
      {
        key: "usageAlerts",
        label: "Usage Alerts",
        description: "Alert when token spend exceeds configurable thresholds.",
      },
      {
        key: "newMemberJoined",
        label: "New Member Joined",
        description: "Notification when someone accepts an invite to your org.",
      },
      {
        key: "billingAlerts",
        label: "Billing Alerts",
        description: "Warnings about upcoming charges or payment issues.",
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Choose which notifications you would like to receive.
          </p>
        </div>

        <div className="space-y-1">
          {toggles.map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/40 p-4 cursor-pointer hover:bg-gray-800/40 transition"
            >
              <div>
                <p className="text-sm font-medium text-gray-200">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <div className="relative ml-4 shrink-0">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-indigo-600 transition-colors" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={flashSaved}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          <Save className="h-4 w-4" />
          Save Preferences
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link
            href="/dashboard"
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-800 hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-100">Settings</h1>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar tabs */}
          <nav className="flex lg:w-56 lg:shrink-0 lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600/10 text-indigo-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="min-w-0 flex-1 rounded-xl border border-gray-800 bg-gray-900/60 p-6 sm:p-8">
            {activeTab === "profile" && renderProfile()}
            {activeTab === "password" && renderPassword()}
            {activeTab === "organization" && renderOrganization()}
            {activeTab === "tokens" && renderTokens()}
            {activeTab === "notifications" && renderNotifications()}

            {/* Save confirmation toast */}
            {saved && (
              <div className="fixed bottom-6 right-6 rounded-lg border border-emerald-700/50 bg-emerald-900/90 px-4 py-3 text-sm font-medium text-emerald-300 shadow-lg backdrop-blur-sm">
                Changes saved successfully.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
