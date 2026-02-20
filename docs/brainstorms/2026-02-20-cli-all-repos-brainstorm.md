---
date: 2026-02-20
topic: cli-all-repos
---

# CLI: All Repos + Machine Name

## What We're Building
Extend the CLI binary to support `--all-repos` and `--repo <path>`, so one command can upload git metadata for many repos (or a specific path). The scan should mirror ccusage’s directory detection: `~/.config/claude/projects/`, legacy `~/.claude/projects/`, and any locations in `CLAUDE_CONFIG_DIR` (comma-separated). Each entry is treated as a repo path; non-git directories are skipped. The CLI should also include a machine name (auto from hostname, override with `--machine`) so users can upload from multiple devices and servers, and pass the same machine name into ccusage uploads to match the existing “machine name” field in the UI.

## Why This Approach
Mirroring ccusage’s directory detection keeps behavior consistent with existing Claude tooling and avoids bespoke config. Treating each project directory as a repo path is simple and aligns with the user’s Claude setup. Auto machine naming with an override keeps usage friction low while enabling multi-machine aggregation.

## Key Decisions
- `--all-repos` scans ccusage-style directories and uploads all valid git repos in one run.
- Support `--repo <path>` for single-repo uploads.
- Skip non-git directories gracefully.
- Machine name defaults to hostname; override with `--machine`.
- Use `.git/config` for repo identity once a repo path is confirmed.
- Deduplicate by remote URL if available; fallback to repo path.
- Error handling: skip local repo errors, but fail on upload errors.
- Machine name flows through both git uploads and ccusage uploads.

## Resolved Questions
- Directory detection mirrors ccusage defaults + `CLAUDE_CONFIG_DIR`.
- Treat each project directory as the repo path itself; skip if not a git repo.
- Provide `--repo` for explicit single-path uploads.
- Machine name is auto with override flag.
- Deduplication: by remote URL, else repo path.
- Errors: continue on local repo errors; fail on upload errors.
- Machine name should be included for ccusage uploads to align with the existing upload UI.

## Open Questions
- None.

## Next Steps
→ `/prompts:workflows-plan` for implementation details.
