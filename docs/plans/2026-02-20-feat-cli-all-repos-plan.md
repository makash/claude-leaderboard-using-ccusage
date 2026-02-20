---
title: feat: CLI all-repos + machine name
status: active
type: feat
date: 2026-02-20
---

# ✨ feat: CLI all-repos + machine name

## Overview
Extend the Go CLI so one command can upload git metadata for all repos (`--all-repos`) or a specific repo (`--repo <path>`), mirroring ccusage directory detection. Add a machine name option that defaults to hostname and flows through both git metadata and ccusage uploads. This removes manual per‑repo runs and ensures multi‑machine attribution matches the existing UI.

## Problem Statement / Motivation
Users run Claude on multiple projects and multiple machines. The current CLI only uploads the current repo, and machine name must be entered manually in the UI. A multi‑repo + machine‑aware CLI makes uploading accurate and effortless.

## Proposed Solution
- Add `--all-repos` to scan ccusage‑style directories and upload metadata for each valid git repo.
- Add `--repo <path>` to target a single repo.
- Add `--machine` (default hostname) and include it in git metadata and ccusage uploads.
- Deduplicate repos by remote URL, fallback to path.
- Print a summary at the end: scanned, git repos, uploaded, skipped, errors.

## Technical Considerations
- **Directory detection**: mirror ccusage defaults (`~/.config/claude/projects`, legacy `~/.claude/projects`, and `CLAUDE_CONFIG_DIR` comma‑separated).
- **Error handling**: skip local repo errors, fail on upload errors.
- **Security**: avoid reading beyond required repo metadata; `.git/config` only for identity.
- **Performance**: batch git metadata into a single upload where possible.
- **Machine attribution**: include `machine` in both git metadata and ccusage uploads.

## Technical Approach

### CLI Flags & Inputs
- `--all-repos`: scan detected Claude projects directories.
- `--repo <path>`: single repo upload (overrides scan).
- `--machine <name>`: optional; defaults to hostname.
- `--all`: still runs ccusage after git upload; pass `source`/`machine`.

### Directory Detection (ccusage‑aligned)
- Default search roots:
  - `~/.config/claude/projects/`
  - `~/.claude/projects/`
- `CLAUDE_CONFIG_DIR` (comma‑separated) adds additional roots.
- For each entry inside roots: treat entry path as repo path.

### Repo Identity & Deduping
- For a repo path, read `.git/config` to extract the first `url` under `remote "origin"` (fallback to any remote).
- Dedup by remote URL if found; fallback to repo path.
- Non‑git directories are skipped with a recorded warning.

### Machine Name Propagation
- Git upload payload: include `machine` string per project or per request.
- ccusage upload payload: include `source` and `machine` (match UI “machine name” input).

### Upload Strategy
- Aggregate git metadata for all repos into one request.
- If any upload request fails, exit non‑zero.

### Error Handling & Summary
- Local repo errors: collect, continue scanning.
- Upload errors: fail fast.
- Print summary: `scanned`, `git repos`, `uploaded`, `skipped`, `errors`.

## Acceptance Criteria
- [x] `--all-repos` scans Claude project directories and uploads git metadata for all valid git repos.
- [x] `--repo <path>` uploads metadata only for that repo.
- [x] Non‑git entries are skipped without failing the run.
- [x] Duplicate repos are deduped by remote URL (fallback to path).
- [x] `--machine` defaults to hostname and is included in git + ccusage uploads.
- [x] `--all` still works (git + ccusage) and includes machine name in the ccusage payload.
- [x] CLI prints a summary of scanned/skipped/uploaded repos.
- [x] CLI supports `--json` summary output for scripting.

## SpecFlow Analysis (User Flows & Gaps)

### User Flow Overview
1. User runs CLI with `--all-repos` → scan directories → upload.
2. User runs CLI with `--repo /path` → upload single repo.
3. User runs CLI with `--all` → git upload then ccusage upload with machine name.

### Missing Elements & Gaps
- **Machine name format**: define allowed characters (match UI rules).
- **Dedup preference**: confirm which remote URL to prefer if multiple remotes exist.
- **Summary format**: define output format for CI/log parsing (text vs JSON).

### Critical Questions
- None.

## Success Metrics
- Reduced manual machine‑name usage in UI (measured by upload payloads).
- Higher % of users uploading from multiple repos.

## Dependencies & Risks
- Requires consistent directory detection across environments.
- Incorrect path mapping could cause skipped repos; summary should make this visible.

## References & Research
- `docs/brainstorms/2026-02-20-cli-all-repos-brainstorm.md`
- `cli/ccrank-git/main.go`
- `docs/git-metadata.md`
