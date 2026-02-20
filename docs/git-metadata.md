# Git Metadata Upload

This adds a personal, opt-in git activity layer to your profile.

## Generate an API token

1. Go to **Settings** → **Git Metadata**.
2. Click **Generate Token** and copy it (you will not see it again).

## Upload git metadata

You can use either the Node script (fastest) or the Go CLI (native binary).

### Node (scripts)

From any git repo you want to track:

```bash
npm run git:upload -- --url https://your-worker.workers.dev --token YOUR_TOKEN
```

Run with ccusage upload too:

```bash
npm run git:upload -- --url https://your-worker.workers.dev --token YOUR_TOKEN --all
```

Add machine name:

```bash
npm run git:upload -- --url https://your-worker.workers.dev --token YOUR_TOKEN --all --machine laptop
```

### Go CLI (binary)

Download the latest release:

- macOS arm64: `ccrank-git_darwin_arm64`
- Linux x64: `ccrank-git_linux_amd64`
- Windows x64: `ccrank-git_windows_amd64.exe`

Run:

```bash
./ccrank-git_darwin_arm64 --url https://your-worker.workers.dev --token YOUR_TOKEN
```

Run with ccusage upload too:

```bash
./ccrank-git_darwin_arm64 --url https://your-worker.workers.dev --token YOUR_TOKEN --all
```

Note: `--all` requires Node.js (it runs `npx ccusage@latest`).

All repos mode (mirrors ccusage directory detection):

```bash
./ccrank-git_darwin_arm64 --url https://your-worker.workers.dev --token YOUR_TOKEN --all-repos
```

This scans:
- `~/.config/claude/projects/`
- `~/.claude/projects/`
- plus any directories in `CLAUDE_CONFIG_DIR` (comma-separated)

Single repo path:

```bash
./ccrank-git_darwin_arm64 --url https://your-worker.workers.dev --token YOUR_TOKEN --repo /path/to/repo
```

Machine name (defaults to hostname):

```bash
./ccrank-git_darwin_arm64 --url https://your-worker.workers.dev --token YOUR_TOKEN --all-repos --machine laptop
```

JSON summary output:

```bash
./ccrank-git_darwin_arm64 --url https://your-worker.workers.dev --token YOUR_TOKEN --all-repos --json
```

Build from source (optional):

```bash
cd cli/ccrank-git
go build -o ccrank-git .
```

Optional:

- `--description "My project"` to override the README title
- `--dry-run` to print the JSON payload without uploading

## What gets uploaded

- Repo name and description
- Last 28 days of commit counts (daily)

No raw commit messages or diffs are uploaded.
