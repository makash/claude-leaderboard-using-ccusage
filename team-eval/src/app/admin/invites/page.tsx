"use client";

import { useState } from "react";
import Link from "next/link";

interface CreatedMember {
  name: string;
  email: string;
  role: string;
  temporaryPassword: string;
}

export default function AddMembersPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [teamId, setTeamId] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [createdMembers, setCreatedMembers] = useState<CreatedMember[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role, teamId: teamId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add member");
        return;
      }
      setCreatedMembers((prev) => [
        {
          name: data.member.name,
          email: data.member.email,
          role: data.member.role,
          temporaryPassword: data.member.temporaryPassword,
        },
        ...prev,
      ]);
      setEmail("");
      setName("");
      setRole("MEMBER");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const copyCredentials = (member: CreatedMember) => {
    const text = `AIRank Login Credentials\nName: ${member.name}\nEmail: ${member.email}\nPassword: ${member.temporaryPassword}\nRole: ${member.role}\n\nPlease sign in and change your password in Settings.`;
    navigator.clipboard.writeText(text);
    setCopied(member.email);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-gray-400 hover:text-gray-200 text-sm mb-2 inline-block">
          &larr; Back to Admin
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Add Team Members</h1>
        <p className="text-gray-400 mb-8">
          Create accounts for team members with temporary passwords. Share the credentials so they can sign in and upload their usage data.
        </p>

        {/* Add Member Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">New Member</h2>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Team (Optional)</label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">No team</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="platform">Platform</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
            >
              {sending ? "Creating..." : "Create Member Account"}
            </button>
          </form>
        </div>

        {/* Created Members with Credentials */}
        {createdMembers.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">Newly Created Accounts</h2>
              <p className="text-sm text-gray-400 mt-1">
                Share these credentials with each member. They should change their password after first login.
              </p>
            </div>
            <div className="divide-y divide-gray-800">
              {createdMembers.map((member) => (
                <div key={member.email} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-white">{member.name}</span>
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs font-medium">
                          {member.role}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                        <div>
                          <span className="text-gray-500">Email: </span>
                          <span className="text-gray-200 font-mono">{member.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Password: </span>
                          <span className="text-amber-400 font-mono font-bold">{member.temporaryPassword}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyCredentials(member)}
                      className="px-4 py-2 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 whitespace-nowrap"
                    >
                      {copied === member.email ? "Copied!" : "Copy Credentials"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
          <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
            <li>Create an account for each team member with their email and name</li>
            <li>A temporary password is automatically generated for each member</li>
            <li>Share the login credentials with the team member (copy button copies all details)</li>
            <li>Members sign in at <span className="text-indigo-400">/login</span> with their email and temporary password</li>
            <li>Members should change their password in Settings after first login</li>
            <li>Members can then upload their Claude and Codex usage data via the API or dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
