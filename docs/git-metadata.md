# Git Metadata Upload

This adds a personal, opt-in git activity layer to your profile.

## Generate an API token

1. Go to **Settings** → **Git Metadata**.
2. Click **Generate Token** and copy it (you will not see it again).

## Upload git metadata

Use the Go CLI (binary). It supports config-based repo discovery and runs ccusage automatically.

Download the latest release:

- macOS arm64: `ccrank-git_darwin_arm64`
- Linux x64: `ccrank-git_linux_amd64`
- Windows x64: `ccrank-git_windows_amd64.exe`

Run:

```bash
./ccrank-git_darwin_arm64 --url https://your-worker.workers.dev --token YOUR_TOKEN
```

ccusage upload runs automatically (requires Node.js). If Node is missing, install `mise` and run:

```bash
npx ccusage@latest daily --json
```

Config-based repo discovery:

When the CLI runs and `~/.ccrank/repos.json` is missing, it creates the file and prints onboarding instructions (no upload happens until you add repos).

```bash
./ccrank-git_darwin_arm64 --url https://your-worker.workers.dev --token YOUR_TOKEN
```

Populate `~/.ccrank/repos.json` by adding repos from within each project:

```bash
./ccrank-git_darwin_arm64 --add-repo
```

If you run `--add-repo` outside a repo (e.g., a folder like `~/code`), the tool will scan recursively and add the 30 most recently active repos.

### Legacy Node script (optional)

From any git repo you want to track:

```bash
npm run git:upload -- --url https://your-worker.workers.dev --token YOUR_TOKEN
```

Add machine name:

```bash
npm run git:upload -- --url https://your-worker.workers.dev --token YOUR_TOKEN --all --machine laptop
```

Run with ccusage upload too (Node script only):

```bash
npm run git:upload -- --url https://your-worker.workers.dev --token YOUR_TOKEN --all
```

Single repo path:

```bash
./ccrank-git_darwin_arm64 --url https://your-worker.workers.dev --token YOUR_TOKEN --repo /path/to/repo
```

Machine name (defaults to hostname; can be changed on later uploads):

```bash
./ccrank-git_darwin_arm64 --url https://your-worker.workers.dev --token YOUR_TOKEN --machine laptop
```

JSON summary output:

```bash
./ccrank-git_darwin_arm64 --url https://your-worker.workers.dev --token YOUR_TOKEN --json
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
