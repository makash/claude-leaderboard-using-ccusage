/**
 * HTML templates for the Claude Leaderboard application.
 * Dark themed, responsive design using Tailwind CSS via CDN.
 */

interface User {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  is_admin: number;
  invites_remaining: number;
}

interface LeaderboardEntry {
  rank: number;
  display_name: string;
  avatar_url: string | null;
  total_cost: number;
  total_tokens: number;
  total_output_tokens: number;
  days_active: number;
  last_active: string | null;
}

function getTitle(cost: number): { label: string; color: string } {
  if (cost >= 500) return { label: 'Claude Maximalist', color: '#f59e0b' };
  if (cost >= 100) return { label: 'Token Whale', color: '#8b5cf6' };
  if (cost >= 50) return { label: 'Power User', color: '#06b6d4' };
  if (cost >= 10) return { label: 'Practitioner', color: '#10b981' };
  return { label: 'Apprentice', color: '#6b7280' };
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

function formatCost(n: number): string {
  return '$' + n.toFixed(2);
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout(title: string, content: string, user: User | null = null): string {
  const nav = user
    ? `<nav class="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" class="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Claude Leaderboard
          </a>
          <div class="flex items-center gap-6">
            <a href="/leaderboard" class="text-sm text-gray-300 hover:text-white transition">Leaderboard</a>
            <a href="/upload" class="text-sm text-gray-300 hover:text-white transition">Upload</a>
            <a href="/invites" class="text-sm text-gray-300 hover:text-white transition">Invites</a>
            ${user.is_admin ? '<a href="/admin" class="text-sm text-yellow-400 hover:text-yellow-300 transition">Admin</a>' : ''}
            <div class="flex items-center gap-2">
              ${user.avatar_url ? `<img src="${escapeHtml(user.avatar_url)}" class="w-7 h-7 rounded-full" alt="">` : `<div class="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">${escapeHtml(user.display_name.charAt(0))}</div>`}
              <span class="text-sm text-gray-300">${escapeHtml(user.display_name)}</span>
            </div>
            <a href="/auth/logout" class="text-sm text-gray-500 hover:text-gray-300 transition">Logout</a>
          </div>
        </div>
      </nav>`
    : `<nav class="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" class="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Claude Leaderboard
          </a>
          <a href="/leaderboard" class="text-sm text-gray-300 hover:text-white transition">Leaderboard</a>
        </div>
      </nav>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Claude Leaderboard by Akash</title>
  <meta name="author" content="Akash Mahajan">
  <meta name="description" content="Track and compare your Claude Code usage. Upload ccusage reports and compete on the leaderboard.">
  <meta property="og:title" content="${escapeHtml(title)} - Claude Leaderboard by Akash">
  <meta property="og:description" content="Track and compare your Claude Code usage. Upload ccusage reports and see where you rank.">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:creator" content="@makash">
  <meta name="twitter:title" content="${escapeHtml(title)} - Claude Leaderboard by Akash">
  <meta name="twitter:description" content="Track and compare your Claude Code usage. Upload ccusage reports and see where you rank.">
  <meta property="og:site_name" content="Claude Leaderboard by Akash">
  <meta property="og:url" content="https://claude-leaderboard.akash.wiki/">
  <link rel="canonical" href="https://claude-leaderboard.akash.wiki/">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#x1f3c6;</text></svg>">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Claude Leaderboard",
    "description": "Track and compare your Claude Code usage. Upload ccusage reports and compete on the leaderboard.",
    "url": "https://claude-leaderboard.akash.wiki/",
    "applicationCategory": "DeveloperApplication",
    "creator": {
      "@type": "Person",
      "name": "Akash Mahajan",
      "url": "https://github.com/makash",
      "sameAs": [
        "https://x.com/makash",
        "https://www.linkedin.com/in/akashm/",
        "https://www.youtube.com/@makash",
        "https://github.com/makash"
      ]
    }
  }
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            dark: { 900: '#0f0f1a', 800: '#1a1a2e', 700: '#252542' }
          }
        }
      }
    }
  </script>
  <style>
    body { background: #0f0f1a; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .glow { box-shadow: 0 0 20px rgba(124, 58, 237, 0.15); }
    .rank-1 { background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05)); border-color: rgba(245,158,11,0.3); }
    .rank-2 { background: linear-gradient(135deg, rgba(156,163,175,0.15), rgba(156,163,175,0.05)); border-color: rgba(156,163,175,0.3); }
    .rank-3 { background: linear-gradient(135deg, rgba(180,83,9,0.15), rgba(180,83,9,0.05)); border-color: rgba(180,83,9,0.3); }
  </style>
</head>
<body class="min-h-screen">
  ${nav}
  <main class="max-w-6xl mx-auto px-4 py-8">
    ${content}
  </main>
  <footer class="border-t border-gray-800 mt-16 py-8 text-center">
    <div class="max-w-6xl mx-auto px-4">
      <p class="text-sm text-gray-500 mb-3">
        Built by <a href="https://github.com/makash?utm_source=claude-leaderboard&utm_medium=web&utm_campaign=branding" target="_blank" rel="noopener" class="text-purple-400 hover:text-purple-300 transition">Akash Mahajan</a>
      </p>
      <div class="flex items-center justify-center gap-4">
        <a href="https://x.com/makash?utm_source=claude-leaderboard&utm_medium=web&utm_campaign=branding" target="_blank" rel="noopener" class="text-gray-600 hover:text-gray-300 transition" title="X / Twitter">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="https://github.com/makash?utm_source=claude-leaderboard&utm_medium=web&utm_campaign=branding" target="_blank" rel="noopener" class="text-gray-600 hover:text-gray-300 transition" title="GitHub">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
        </a>
        <a href="https://www.linkedin.com/in/akashm/?utm_source=claude-leaderboard&utm_medium=web&utm_campaign=branding" target="_blank" rel="noopener" class="text-gray-600 hover:text-gray-300 transition" title="LinkedIn">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <a href="https://www.youtube.com/@makash?utm_source=claude-leaderboard&utm_medium=web&utm_campaign=branding" target="_blank" rel="noopener" class="text-gray-600 hover:text-gray-300 transition" title="YouTube">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </a>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

export function landingPage(): string {
  return layout(
    'Welcome',
    `<div class="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div class="mb-8">
        <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Claude Leaderboard
        </h1>
        <p class="text-sm font-medium text-purple-400 mb-2 tracking-wide uppercase">by Akash Mahajan</p>
        <p class="text-xl text-gray-400 max-w-lg mx-auto">
          Track and compare your Claude Code usage. Upload your ccusage reports and see where you rank.
        </p>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-md glow">
        <h2 class="text-lg font-semibold mb-6">Sign in or join</h2>

        <div class="mb-6">
          <label class="block text-sm text-gray-400 mb-2">Have an invite code?</label>
          <input
            type="text"
            id="invite-code"
            placeholder="XXXX-XXXX-XXXX"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition uppercase tracking-wider"
          >
          <p class="text-xs text-gray-500 mt-1">Required for first-time sign up</p>
        </div>

        <button
          onclick="startLogin()"
          class="w-full bg-white text-gray-900 font-medium rounded-lg px-4 py-2.5 text-sm hover:bg-gray-100 transition flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign in with Google
        </button>
      </div>

      <div class="mt-8">
        <a href="/leaderboard" class="text-sm text-purple-400 hover:text-purple-300 transition">
          View the leaderboard &rarr;
        </a>
      </div>
    </div>

    <script>
      function startLogin() {
        const invite = document.getElementById('invite-code').value.trim();
        const params = new URLSearchParams();
        if (invite) params.set('invite', invite);
        window.location.href = '/auth/google' + (invite ? '?' + params : '');
      }
      document.getElementById('invite-code').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') startLogin();
      });
    </script>`
  );
}

export function dashboardPage(user: User, stats: { total_cost: number; total_tokens: number; total_output_tokens: number; days_active: number; rank: number; upload_count: number }): string {
  const title = getTitle(stats.total_cost);
  return layout(
    'Dashboard',
    `<div class="mb-8">
      <h1 class="text-2xl font-bold mb-1">Welcome back, ${escapeHtml(user.display_name)}</h1>
      <p class="text-gray-400">
        <span style="color:${title.color}" class="font-medium">${title.label}</span>
        &middot; Rank #${stats.rank || '—'}
      </p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div class="text-sm text-gray-400 mb-1">Total Cost</div>
        <div class="text-2xl font-bold text-purple-400">${formatCost(stats.total_cost)}</div>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div class="text-sm text-gray-400 mb-1">Total Tokens</div>
        <div class="text-2xl font-bold text-cyan-400">${formatTokens(stats.total_tokens)}</div>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div class="text-sm text-gray-400 mb-1">Output Tokens</div>
        <div class="text-2xl font-bold text-green-400">${formatTokens(stats.total_output_tokens)}</div>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div class="text-sm text-gray-400 mb-1">Days Active</div>
        <div class="text-2xl font-bold text-yellow-400">${stats.days_active}</div>
      </div>
    </div>

    <div class="flex gap-4">
      <a href="/upload" class="bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg px-6 py-3 transition">
        Upload Report
      </a>
      <a href="/leaderboard" class="bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg px-6 py-3 transition">
        View Leaderboard
      </a>
    </div>`,
    user
  );
}

export function leaderboardPage(entries: LeaderboardEntry[], user: User | null = null): string {
  const rows = entries
    .map((e) => {
      const title = getTitle(e.total_cost);
      const rankClass = e.rank <= 3 ? `rank-${e.rank}` : '';
      const medal = e.rank === 1 ? '<span class="text-yellow-400 text-lg mr-1">&#x1f947;</span>' : e.rank === 2 ? '<span class="text-gray-300 text-lg mr-1">&#x1f948;</span>' : e.rank === 3 ? '<span class="text-amber-600 text-lg mr-1">&#x1f949;</span>' : '';
      return `<tr class="border-b border-gray-800/50 hover:bg-gray-800/30 transition ${rankClass}">
        <td class="py-3 px-4 text-center font-mono text-sm">
          ${medal}${e.rank}
        </td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            ${e.avatar_url ? `<img src="${escapeHtml(e.avatar_url)}" class="w-8 h-8 rounded-full" alt="">` : `<div class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">${escapeHtml(e.display_name.charAt(0))}</div>`}
            <div>
              <div class="font-medium">${escapeHtml(e.display_name)}</div>
              <div class="text-xs" style="color:${title.color}">${title.label}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-right font-mono text-purple-400">${formatCost(e.total_cost)}</td>
        <td class="py-3 px-4 text-right font-mono text-cyan-400">${formatTokens(e.total_tokens)}</td>
        <td class="py-3 px-4 text-right font-mono text-green-400">${formatTokens(e.total_output_tokens)}</td>
        <td class="py-3 px-4 text-right text-sm text-gray-400">${e.days_active}</td>
        <td class="py-3 px-4 text-right text-sm text-gray-500">${timeAgo(e.last_active)}</td>
      </tr>`;
    })
    .join('');

  return layout(
    'Leaderboard',
    `<div class="mb-8">
      <h1 class="text-2xl font-bold mb-1">Leaderboard</h1>
      <p class="text-gray-400">Who's burning the most Claude tokens?</p>
    </div>

    ${entries.length === 0
      ? `<div class="text-center py-20 text-gray-500">
          <p class="text-lg mb-2">No data yet</p>
          <p class="text-sm">Be the first to upload a ccusage report!</p>
        </div>`
      : `<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden glow">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th class="py-3 px-4 text-center w-16">Rank</th>
                <th class="py-3 px-4 text-left">User</th>
                <th class="py-3 px-4 text-right">Cost</th>
                <th class="py-3 px-4 text-right">Total Tokens</th>
                <th class="py-3 px-4 text-right">Output Tokens</th>
                <th class="py-3 px-4 text-right">Days</th>
                <th class="py-3 px-4 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`
    }`,
    user
  );
}

export function uploadPage(user: User, message: { type: 'success' | 'error'; text: string } | null = null): string {
  const alertHtml = message
    ? `<div class="mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}">
        ${escapeHtml(message.text)}
      </div>`
    : '';

  return layout(
    'Upload',
    `<div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-1">Upload ccusage Report</h1>
        <p class="text-gray-400">
          Paste the JSON output from <code class="bg-gray-800 px-1.5 py-0.5 rounded text-sm">npx ccusage@latest daily --json</code>
        </p>
      </div>

      ${alertHtml}

      <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 glow">
        <form id="upload-form" method="POST" action="/api/upload">
          <div class="mb-4">
            <label class="block text-sm text-gray-400 mb-2">
              Upload JSON file
            </label>
            <input
              type="file"
              id="file-input"
              accept=".json"
              class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-500 file:cursor-pointer file:transition"
            >
          </div>

          <div class="mb-1 flex items-center gap-3">
            <div class="h-px bg-gray-800 flex-1"></div>
            <span class="text-xs text-gray-600">OR</span>
            <div class="h-px bg-gray-800 flex-1"></div>
          </div>

          <div class="mb-6">
            <label class="block text-sm text-gray-400 mb-2">
              Paste JSON output
            </label>
            <textarea
              id="json-input"
              name="json"
              rows="12"
              placeholder='{"type":"daily","data":[...],"summary":{...}}'
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-purple-500 transition resize-y"
            ></textarea>
          </div>

          <button
            type="submit"
            id="submit-btn"
            class="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg px-4 py-3 transition"
          >
            Upload &amp; Parse
          </button>
        </form>
      </div>

      <div class="mt-6 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        <h3 class="text-sm font-medium mb-3 text-gray-300">How to generate your report</h3>
        <ol class="text-sm text-gray-400 space-y-2">
          <li><span class="text-purple-400 font-mono">1.</span> Run <code class="bg-gray-800 px-1.5 py-0.5 rounded">npx ccusage@latest daily --json > report.json</code></li>
          <li><span class="text-purple-400 font-mono">2.</span> Upload the <code class="bg-gray-800 px-1.5 py-0.5 rounded">report.json</code> file above, or paste its contents</li>
          <li><span class="text-purple-400 font-mono">3.</span> Your data will be parsed and added to the leaderboard</li>
        </ol>
        <p class="text-xs text-gray-500 mt-3">Re-uploading updates existing dates rather than duplicating. You can safely re-upload anytime.</p>
      </div>
    </div>

    <script>
      const fileInput = document.getElementById('file-input');
      const jsonInput = document.getElementById('json-input');
      const form = document.getElementById('upload-form');
      const submitBtn = document.getElementById('submit-btn');

      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          const text = await file.text();
          jsonInput.value = text;
        }
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const json = jsonInput.value.trim();
        if (!json) { alert('Please paste JSON or upload a file'); return; }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json }),
          });
          const data = await res.json();
          if (data.ok) {
            window.location.href = '/?msg=upload_success&count=' + (data.entries || 0);
          } else {
            alert('Error: ' + (data.error || 'Upload failed'));
            submitBtn.disabled = false;
            submitBtn.textContent = 'Upload & Parse';
          }
        } catch (err) {
          alert('Network error: ' + err.message);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Upload & Parse';
        }
      });
    </script>`,
    user
  );
}

export function invitesPage(user: User, codes: { code: string; used_by: string | null; use_count: number; max_uses: number }[]): string {
  const rows = codes
    .map(
      (c) => `<tr class="border-b border-gray-800/50">
        <td class="py-2 px-4 font-mono text-sm tracking-wider">${escapeHtml(c.code)}</td>
        <td class="py-2 px-4 text-sm text-gray-400">${c.use_count} / ${c.max_uses}</td>
        <td class="py-2 px-4 text-sm">${c.use_count >= c.max_uses ? '<span class="text-gray-500">Used</span>' : '<span class="text-green-400">Available</span>'}</td>
      </tr>`
    )
    .join('');

  return layout(
    'Invites',
    `<div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-1">Your Invite Codes</h1>
        <p class="text-gray-400">Share these with friends to let them join. You have ${user.invites_remaining} invite(s) remaining.</p>
      </div>

      ${user.invites_remaining > 0
        ? `<form method="POST" action="/api/invites/create" class="mb-6">
            <button type="submit" class="bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg px-6 py-2.5 text-sm transition" id="gen-btn">
              Generate Invite Code
            </button>
          </form>
          <script>
            document.querySelector('form').addEventListener('submit', async (e) => {
              e.preventDefault();
              const btn = document.getElementById('gen-btn');
              btn.disabled = true;
              btn.textContent = 'Generating...';
              const res = await fetch('/api/invites/create', { method: 'POST' });
              if (res.ok) window.location.reload();
              else { alert('Failed to generate invite'); btn.disabled = false; btn.textContent = 'Generate Invite Code'; }
            });
          </script>`
        : '<p class="mb-6 text-sm text-gray-500">You have no invites remaining.</p>'
      }

      ${codes.length > 0
        ? `<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th class="py-2 px-4 text-left">Code</th>
                  <th class="py-2 px-4 text-left">Uses</th>
                  <th class="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`
        : '<p class="text-gray-500 text-sm">No invite codes generated yet.</p>'
      }
    </div>`,
    user
  );
}

export function adminPage(
  user: User,
  stats: { total_users: number; total_uploads: number; total_invites: number },
  codes: { code: string; use_count: number; max_uses: number; created_by_name: string | null }[]
): string {
  const rows = codes
    .map(
      (c) => `<tr class="border-b border-gray-800/50">
        <td class="py-2 px-4 font-mono text-sm tracking-wider">${escapeHtml(c.code)}</td>
        <td class="py-2 px-4 text-sm text-gray-400">${c.use_count} / ${c.max_uses}</td>
        <td class="py-2 px-4 text-sm text-gray-400">${c.created_by_name ? escapeHtml(c.created_by_name) : 'System'}</td>
      </tr>`
    )
    .join('');

  return layout(
    'Admin',
    `<div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-1 text-yellow-400">Admin Panel</h1>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div class="text-sm text-gray-400 mb-1">Total Users</div>
          <div class="text-2xl font-bold">${stats.total_users}</div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div class="text-sm text-gray-400 mb-1">Total Uploads</div>
          <div class="text-2xl font-bold">${stats.total_uploads}</div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div class="text-sm text-gray-400 mb-1">Invite Codes</div>
          <div class="text-2xl font-bold">${stats.total_invites}</div>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-4">Generate Bulk Invite Codes</h2>
        <form class="flex gap-3" id="admin-invite-form">
          <input type="number" id="invite-count" value="5" min="1" max="50" class="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
          <input type="number" id="invite-max-uses" value="1" min="1" max="100" placeholder="Max uses" class="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
          <button type="submit" class="bg-yellow-600 hover:bg-yellow-500 text-white font-medium rounded-lg px-6 py-2 text-sm transition" id="admin-gen-btn">
            Generate
          </button>
        </form>
        <script>
          document.getElementById('admin-invite-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('admin-gen-btn');
            const count = document.getElementById('invite-count').value;
            const maxUses = document.getElementById('invite-max-uses').value;
            btn.disabled = true;
            btn.textContent = 'Generating...';
            const res = await fetch('/api/admin/invites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ count: parseInt(count), maxUses: parseInt(maxUses) }),
            });
            if (res.ok) window.location.reload();
            else { alert('Failed'); btn.disabled = false; btn.textContent = 'Generate'; }
          });
        </script>
      </div>

      ${codes.length > 0
        ? `<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th class="py-2 px-4 text-left">Code</th>
                  <th class="py-2 px-4 text-left">Uses</th>
                  <th class="py-2 px-4 text-left">Created By</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`
        : ''
      }
    </div>`,
    user
  );
}

export function errorPage(title: string, message: string, user: User | null = null): string {
  return layout(
    title,
    `<div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div class="text-6xl mb-4 text-red-400">!</div>
      <h1 class="text-2xl font-bold mb-2">${escapeHtml(title)}</h1>
      <p class="text-gray-400 mb-6">${escapeHtml(message)}</p>
      <a href="/" class="text-purple-400 hover:text-purple-300 transition">Back to home</a>
    </div>`,
    user
  );
}
