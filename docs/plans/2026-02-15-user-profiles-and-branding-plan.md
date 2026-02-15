# User Profiles, Branding & OG Image — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add public user profile pages with GitHub-style activity heatmaps, favorite tools, shareable tweets, site-wide OG image, rebranded homepage, and MIT license.

**Architecture:** Extend existing Hono routes and HTML templates. New `/user/:slug` route with server-side rendered heatmap (CSS Grid). Favorite tools stored as JSON in users table. OG image hosted on Sirv (external). Branding changes are HTML/CSS only.

**Tech Stack:** Hono, Cloudflare Workers, D1 (SQLite), Tailwind CSS CDN, Satori (existing)

**Design doc:** `docs/plans/2026-02-15-user-profiles-and-branding-design.md`

---

## Task 1: MIT License

**Files:**
- Create: `LICENSE`

**Step 1: Create LICENSE file**

```
MIT License

Copyright (c) 2025-2026 Akash Mahajan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Step 2: Commit**

```bash
git add LICENSE
git commit -m "chore: add MIT license"
```

---

## Task 2: Homepage Branding Update

**Files:**
- Modify: `src/html.ts:19-75` (layout function — nav, title, meta tags)
- Modify: `src/html.ts:128-151` (layout function — footer)
- Modify: `src/html.ts:156-264` (landingPage — hero section)
- Modify: `src/html.ts:777-891` (aboutPage — add professional intro)

**Step 1: Update layout nav bar**

In `src/html.ts`, in the `layout()` function, change the nav logo text from `Claude Leaderboard` to `ccrank.dev`.

Find (line ~23):
```html
<a href="/" class="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
  Claude Leaderboard
</a>
```
Replace with:
```html
<a href="/" class="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
  ccrank.dev
</a>
```

**Step 2: Update page title pattern**

In `layout()`, find (line ~57):
```html
<title>${escapeHtml(title)} - Claude Leaderboard by Akash</title>
```
Replace with:
```html
<title>${escapeHtml(title)} | ccrank.dev</title>
```

**Step 3: Update OG and Twitter meta tags**

In `layout()`, update these meta tags (lines ~62-70):
- `og:title`: change suffix to `| ccrank.dev`
- `og:site_name`: change to `ccrank.dev`
- `twitter:title`: change suffix to `| ccrank.dev`
- `og:image`: will be updated in Task 3 (OG image) — leave as-is for now
- `twitter:image`: will be updated in Task 3

**Step 4: Update footer**

In `layout()`, find the footer section (lines ~128-151).

Change "Built by Akash Mahajan" to "by @makash" with X link:
```html
<p class="text-sm text-gray-500 mb-1">
  by <a href="https://x.com/makash?utm_source=ccrank&utm_medium=web&utm_campaign=footer" target="_blank" rel="noopener" class="text-purple-400 hover:text-purple-300 transition">@makash</a>
</p>
```

Change "Powered by ccusage" to include "Open Source" link:
```html
<p class="text-xs text-gray-600 mb-3">
  Powered by <a href="https://github.com/ryoppippi/ccusage?utm_source=ccrank&utm_medium=web&utm_campaign=footer" target="_blank" rel="noopener" class="text-gray-500 hover:text-gray-300 transition">ccusage</a>
  <span class="mx-1">|</span>
  <a href="https://github.com/makash/claude-leaderboard-using-ccusage?utm_source=ccrank&utm_medium=web&utm_campaign=footer" target="_blank" rel="noopener" class="text-gray-500 hover:text-gray-300 transition">Open Source</a>
</p>
```

**Step 5: Update landing page hero**

In `landingPage()`, find the hero section (around lines 225-240):
- Change `<h1>` text from `Claude Leaderboard` to `ccrank.dev`
- Remove `<p class="text-sm font-medium text-purple-400 mb-3 tracking-wide uppercase">by Akash Mahajan</p>`
- Keep tagline: "Who on your team burns the most Claude tokens? Find out."
- Add below tagline: `<p class="text-xs text-gray-500 mt-2">by <a href="https://x.com/makash?utm_source=ccrank&utm_medium=web&utm_campaign=hero" target="_blank" rel="noopener" class="text-gray-400 hover:text-gray-300 transition">@makash</a></p>`

**Step 6: Update about page intro**

In `aboutPage()` (line ~777), add a professional intro paragraph at the top of the content, before the origin story:
```html
<p class="text-gray-400 mb-8 text-lg leading-relaxed">
  ccrank.dev is an open-source developer ranking platform for Claude Code usage.
  Track, compare, and compete on your team's AI-assisted development metrics.
</p>
```

**Step 7: Deploy and verify**

```bash
npx wrangler deploy
```

Verify: homepage shows "ccrank.dev" branding, footer has @makash + Open Source link, page titles say "| ccrank.dev".

**Step 8: Commit**

```bash
git add src/html.ts
git commit -m "feat: rebrand to ccrank.dev with @makash attribution and Open Source link"
```

---

## Task 3: OG Image (Sirv-hosted)

**Files:**
- Modify: `src/html.ts:64-70` (layout — OG image meta tags)

**Prerequisite:** User provides Sirv URL for compressed OG image.

**Step 1: Update OG meta tags in layout()**

Once user provides the Sirv URL (e.g. `https://example.sirv.com/ccrank-og.png`), update the `og:image` and `twitter:image` tags in `layout()`:

```html
<meta property="og:image" content="SIRV_URL_HERE">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:image" content="SIRV_URL_HERE">
```

The per-user card pages (`cardPage()` at line 982) already override these with their own SVG image, so no changes needed there.

**Step 2: Remove the old `/card/makash/image.svg` references**

The current layout already has these from the satori fix. Replace them with the Sirv URL.

**Step 3: Deploy and verify**

```bash
npx wrangler deploy
```

Test with Twitter Card Validator or OpenGraph debugger.

**Step 4: Commit**

```bash
git add src/html.ts
git commit -m "feat: add Sirv-hosted OG image for site-wide social previews"
```

---

## Task 4: Database Migration for Favorite Tools

**Files:**
- Create: `migrations/0006_add_fav_tools.sql`

**Step 1: Create migration**

```sql
-- Add favorite tools column (JSON array of up to 3 strings)
ALTER TABLE users ADD COLUMN fav_tools TEXT NOT NULL DEFAULT '[]';
```

**Step 2: Run migration on production**

```bash
npx wrangler d1 execute claude-leaderboard-db --remote --file=migrations/0006_add_fav_tools.sql
```

**Step 3: Commit**

```bash
git add migrations/0006_add_fav_tools.sql
git commit -m "feat: add fav_tools column to users table"
```

---

## Task 5: Update Types and Settings Page for Favorite Tools

**Files:**
- Modify: `src/utils.ts:7-16` (User interface)
- Modify: `src/html.ts:1151-1230` (settingsPage — add fav tools inputs)
- Modify: `src/index.ts:404-444` (POST /api/settings/sharing — extend payload)
- Modify: `src/index.ts` (user query in middleware — add fav_tools column)

**Step 1: Add fav_tools to User type**

In `src/utils.ts`, add to User interface (after `share_slug`):
```typescript
fav_tools: string; // JSON array of up to 3 strings
```

**Step 2: Update user query in middleware**

In `src/index.ts`, find the user query in the auth middleware that selects user columns. Add `fav_tools` to the SELECT.

**Step 3: Add favorite tools UI to settings page**

In `src/html.ts`, in `settingsPage()`, add a new section after the sharing section:

```html
<!-- Favorite Tools Section -->
<div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
  <h2 class="text-lg font-semibold mb-2">Favorite Tools</h2>
  <p class="text-sm text-gray-400 mb-4">What are the Claude Code plugins or skills you can't live without? (shown on your profile)</p>
  <div class="space-y-3">
    <input type="text" id="fav-tool-1" value="${escapeHtml(favTools[0] || '')}"
      placeholder="e.g. playwright MCP"
      class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition"
      maxlength="50">
    <input type="text" id="fav-tool-2" value="${escapeHtml(favTools[1] || '')}"
      placeholder="e.g. git-worktree"
      class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition"
      maxlength="50">
    <input type="text" id="fav-tool-3" value="${escapeHtml(favTools[2] || '')}"
      placeholder="e.g. sentry skill"
      class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition"
      maxlength="50">
  </div>
</div>
```

Parse `user.fav_tools` JSON at top of `settingsPage()`:
```typescript
const favTools: string[] = (() => {
  try { return JSON.parse(user.fav_tools || '[]'); } catch { return []; }
})();
```

**Step 4: Update settings form JS to include fav_tools**

In the `<script>` section of `settingsPage()`, update the form submit handler to also send fav_tools:

```javascript
const favTools = [
  document.getElementById('fav-tool-1').value.trim(),
  document.getElementById('fav-tool-2').value.trim(),
  document.getElementById('fav-tool-3').value.trim(),
].filter(Boolean);
```

Add `favTools` to the POST body: `JSON.stringify({ enabled, slug, favTools })`.

**Step 5: Extend the API endpoint**

In `src/index.ts`, in the POST `/api/settings/sharing` handler, extend the body type:
```typescript
let body: { enabled: boolean; slug?: string; favTools?: string[] };
```

After the sharing update query, add:
```typescript
if (body.favTools !== undefined) {
  const tools = (body.favTools || []).slice(0, 3).map(t => t.slice(0, 50));
  await c.env.DB.prepare(
    'UPDATE users SET fav_tools = ? WHERE id = ?'
  ).bind(JSON.stringify(tools), user.id).run();
}
```

**Step 6: Deploy and test**

```bash
npx wrangler deploy
```

Go to /settings, add 3 tools, save, refresh — values should persist.

**Step 7: Commit**

```bash
git add src/utils.ts src/html.ts src/index.ts
git commit -m "feat: add favorite tools to settings page"
```

---

## Task 6: User Profile Page

**Files:**
- Modify: `src/utils.ts:18-27` (LeaderboardEntry — add share_slug)
- Create: `src/html.ts` (add `profilePage()` function after `settingsPage()`)
- Modify: `src/index.ts` (add `/user/:slug` route)
- Modify: `src/index.ts` (update leaderboard/history queries to include share_slug)

**Step 1: Extend LeaderboardEntry type**

In `src/utils.ts`, add to LeaderboardEntry (after `last_active`):
```typescript
share_slug: string | null;
```

**Step 2: Update leaderboard queries**

In `src/index.ts`, update the leaderboard and history SQL queries to join with users table to get `share_slug` and `sharing_enabled`:

For the leaderboard query, add to the SELECT: `u.share_slug` and to the JOIN condition: `AND u.sharing_enabled = 1` (set share_slug to null if not sharing).

**Step 3: Make user names clickable on leaderboard**

In `src/html.ts`, in `leaderboardPage()` (line ~427), wrap the display_name in a link if share_slug is set:

```html
<div class="font-medium">
  ${e.share_slug
    ? `<a href="/user/${escapeHtml(e.share_slug)}" class="hover:text-purple-400 transition">${escapeHtml(e.display_name)}</a>`
    : escapeHtml(e.display_name)}
</div>
```

Do the same for the podium cards in `landingPage()` and rows in `historyPage()`.

**Step 4: Create profilePage() function**

In `src/html.ts`, add a new export function `profilePage()` after `settingsPage()`. This is the largest piece — here's the full structure:

```typescript
export function profilePage(
  profileUser: { display_name: string; avatar_url: string | null; share_slug: string },
  stats: {
    total_cost: number;
    total_tokens: number;
    total_output_tokens: number;
    days_active: number;
    rank: number;
    last_active: string | null;
  },
  favTools: string[],
  heatmapData: { date: string; cost: number; tokens: number; sessions: number }[],
  isOwner: boolean,
  viewer: User | null
): string {
```

**Profile header:**
```html
<div class="flex items-center gap-6 mb-8">
  <!-- large avatar -->
  <!-- display name + title badge + rank pill -->
</div>
```

**Stats row (public):**
```html
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
    <div class="text-2xl font-bold text-cyan-400">${formatTokens(stats.total_tokens)}</div>
    <div class="text-xs text-gray-500 mt-1">Total Tokens</div>
  </div>
  <!-- output tokens, days active, last active -->
  <!-- total cost: only if isOwner -->
</div>
```

**Activity Heatmap:**

The heatmap is a CSS Grid with 53 columns (weeks) x 7 rows (days). Three grids are pre-rendered (cost, tokens, sessions) and tab JS toggles visibility.

```html
<div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold">Activity</h2>
    <div class="flex gap-1 text-xs">
      <button onclick="showHeatmap('cost')" id="tab-cost" class="px-3 py-1 rounded-full bg-purple-600 text-white">Cost</button>
      <button onclick="showHeatmap('tokens')" id="tab-tokens" class="px-3 py-1 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600">Tokens</button>
      <button onclick="showHeatmap('sessions')" id="tab-sessions" class="px-3 py-1 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600">Sessions</button>
    </div>
  </div>
  <div id="heatmap-cost" class="heatmap-grid">${renderHeatmap(heatmapData, 'cost')}</div>
  <div id="heatmap-tokens" class="heatmap-grid hidden">${renderHeatmap(heatmapData, 'tokens')}</div>
  <div id="heatmap-sessions" class="heatmap-grid hidden">${renderHeatmap(heatmapData, 'sessions')}</div>
</div>
```

**Heatmap rendering helper** (inside html.ts):

```typescript
function renderHeatmap(data: { date: string; cost: number; tokens: number; sessions: number }[], metric: 'cost' | 'tokens' | 'sessions'): string {
  // Build a map of date -> value
  const map = new Map<string, number>();
  data.forEach(d => map.set(d.date, d[metric]));

  // Find max for color scaling
  const values = data.map(d => d[metric]).filter(v => v > 0);
  const maxVal = Math.max(...values, 1);

  // Generate 52 weeks of cells, starting from 52 weeks ago
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  // Adjust to start on Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  let cells = '';
  const current = new Date(startDate);
  while (current <= today) {
    const dateStr = current.toISOString().slice(0, 10);
    const val = map.get(dateStr) || 0;
    const intensity = val > 0 ? Math.max(0.15, Math.min(1, val / maxVal)) : 0;
    const color = val > 0
      ? `rgba(139, 92, 246, ${intensity})` // purple
      : 'rgba(55, 65, 81, 0.3)'; // empty gray
    const label = metric === 'cost' ? formatCost(val) : metric === 'tokens' ? formatTokens(val) : String(val);
    cells += `<div title="${dateStr}: ${label}" style="background:${color}" class="w-3 h-3 rounded-sm"></div>`;
    current.setDate(current.getDate() + 1);
  }

  return `<div class="grid grid-flow-col gap-1" style="grid-template-rows:repeat(7,1fr)">${cells}</div>`;
}
```

**Favorite tools section:**
```html
<div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
  <h2 class="text-lg font-semibold mb-3">Tools I can't live without</h2>
  <div class="flex flex-wrap gap-2">
    ${favTools.length > 0
      ? favTools.map(t => `<span class="bg-purple-900/40 border border-purple-700/50 text-purple-300 px-4 py-2 rounded-full text-sm font-medium">${escapeHtml(t)}</span>`).join('')
      : `<span class="text-gray-500 text-sm">${isOwner ? 'Set your favorites in <a href="/settings" class="text-purple-400 hover:text-purple-300">Settings</a>' : 'No favorites set yet'}</span>`}
  </div>
</div>
```

**Share on X button:**
```html
<div class="text-center">
  <a href="https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}"
    target="_blank" rel="noopener"
    class="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-full text-sm font-medium transition">
    Share on X
  </a>
</div>
```

Tweet text construction:
```typescript
const tweetParts = [`I'm ranked #${stats.rank} on ccrank.dev!`];
if (favTools.length > 0) {
  tweetParts.push('', 'My go-to Claude Code tools:');
  favTools.forEach(t => tweetParts.push(`- ${t}`));
}
tweetParts.push('', `Check your ranking: ccrank.dev/user/${profileUser.share_slug}`);
const tweetText = tweetParts.join('\n');
```

**Step 5: Add /user/:slug route**

In `src/index.ts`, add a new route before the card routes:

```typescript
app.get('/user/:slug', async (c) => {
  const slug = c.req.param('slug');
  const profileUser = await c.env.DB.prepare(
    'SELECT id, display_name, avatar_url, share_slug, fav_tools FROM users WHERE share_slug = ? AND sharing_enabled = 1'
  ).bind(slug).first();

  if (!profileUser) return c.html(errorPage('Not Found', 'This profile does not exist or is not public.'), 404);

  const stats = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(cost_usd), 0) as total_cost, COALESCE(SUM(total_tokens), 0) as total_tokens,
     COALESCE(SUM(output_tokens), 0) as total_output_tokens, COUNT(DISTINCT date) as days_active, MAX(date) as last_active
     FROM daily_usage WHERE user_id = ?`
  ).bind((profileUser as any).id).first();

  const rankResult = await c.env.DB.prepare(
    `SELECT COUNT(*) + 1 as rank FROM (SELECT user_id, SUM(cost_usd) as total_cost FROM daily_usage GROUP BY user_id)
     WHERE total_cost > (SELECT COALESCE(SUM(cost_usd), 0) FROM daily_usage WHERE user_id = ?)`
  ).bind((profileUser as any).id).first();

  // Heatmap: daily data for past 365 days
  const heatmapRows = await c.env.DB.prepare(
    `SELECT date, COALESCE(SUM(cost_usd), 0) as cost, COALESCE(SUM(total_tokens), 0) as tokens, COUNT(*) as sessions
     FROM daily_usage WHERE user_id = ? AND date >= date('now', '-365 days') GROUP BY date`
  ).bind((profileUser as any).id).all();

  const favTools: string[] = (() => {
    try { return JSON.parse((profileUser as any).fav_tools || '[]'); } catch { return []; }
  })();

  const viewer = c.get('user');
  const isOwner = viewer?.id === (profileUser as any).id;

  return c.html(profilePage(
    { display_name: (profileUser as any).display_name, avatar_url: (profileUser as any).avatar_url, share_slug: (profileUser as any).share_slug },
    {
      total_cost: (stats as any)?.total_cost ?? 0,
      total_tokens: (stats as any)?.total_tokens ?? 0,
      total_output_tokens: (stats as any)?.total_output_tokens ?? 0,
      days_active: (stats as any)?.days_active ?? 0,
      rank: (rankResult as any)?.rank ?? 0,
      last_active: (stats as any)?.last_active ?? null,
    },
    favTools,
    (heatmapRows.results || []).map((r: any) => ({ date: r.date, cost: r.cost, tokens: r.tokens, sessions: r.sessions })),
    isOwner,
    viewer
  ));
});
```

**Step 6: Add heatmap tab switching JS**

In `profilePage()`, add a `<script>` block:

```javascript
function showHeatmap(metric) {
  ['cost', 'tokens', 'sessions'].forEach(m => {
    document.getElementById('heatmap-' + m).classList.toggle('hidden', m !== metric);
    const tab = document.getElementById('tab-' + m);
    tab.classList.toggle('bg-purple-600', m === metric);
    tab.classList.toggle('text-white', m === metric);
    tab.classList.toggle('bg-gray-700', m !== metric);
    tab.classList.toggle('text-gray-400', m !== metric);
  });
}
```

**Step 7: Import profilePage in index.ts**

Add `profilePage` to the imports from `./html`.

**Step 8: Deploy and test**

```bash
npx wrangler deploy
```

Verify:
- `/user/makash` shows profile with heatmap, stats, tools
- Non-existent slugs return 404
- Cost is hidden for non-owners
- Heatmap tabs switch metrics
- Share on X opens correct tweet

**Step 9: Commit**

```bash
git add src/utils.ts src/html.ts src/index.ts
git commit -m "feat: add public user profile pages with activity heatmap and favorite tools"
```

---

## Task 7: Make Leaderboard/Podium Names Clickable

**Files:**
- Modify: `src/html.ts:413-483` (leaderboardPage — link user names)
- Modify: `src/html.ts:156-264` (landingPage — link podium names)
- Modify: `src/html.ts:892-981` (historyPage — link user names)
- Modify: `src/index.ts` (leaderboard/history queries — join share_slug)

**Step 1: Update leaderboard SQL query**

In `src/index.ts`, find the leaderboard query. Add a LEFT JOIN or subselect to get `share_slug` for users with `sharing_enabled = 1`. Update the result mapping to include `share_slug`.

**Step 2: Update LeaderboardEntry usage**

In the leaderboard route handler, map `share_slug` into each entry.

**Step 3: Link user names in leaderboardPage()**

In `src/html.ts:427`, wrap display name with link (as shown in Task 6 Step 3).

**Step 4: Link podium names in landingPage()**

In `podiumCard()` (~line 178), wrap display name:
```html
${e.share_slug
  ? `<a href="/user/${escapeHtml(e.share_slug)}" class="hover:text-purple-300 transition">${escapeHtml(e.display_name)}</a>`
  : escapeHtml(e.display_name)}
```

**Step 5: Link names in historyPage()**

Same pattern as leaderboard.

**Step 6: Deploy, verify, commit**

```bash
npx wrangler deploy
git add src/html.ts src/index.ts
git commit -m "feat: make user names clickable on leaderboard, podium, and history"
```

---

## Task 8: Final Deploy and Cleanup

**Step 1: Full deploy**

```bash
npx wrangler deploy
```

**Step 2: Verify all features**

- [ ] Homepage says "ccrank.dev" not "Claude Leaderboard by Akash Mahajan"
- [ ] Footer shows "by @makash" + "Powered by ccusage | Open Source"
- [ ] About page has professional intro
- [ ] LICENSE file exists at repo root
- [ ] OG image shows correctly (once Sirv URL is provided)
- [ ] `/user/makash` profile page loads with heatmap
- [ ] Heatmap tabs switch between cost/tokens/sessions
- [ ] Favorite tools show on profile (after setting in /settings)
- [ ] Share on X generates correct tweet
- [ ] Cost is hidden for non-owner viewers
- [ ] Leaderboard/podium/history names link to profiles
- [ ] Non-sharing users' names are plain text (not linked)

**Step 3: Push**

```bash
git push
bd sync
```
