# Claude Leaderboard

Track and compare Claude Code usage across your team. Users upload their [ccusage](https://github.com/ryoppippi/ccusage) reports and compete on a leaderboard.

Built on Cloudflare Workers with D1, Google OAuth, and invite-only registration.

## Features

- **Leaderboard** — Ranks users by total cost, tokens, output tokens, and days active
- **ccusage parsing** — Supports `daily`, `weekly`, and `session` report formats
- **Google Sign-In** — OAuth 2.0 social login
- **Invite-only** — Users need an invite code to register; registered users get 3 invite codes to share
- **Admin panel** — Bulk-generate invite codes, view platform stats
- **Upsert uploads** — Re-uploading safely updates existing dates without duplicating

## Prerequisites

- [Node.js](https://nodejs.org) v18+
- A [Cloudflare](https://cloudflare.com) account
- A [Google Cloud](https://console.cloud.google.com) project for OAuth credentials

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 3. Create a D1 database

```bash
npx wrangler d1 create claude-leaderboard-db
```

Copy the `database_id` from the output and update it in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "claude-leaderboard-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 4. Run migrations

```bash
npm run db:migrate       # create tables
npm run db:seed          # seed initial invite codes
```

### 5. Set up Google OAuth

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. Create a new **OAuth 2.0 Client ID** (Web application)
3. Add your worker URL as an authorized redirect URI:
   ```
   https://your-worker.your-subdomain.workers.dev/auth/google/callback
   ```
4. Update `wrangler.toml` with your client ID and admin email:
   ```toml
   [vars]
   GOOGLE_CLIENT_ID = "your-client-id.apps.googleusercontent.com"
   ADMIN_EMAIL = "you@gmail.com"
   ```
5. Set secrets:
   ```bash
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   npx wrangler secret put SESSION_SECRET
   ```
   For `SESSION_SECRET`, use any random string (e.g. `openssl rand -hex 32`).

### 6. Deploy

```bash
npm run deploy
```

## Local Development

```bash
# Run migrations locally
npm run db:migrate:local
npm run db:seed:local

# Create a .dev.vars file for local secrets
cat > .dev.vars << 'EOF'
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_SECRET=dev-secret-change-me
ADMIN_EMAIL=you@gmail.com
EOF

# Start dev server
npm run dev
```

For local development, add `http://localhost:8787/auth/google/callback` as an authorized redirect URI in Google Cloud Console.

## Usage

### Generating a ccusage report

```bash
npx ccusage@latest daily --json > report.json
```

### Uploading

1. Sign in at your deployed worker URL
2. Go to **Upload**
3. Either upload the `report.json` file or paste the JSON contents
4. Your data appears on the leaderboard

Re-uploading is safe — existing dates get updated, new dates get added.

### Invite codes

The seed migration creates these initial codes (each usable 10 times):

- `CLAUDE-ALPHA-001`
- `CLAUDE-ALPHA-002`
- `CLAUDE-ALPHA-003`
- `CLAUDE-BETA-001` (5 uses)
- `CLAUDE-BETA-002` (5 uses)

After registering, each user gets 3 invite codes to generate and share. Admins can generate bulk codes from the admin panel.

## Project Structure

```
src/
  index.ts      Hono app — all routes (pages + API)
  auth.ts       HMAC-SHA256 session tokens + Google OAuth
  parser.ts     ccusage JSON parser (daily/weekly/session)
  html.ts       Dark-themed HTML templates with Tailwind CSS
migrations/
  0001_initial.sql       Database schema
  0002_seed_invites.sql  Seed invite codes
wrangler.toml            Cloudflare Workers config
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Optional | Landing page or dashboard |
| `GET` | `/leaderboard` | No | Leaderboard page |
| `GET` | `/upload` | Yes | Upload form |
| `GET` | `/invites` | Yes | Manage invite codes |
| `GET` | `/admin` | Admin | Admin panel |
| `POST` | `/api/upload` | Yes | Upload ccusage JSON |
| `GET` | `/api/leaderboard` | No | Leaderboard data (JSON) |
| `GET` | `/api/me` | Yes | Current user + stats |
| `POST` | `/api/invites/create` | Yes | Generate an invite code |
| `POST` | `/api/admin/invites` | Admin | Bulk-generate invite codes |
