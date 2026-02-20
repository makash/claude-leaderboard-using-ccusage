---
status: complete
priority: p2
issue_id: "003"
tags: [ux, profile, git-metadata]
dependencies: []
---

# Define project description editing flow

## Problem Statement
The plan states that project descriptions are auto-derived but editable. The UX for editing (when, where, and how changes persist) is not defined, which impacts both profile UI and upload flow.

## Findings
- No defined place for users to edit project descriptions after upload.
- Unclear whether edits should be stored per project or overwritten by future uploads.
- Potential conflict between auto-derived values and user overrides.

## Proposed Solutions

### Option 1: Edit in settings (recommended)

**Approach:** Add a project list in settings where users can edit descriptions; store override flag.

**Pros:**
- Clear, centralized editing
- Stable across uploads

**Cons:**
- Requires additional settings UI

**Effort:** 4-6 hours

**Risk:** Low

---

### Option 2: Edit during upload

**Approach:** CLI accepts a description flag and server always overwrites.

**Pros:**
- Simple UI (no web edits)

**Cons:**
- Hard to change without re-upload

**Effort:** 1-2 hours

**Risk:** Medium

## Recommended Action
Implement **Option 1: edit in settings**. Add a project list in settings with editable descriptions. Persist overrides in the git projects table with a `description_override` flag (or `description_source`) so future uploads do not overwrite user edits unless explicitly reset.

## Technical Details
**Affected components:**
- `src/html.ts` (settings UI)
- `src/index.ts` (update endpoint)
- Git project table (description + optional override flag)

**Database changes:**
- Optional `description_source` or `description_override` column

## Resources
- Plan: `docs/plans/2026-02-20-feat-git-metadata-profiles-plan.md`

## Acceptance Criteria
- [ ] Editing flow defined (UI location + persistence behavior)
- [ ] Clear rule for auto-derived vs user override
- [ ] Edits survive future uploads as intended

## Work Log

### 2026-02-20 - Initial Discovery

**By:** Claude Code

**Actions:**
- Reviewed plan for editable description details
- Identified missing UX + persistence rules

**Learnings:**
- Editing flow affects both API and data model

### 2026-02-20 - Implementation

**By:** Claude Code

**Actions:**
- Added settings UI to edit project descriptions
- Implemented update endpoint to store overrides
- Added override flag handling during uploads

**Learnings:**
- Keeping overrides server-side prevents CLI uploads from clobbering user edits

## Notes
- Choose a default behavior and document it in the plan
