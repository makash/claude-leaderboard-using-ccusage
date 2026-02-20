# ccrank.dev Product Roadmap — Brainstorm

**Date:** 2026-02-15
**Author:** Akash Mahajan / Claude
**Source:** Blog post "GitHub contribution graphs were made for a different era"

## Core Thesis

The old metric (green squares, commit count) optimizes for **presence**. The new game optimizes for **leverage** — how efficiently you turn AI tokens into shipped code. ccrank is the scoreboard for this new game.

## What's Already Shipped

- Public leaderboard with 4 sort dimensions (Cost, Output/$, Cache Rate, Output Ratio)
- Time travel (daily/weekly/monthly snapshots)
- Multi-machine tracking
- User profiles with GitHub-style heatmaps, favorite tools, efficiency stats
- Shareable social cards (PNG + SVG) with OG meta tags
- Title system (Apprentice → Claude Maximalist)
- Invite-only auth with Google OAuth

## The Backlog

Items extracted from the blog post + brainstorm session, categorized by implementation effort.

### Category A: Can Build Now (existing data, no new tables or external services)

| # | Feature | Description | Phase |
|---|---------|-------------|-------|
| A1 | Model breakdown view | Show which models each user uses most. Data already in `models_used` JSON column. | Portfolio |
| A2 | Trend sparklines on profiles | Mini cost/efficiency line charts using last 30/90 days of daily_usage data. | Portfolio |
| A4 | Streak tracking | Compute longest streak + current streak from daily_usage dates. Display on profile. | Portfolio |
| A5 | CSV export | Download your daily_usage as CSV. API endpoint + button on dashboard. | Utility |
| A6 | Metric-specific tips (static) | Show guidance based on metric thresholds: "Your cache rate is X% — top performers hit 95%+." Server-side logic in templates. | Guidance |
| A7 | Upload success screen improvements | Post-upload: show rank change, metric deltas, "Your Output/$ went up 12%!" | Engagement |
| A8 | Milestone notifications | "You crossed $100! You now qualify for efficiency rankings." Shown on dashboard. | Engagement |
| A9 | Aggregate usage intelligence | Mine anonymized data for insights: model mix vs efficiency, session patterns, spending curves, tool preferences, cohort benchmarks. Powers A6/B1/B2 with real data. | Guidance |

### Category B: Needs Small Changes (new migration, new table, or new module — each < 1 day)

| # | Feature | Description | Phase |
|---|---------|-------------|-------|
| B1 | Peer comparison insights | "Users in your spend bracket average 450 tokens/$." Cohort averages via SQL aggregation. Note: only useful at 50+ users. | Guidance |
| B2 | Trend-based nudges | "Your efficiency improved 15% this week." Two-period comparison queries on dashboard. | Guidance |
| B3 | Source comparison view | Side-by-side: laptop vs cloud usage. New profile tab using existing source data. | Portfolio |
| B4 | API for programmatic uploads | Authenticated endpoint so users can `curl` their reports. New `api_keys` table. | Utility |
| B5 | Weekly digest emails | "Your rank changed: #3 → #2." Needs email provider integration (e.g., Resend). | Engagement |
| B8 | Manual project tagging | Tag date ranges with project names. "Feb 1-7: Built auth system." New `projects` table. | Output Mapping |
| B9 | Personal goals / budgets | User sets monthly cost target, profile shows progress bar. New column on users table. | Portfolio |
| B10 | Journal entries on profile | Free-text entries tied to date ranges. New `journal_entries` table. | Learning |
| B11 | Community feed | `/learn` page aggregating journal entries. Voting system. Depends on B10. | Learning |
| B12 | RSS import for learning | Users point to blog RSS, entries auto-imported to journal. Depends on B10. | Learning |

### Category C: Needs Major Changes (new services, external dependencies, or ecosystem work)

| # | Feature | Description | Phase |
|---|---------|-------------|-------|
| C1 | Auto project detection | Binary (Rust/Go) that wraps ccusage + captures git repo context automatically. | Output Mapping |
| C2 | ROI per feature | "This feature cost 50k tokens and shipped in 2 hours." Needs project tagging (B8 or C1) first. | Output Mapping |
| C3 | Team / org support | Multi-user groups, team leaderboards, sprint retro views. (Deferred until 500 users.) | Teams |
| C4 | Slack/Discord bot | Post rankings to team chat. Needs webhook infra. | Teams |
| C5 | Anthropic integration | Pull power users for beta testing, pricing experiments. Partnership, not code. | Growth |
| C6 | ccrank CLI binary | Standalone tool (Rust/Go) that replaces `npx ccusage` + adds project tracking + auto-upload. | Platform |

## Personalized Guidance — The Monetization Angle

This is the pivotal feature that turns free users into paid users (when the time comes). Three layers, in order of implementation complexity:

### Layer 1: Static Metric Tips (A6)
Hardcoded advice based on where you fall relative to thresholds:
- "Your cache rate is 89.7%. Top performers hit 95%+. **Tip:** Work in longer sessions on the same codebase. Context reuse improves with session continuity."
- "Your Output/$ is 242 tokens/$. The leader gets 1.3K. **Tip:** Use Opus for architecture decisions, Haiku for repetitive tasks."
- "You're active 8 days this month but spend $874. **Tip:** Spreading usage over more days typically improves efficiency — smaller, focused sessions beat marathon ones."

**Implementation:** Server-side logic in templates. Compare user metrics against top-3 averages and threshold buckets. Display on dashboard + profile.

### Layer 2: Peer Comparison (B1)
Group users into cohorts by spend bracket ($100-500, $500-1000, $1000+). Compare individual metrics against cohort averages:
- "Users in your spend bracket ($500-1K) average 450 tokens/$. You're at 167 — below the cohort median."
- "Your cache rate is in the top 20% of your cohort."

**Implementation:** SQL aggregation at query time. No materialized views needed at current scale.

### Layer 3: Trend Analysis (B2)
Compare this week vs last week, this month vs last month:
- "Your Output/$ improved 15% this week — up from 210 to 242."
- "Your cache rate dropped 3% — did you start a new project?"

**Implementation:** Two-period comparison queries. Display as delta badges on dashboard.

### The Data Flywheel (A9)
More users upload → richer aggregate data → better benchmarks and guidance → more users want to upload. This is the engine that makes Layers 1-3 increasingly valuable over time. Insights to mine from aggregated ccusage data:
- **Model mix vs efficiency** — Do Opus-heavy users get more output/$ than Sonnet-heavy users? Optimal mix?
- **Session patterns** — Do shorter focused sessions correlate with higher cache rates?
- **Spending curves** — Do users plateau? Does efficiency improve with experience?
- **Tool preferences** — Which Claude Code tools do the most efficient users favor?
- **Cohort benchmarks** — "Devs spending $500-1K/month typically hit 400 tokens/$ after 3 months"

### Future Layer: AI-Powered Coaching
Use Claude API to analyze a user's usage patterns and generate personalized advice. "Based on your model mix and session patterns, here are 3 things to try this week." This is the premium feature.

## Key Decisions

1. **Team features deferred** until 500+ users upload. Focus on individual value first.
2. **Manual project tagging first** (B8), auto-detection (C1) as separate effort — possibly a standalone binary.
3. **Public Learning starts simple** — journal entries on profile pages, community feed later.
4. **Personalized guidance** is the monetization wedge. Build Layer 1 immediately, Layer 2 soon after.
5. **Monetization model TBD** — build value first, decide later.
6. **ccrank CLI binary** (C6) is the long-term play — replaces ccusage dependency, adds project tracking + auto-upload. But it's a separate project.

## Suggested Priority Order

**Immediate (this sprint):**
1. A6 — Metric-specific tips (static guidance on dashboard/profile)
2. A7 — Upload success screen with rank deltas
3. A1 — Model breakdown view
4. A2 — Trend sparklines on profiles

**Next sprint:**
5. B1 — Peer comparison insights
6. B2 — Trend-based nudges
7. A9 — Journal entries on profiles
8. A4 — Streak tracking

**After that:**
9. B8 — Manual project tagging
10. B4 — API for programmatic uploads
11. A3 — Personal goals/budgets
12. B5 — Weekly digest emails

**Future / Deferred:**
- C1-C6 (major changes, separate projects)
- B6-B7 (community feed, RSS — after journal proves useful)

## Resolved Questions

1. **What's the threshold for teams?** 100 users minimum. Ship personalized guidance first — that's the draw. Teams is the expansion play after guidance proves value.
2. **Should the ccrank binary be a separate repo or monorepo?** Deferred. Decision factors: separate if different language/contributors/release cadence; mono if shared types matter and sole developer. Decide when CLI work actually starts.

## Open Questions

1. **What data does ccusage's session report contain that we're not using?** Could session-level granularity help with guidance (session length → efficiency correlation)?

## References

- Blog post: "GitHub contribution graphs were made for a different era" (provided in chat)
- Existing brainstorms: `docs/brainstorms/2026-02-15-efficiency-metrics-brainstorm.md`
- Database schema: `migrations/0001_initial.sql`
- Current parser: `src/parser.ts`
