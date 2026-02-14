# Claude Leaderboard

**Who on your team burns the most Claude tokens?** Find out.

Claude Leaderboard is an open-source, self-hosted app that lets teams track and compare their [Claude Code](https://claude.ai) usage. Users upload [ccusage](https://github.com/ryoppippi/ccusage) reports and compete on a live leaderboard — ranked by cost, tokens, and activity.

Deploy it for your team in under 10 minutes on Cloudflare Workers (free tier).

**Live demo:** [claude-leaderboard.k5e.workers.dev](https://claude-leaderboard.k5e.workers.dev)

---

## Why run this for your team?

If your team uses Claude Code, you probably have no idea who's using it the most, how much it's costing, or whether people are actually getting value from it.

Claude Leaderboard gives you:

- **Visibility** — See who's using Claude, how much, and how often
- **Friendly competition** — Gamified titles (Apprentice → Token Whale → Claude Maximalist) drive adoption
- **Cost awareness** — Everyone sees the dollar amount, which naturally encourages thoughtful usage
- **Team bonding** — "How are you at $500 already?!" is a great conversation starter

It takes 10 minutes to deploy and costs nothing to run on Cloudflare's free tier.

---

## Features

- **Live leaderboard** — Ranked by total cost, with token counts, days active, and last activity
- **Gamified titles** — Users earn titles based on spend: Apprentice, Practitioner, Power User, Token Whale, Claude Maximalist
- **ccusage support** — Parses `daily`, `weekly`, and `session` report formats
- **Google Sign-In** — OAuth 2.0, no passwords to manage
- **Invite-only registration** — Control who joins with invite codes; each user gets 3 to share
- **Admin panel** — Bulk-generate invite codes, view platform stats
- **Safe re-uploads** — Uploading again updates existing dates without duplicating
- **Dark themed UI** — Looks great, works on mobile
- **Zero cost hosting** — Runs entirely on Cloudflare Workers free tier with D1 database

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- A [Cloudflare](https://cloudflare.com) account (free tier works)
- A [Google Cloud](https://console.cloud.google.com) project for OAuth credentials

### 1. Clone and install

```bash
git clone https://github.com/makash/claude-leaderboard.git
cd claude-leaderboard
npm install
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 3. Create the D1 database

```bash
npx wrangler d1 create claude-leaderboard-db
```

Copy the `database_id` from the output into `wrangler.toml`:

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
4. Update `wrangler.toml`:
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
   For `SESSION_SECRET`, use any random string (`openssl rand -hex 32`).

### 6. Deploy

```bash
npm run deploy
```

That's it. Share the URL with your team and start competing.

---

## How to use

### Generate your report

```bash
npx ccusage@latest daily --json > report.json
```

### Upload it

1. Sign in at your leaderboard URL
2. Go to **Upload**
3. Upload the `report.json` file or paste the JSON
4. Check the leaderboard

Re-uploading is safe — existing dates get updated, new dates get added.

### Invite your team

After signing up, you get 3 invite codes to share. Go to **Invites** to generate and copy them. Admins can generate bulk codes from the admin panel.

---

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

Add `http://localhost:8787/auth/google/callback` as an authorized redirect URI in Google Cloud Console for local development.

---

## Project Structure

```
src/
  index.ts      Hono app — routes, middleware, API
  auth.ts       HMAC-SHA256 sessions + Google OAuth
  parser.ts     ccusage JSON parser (daily/weekly/session)
  html.ts       Dark-themed HTML templates (Tailwind CSS)
migrations/
  0001_initial.sql       Database schema
  0002_seed_invites.sql  Seed invite codes
wrangler.toml            Cloudflare Workers config
```

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | Optional | Landing page or dashboard |
| `GET` | `/leaderboard` | No | Leaderboard (public) |
| `GET` | `/upload` | Yes | Upload form |
| `GET` | `/invites` | Yes | Manage invite codes |
| `GET` | `/admin` | Admin | Admin panel |
| `POST` | `/api/upload` | Yes | Upload ccusage JSON |
| `GET` | `/api/leaderboard` | No | Leaderboard JSON API |
| `GET` | `/api/me` | Yes | Current user + stats |
| `POST` | `/api/invites/create` | Yes | Generate invite code |
| `POST` | `/api/admin/invites` | Admin | Bulk-generate codes |

---

## Tech Stack

- **[Hono](https://hono.dev)** — Lightweight web framework for edge
- **[Cloudflare Workers](https://workers.cloudflare.com)** — Serverless compute (free tier)
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** — SQLite at the edge (free tier)
- **[Tailwind CSS](https://tailwindcss.com)** — Utility-first styling via CDN
- **[ccusage](https://github.com/ryoppippi/ccusage)** — Claude Code usage tracking CLI

---

## Built by Akash Mahajan

- [GitHub](https://github.com/makash)
- [X / Twitter](https://x.com/makash)
- [LinkedIn](https://www.linkedin.com/in/akashm/)
- [YouTube](https://www.youtube.com/@makash)

If you deploy this for your team, I'd love to hear about it — [tweet at me](https://x.com/makash)!
