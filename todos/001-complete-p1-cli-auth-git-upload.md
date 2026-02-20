---
status: complete
priority: p1
issue_id: "001"
tags: [auth, api, cli, git-metadata]
dependencies: []
---

# Define CLI authentication for git metadata uploads

## Problem Statement
The plan requires a CLI/agent to upload git metadata to an authenticated endpoint, but there is no defined auth mechanism for non-browser clients. Without a clear token flow, the CLI cannot reliably authenticate, and we risk ad-hoc or insecure workarounds.

## Findings
- Plan calls for `POST /api/git/upload` with auth but does not define how the CLI authenticates.
- Existing auth uses browser session cookies; CLI cannot use these safely.
- No API token or OAuth device flow is described in current docs.

## Proposed Solutions

### Option 1: Personal API token (recommended)

**Approach:** Add a user-generated token in settings (create/revoke). CLI uses `Authorization: Bearer <token>`.

**Pros:**
- Simple and common pattern for CLIs
- Clear security boundary and revocation

**Cons:**
- Requires new UI + storage for tokens

**Effort:** 4-6 hours

**Risk:** Medium

---

### Option 2: One-time auth code + local session file

**Approach:** User logs in via browser, copies a one-time code; CLI exchanges for a short-lived token.

**Pros:**
- Avoids long-lived secrets

**Cons:**
- More complex UX and backend flow

**Effort:** 1-2 days

**Risk:** Medium

---

### Option 3: Reuse session cookie export

**Approach:** CLI reads a locally exported session cookie.

**Pros:**
- Minimal backend changes

**Cons:**
- Fragile and potentially insecure

**Effort:** 1-2 hours

**Risk:** High

## Recommended Action
Implement **Option 1: Personal API token**. Add token create/revoke in settings UI, store only hashed tokens with metadata (created_at, last_used_at), and require `Authorization: Bearer <token>` for `/api/git/upload`. Document the token flow and revocation behavior in the git metadata docs.

## Technical Details
**Affected components:**
- `src/index.ts` (auth middleware and new git upload endpoint)
- `src/html.ts` (settings UI for token create/revoke)
- D1 schema (token storage)

**Database changes:**
- New table for API tokens (hashed) and metadata (created_at, last_used_at)

## Resources
- Plan: `docs/plans/2026-02-20-feat-git-metadata-profiles-plan.md`

## Acceptance Criteria
- [ ] CLI auth mechanism defined and documented
- [ ] Token creation/revocation flow specified
- [ ] Security considerations documented (storage, hashing, revocation)

## Work Log

### 2026-02-20 - Initial Discovery

**By:** Claude Code

**Actions:**
- Reviewed plan for git metadata feature
- Identified missing CLI authentication flow

**Learnings:**
- Existing auth is browser-session based; CLI needs dedicated mechanism

### 2026-02-20 - Implementation

**By:** Claude Code

**Actions:**
- Added API token generation, hashing, and storage
- Implemented token create/revoke endpoints and settings UI
- Added Bearer token auth for git upload endpoint

**Learnings:**
- Token prefix display is enough for token management UX

## Notes
- Strongly prefer token-based approach for MVP
