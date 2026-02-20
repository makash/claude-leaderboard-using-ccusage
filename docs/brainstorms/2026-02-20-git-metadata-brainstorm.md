---
date: 2026-02-20
topic: git-metadata
---

# Git Metadata on Profiles

## What We're Building
Add git metadata to user profiles to make usage more personal and show whether Claude usage “moved the needle.” A CLI/agent will collect git stats from local repo logs and upload a per‑project time series (last 28 days, daily buckets) plus a project summary (name + description). The profile will show an aggregate view (commit velocity + streak + trend lines for git activity and Claude usage) and allow drill‑down into individual projects on the same page. Users can toggle git metadata visibility independently from overall profile sharing.

## Why This Approach
We chose a time series upload so we can show trends rather than a static snapshot. This aligns with the product goal (“moved the needle”) and supports drill‑down per project while still enabling an aggregate view. The data stays bounded (28 days) and compact while delivering a more meaningful story. We will show git and Claude usage trends side‑by‑side without a computed correlation metric to avoid misleading signals.

## Key Decisions
- Collect git data via CLI/agent upload: keeps data collection local to each repo and avoids server‑side git access.
- Store per‑project daily time series for last 28 days: enables commit velocity and trend visualization.
- Show aggregate + drill‑down on the same profile page: aggregate headline metrics plus project‑level detail.
- Separate visibility toggle for git metadata: allows public profiles while keeping git data private.
- Project description is auto‑derived from repo (e.g., README title) but editable by user.
- Add lightweight feedback widget (thumbs up/down) to iterate on usefulness.
- No explicit correlation metric: show git and ccusage trends side‑by‑side.
- Streak definition: consecutive days with any commit activity.

## Resolved Questions
- Correlation: no explicit metric, just side‑by‑side trends.
- Granularity: daily buckets for last 28 days.
- Streak: daily streak.
- Aggregate vs per‑project: single profile page with sections.

## Open Questions
- How is commit velocity defined (commits/day, active days, or rolling average)?
- How should aggregate metrics be computed across projects (sum, average, weighted)?

## Next Steps
→ `/prompts:workflows-plan` for implementation details.
