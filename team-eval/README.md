# AIRank - AI Usage Analytics & Team Evaluation

Track, rank, and evaluate your team's Claude and Codex AI usage. Self-hosted, open-source, and designed for engineering teams.

## What is AIRank?

AIRank is a self-hosted platform that helps engineering teams track how they use AI coding tools (Claude and OpenAI Codex), evaluate proficiency, and create a friendly competitive leaderboard. Think of it as a "Strava for AI-assisted development."

### Key Features

- **Claude Usage Tracking** - Token consumption, costs, cache rates, model breakdown
- **Codex Task Tracking** - Task completion, success rates, efficiency metrics
- **Team Leaderboard** - Gamified ranking with title tiers (Getting Started → AI Architect)
- **Structured Evaluations** - 5-dimension scoring: Claude, Codex, Productivity, Quality, Overall
- **Team Management** - Organizations, teams, roles (Owner/Admin/Manager/Member)
- **Analytics Dashboard** - Org-wide and per-team usage reports
- **Self-Hosted** - Your data stays on your infrastructure
- **API-First** - Upload usage data via REST API from CLI tools or CI/CD

## Quick Start

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/YOUR_ORG/airank.git
cd airank
docker-compose up -d
```

Open http://localhost:3000 and complete the setup wizard.

### Option 2: Manual Setup

**Prerequisites**: Node.js 18+, PostgreSQL 14+

```bash
git clone https://github.com/YOUR_ORG/airank.git
cd airank
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma db push
npm run dev
```

Open http://localhost:3000/setup to create your organization.

## How It Works

1. **Admin sets up** - Creates org via setup wizard on first visit
2. **Admin adds members** - Creates accounts with temporary passwords
3. **Members sign in** - Change password, view dashboard
4. **Upload usage data** - Via API with Bearer token authentication
5. **Track & compete** - Leaderboard updates, titles earned
6. **Evaluate** - Managers score members on AI proficiency

## Uploading Usage Data

### Claude Usage (ccusage format)
```bash
curl -X POST https://your-airank.com/api/upload/claude \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @ccusage-output.json
```

### Codex Usage
```bash
curl -X POST https://your-airank.com/api/upload/codex \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-03-22","tasks_completed":15,"tasks_failed":2,"tokens_used":120000,"cost_usd":12.50}'
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Credentials) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Deployment | Docker / Vercel |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | App URL (e.g., http://localhost:3000) |
| `NEXTAUTH_SECRET` | Yes | Random secret (`openssl rand -hex 32`) |
| `GOOGLE_CLIENT_ID` | No | Optional Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | Optional Google OAuth |

## Title System

Members earn titles based on cumulative AI spend:

| Spend | Title | Badge |
|-------|-------|-------|
| < $25 | Getting Started | 🌱 |
| $25 - $100 | Active User | 🚀 |
| $100 - $500 | Heavy Hitter | 🎯 |
| $500 - $1,000 | Power User | ⚡ |
| $1,000+ | AI Architect | 👑 |

## Evaluation Dimensions

Managers evaluate team members across 5 dimensions (scored 1-10):

1. **Claude Proficiency** - Prompt quality, context management, tool usage
2. **Codex Proficiency** - Task scoping, review quality, iteration speed
3. **Productivity Impact** - How AI improves output
4. **Work Quality** - Quality of AI-assisted deliverables
5. **Overall** - Holistic AI proficiency rating

## Deploy to Vercel

1. Fork this repository
2. Import in [Vercel](https://vercel.com)
3. Add a PostgreSQL database (Vercel Postgres or external)
4. Set environment variables
5. Deploy

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

## License

MIT
