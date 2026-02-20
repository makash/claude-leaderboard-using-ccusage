---
status: complete
priority: p2
issue_id: "002"
tags: [validation, api, git-metadata]
dependencies: []
---

# Define git upload schema and limits

## Problem Statement
The plan references a git metadata upload endpoint but does not define the payload schema, validation rules, or size limits. Without this, implementations may diverge and data quality could suffer.

## Findings
- Plan mentions daily time series + project summary but no concrete JSON schema.
- No size limits, max projects per upload, or validation rules defined.
- This impacts both CLI implementation and backend validation.

## Proposed Solutions

### Option 1: Explicit JSON schema in docs + server validation

**Approach:** Define a strict JSON schema (projects, daily series, descriptions) and validate on upload.

**Pros:**
- Clear contract for CLI and server
- Prevents malformed data

**Cons:**
- Slightly more upfront design work

**Effort:** 2-4 hours

**Risk:** Low

---

### Option 2: Minimal schema with permissive validation

**Approach:** Accept flexible payload, normalize server-side.

**Pros:**
- Faster initial implementation

**Cons:**
- Higher risk of inconsistent data

**Effort:** 1-2 hours

**Risk:** Medium

## Recommended Action
Implement **Option 1: explicit JSON schema + server validation**. Document the payload (projects + daily series + description) with an example, enforce max projects per upload, fixed 28-day arrays, and a max payload size. Return clear validation errors to the CLI.

## Technical Details
**Affected components:**
- `src/index.ts` (upload endpoint validation)
- CLI/agent schema export
- Documentation (`README.md` or `docs/git-metadata.md`)

**Database changes:**
- None directly, but schema should map 1:1 to tables

## Resources
- Plan: `docs/plans/2026-02-20-feat-git-metadata-profiles-plan.md`

## Acceptance Criteria
- [ ] JSON schema documented with example payload
- [ ] Server validates payload and returns clear errors
- [ ] Limits defined (max projects, max days, max payload size)

## Work Log

### 2026-02-20 - Initial Discovery

**By:** Claude Code

**Actions:**
- Reviewed plan for missing contract details
- Identified schema/limit gaps

**Learnings:**
- Contract clarity will reduce CLI/server mismatch

### 2026-02-20 - Implementation

**By:** Claude Code

**Actions:**
- Implemented strict upload validation (project count, 28-day series, date format, commit counts)
- Added server-side enforcement and retention trimming
- Documented payload expectations in CLI docs

**Learnings:**
- Keeping payload schema fixed reduces ambiguity for CLI users

## Notes
- Consider daily array length fixed to 28 for simplicity
