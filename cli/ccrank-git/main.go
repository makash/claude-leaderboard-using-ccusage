package main

import (
  "bytes"
  "encoding/json"
  "errors"
  "flag"
  "fmt"
  "io"
  "net/http"
  "os"
  "os/exec"
  "path/filepath"
  "regexp"
  "strings"
  "time"
)

type Day struct {
  Date        string `json:"date"`
  CommitCount int    `json:"commitCount"`
}

type Project struct {
  RepoName            string `json:"repoName"`
  RepoSlug            string `json:"repoSlug"`
  Description         string `json:"description"`
  DescriptionOverride bool   `json:"descriptionOverride"`
  Days                []Day  `json:"days"`
}

type Payload struct {
  Machine  string    `json:"machine,omitempty"`
  Projects []Project `json:"projects"`
}

func main() {
  urlFlag := flag.String("url", "", "Base URL of the leaderboard (e.g., https://ccrank.dev)")
  tokenFlag := flag.String("token", "", "API token from Settings → Git Metadata")
  descFlag := flag.String("description", "", "Optional description override")
  allRepos := flag.Bool("all-repos", false, "Upload git metadata for all Claude projects")
  repoFlag := flag.String("repo", "", "Upload git metadata for a single repo path")
  machineFlag := flag.String("machine", "", "Machine name (defaults to hostname)")
  allFlag := flag.Bool("all", false, "Also run ccusage and upload usage report")
  jsonSummary := flag.Bool("json", false, "Print summary as JSON")
  dryRun := flag.Bool("dry-run", false, "Print payload JSON without uploading")
  flag.Parse()

  machine := strings.TrimSpace(*machineFlag)
  if machine == "" {
    if host, err := os.Hostname(); err == nil {
      machine = host
    }
  }

  var repos []string
  if strings.TrimSpace(*repoFlag) != "" {
    repos = []string{strings.TrimSpace(*repoFlag)}
  } else if *allRepos {
    repos = discoverRepos()
  } else {
    repos = []string{mustWd()}
  }

  payload, summary, err := buildPayload(repos, *descFlag, machine)
  if err != nil {
    fmt.Fprintln(os.Stderr, err.Error())
    os.Exit(1)
  }

  if *dryRun || *urlFlag == "" || *tokenFlag == "" {
    out, _ := json.MarshalIndent(payload, "", "  ")
    fmt.Println(string(out))
    if !*dryRun {
      fmt.Fprintln(os.Stderr, "Missing --url or --token. Use --dry-run to inspect payload.")
    }
    return
  }

  err = uploadPayload(*urlFlag, *tokenFlag, payload)
  if err != nil {
    fmt.Fprintln(os.Stderr, "Upload failed:", err.Error())
    os.Exit(1)
  }

  fmt.Println("Upload complete")

  if *allFlag {
    report, err := runCcusage()
    if err != nil {
      fmt.Fprintln(os.Stderr, "ccusage failed:", err.Error())
      os.Exit(1)
    }
    err = uploadCcusage(*urlFlag, *tokenFlag, report, machine)
    if err != nil {
      fmt.Fprintln(os.Stderr, "ccusage upload failed:", err.Error())
      os.Exit(1)
    }
    fmt.Println("ccusage upload complete")
  }

  printSummary(summary, *jsonSummary)
}

func mustWd() string {
  wd, err := os.Getwd()
  if err != nil {
    fmt.Fprintln(os.Stderr, "Unable to determine working directory")
    os.Exit(1)
  }
  return wd
}

func getCommitCounts(repoPath string) ([]Day, error) {
  cmd := exec.Command("git", "-C", repoPath, "log", "--since=28 days ago", "--pretty=format:%ad", "--date=short")
  output, err := cmd.Output()
  if err != nil {
    return nil, errors.New("failed to run git log (are you in a git repo?)")
  }

  counts := map[string]int{}
  lines := strings.Split(strings.TrimSpace(string(output)), "\n")
  for _, line := range lines {
    if line == "" {
      continue
    }
    counts[line] += 1
  }

  dates := lastNDates(28)
  days := make([]Day, 0, len(dates))
  for _, date := range dates {
    days = append(days, Day{Date: date, CommitCount: counts[date]})
  }
  return days, nil
}

func lastNDates(n int) []string {
  dates := make([]string, 0, n)
  today := time.Now()
  for i := n - 1; i >= 0; i-- {
    d := today.AddDate(0, 0, -i)
    dates = append(dates, d.Format("2006-01-02"))
  }
  return dates
}

func readReadmeTitle(repoPath string) string {
  candidates := []string{"README.md", "readme.md"}
  for _, name := range candidates {
    full := filepath.Join(repoPath, name)
    if _, err := os.Stat(full); err == nil {
      contents, err := os.ReadFile(full)
      if err != nil {
        continue
      }
      for _, line := range strings.Split(string(contents), "\n") {
        if strings.HasPrefix(line, "# ") {
          return strings.TrimSpace(strings.TrimPrefix(line, "# "))
        }
      }
    }
  }
  return ""
}

func slugify(input string) string {
  lower := strings.ToLower(input)
  re := regexp.MustCompile(`[^a-z0-9]+`)
  slug := re.ReplaceAllString(lower, "-")
  slug = strings.Trim(slug, "-")
  if len(slug) > 50 {
    slug = slug[:50]
  }
  if slug == "" {
    return "repo"
  }
  return slug
}

func uploadPayload(baseURL, token string, payload Payload) error {
  baseURL = strings.TrimRight(baseURL, "/")
  endpoint := baseURL + "/api/git/upload"

  body, err := json.Marshal(payload)
  if err != nil {
    return err
  }

  req, err := http.NewRequest("POST", endpoint, bytes.NewReader(body))
  if err != nil {
    return err
  }
  req.Header.Set("Content-Type", "application/json")
  req.Header.Set("Authorization", "Bearer "+token)

  client := &http.Client{Timeout: 15 * time.Second}
  res, err := client.Do(req)
  if err != nil {
    return err
  }
  defer res.Body.Close()

  respBody, _ := io.ReadAll(res.Body)
  if res.StatusCode < 200 || res.StatusCode >= 300 {
    return fmt.Errorf("%s", strings.TrimSpace(string(respBody)))
  }

  var parsed map[string]any
  if err := json.Unmarshal(respBody, &parsed); err == nil {
    if ok, found := parsed["ok"].(bool); found && !ok {
      return fmt.Errorf("%s", strings.TrimSpace(string(respBody)))
    }
  }

  return nil
}

func runCcusage() (string, error) {
  cmd := exec.Command("npx", "ccusage@latest", "daily", "--json")
  out, err := cmd.Output()
  if err != nil {
    return "", errors.New("failed to run `npx ccusage@latest daily --json` (is Node installed?)")
  }
  return string(out), nil
}

func uploadCcusage(baseURL, token, report, machine string) error {
  baseURL = strings.TrimRight(baseURL, "/")
  endpoint := baseURL + "/api/upload"

  source := strings.TrimSpace(machine)
  if source == "" {
    source = "default"
  }
  payload := map[string]any{
    "json":   report,
    "source": source,
  }
  body, err := json.Marshal(payload)
  if err != nil {
    return err
  }

  req, err := http.NewRequest("POST", endpoint, bytes.NewReader(body))
  if err != nil {
    return err
  }
  req.Header.Set("Content-Type", "application/json")
  req.Header.Set("Authorization", "Bearer "+token)

  client := &http.Client{Timeout: 20 * time.Second}
  res, err := client.Do(req)
  if err != nil {
    return err
  }
  defer res.Body.Close()

  respBody, _ := io.ReadAll(res.Body)
  if res.StatusCode < 200 || res.StatusCode >= 300 {
    return fmt.Errorf("%s", strings.TrimSpace(string(respBody)))
  }

  return nil
}

type Summary struct {
  Scanned   int      `json:"scanned"`
  GitRepos  int      `json:"git_repos"`
  Uploaded  int      `json:"uploaded"`
  Skipped   int      `json:"skipped"`
  Errors    []string `json:"errors"`
  Duplicates int     `json:"duplicates"`
}

func buildPayload(repoPaths []string, descriptionOverride string, machine string) (Payload, Summary, error) {
  summary := Summary{Errors: []string{}}
  seen := map[string]bool{}
  projects := []Project{}

  for _, repoPath := range repoPaths {
    summary.Scanned += 1
    repoPath = strings.TrimSpace(repoPath)
    if repoPath == "" {
      summary.Skipped += 1
      continue
    }

    if !isGitRepo(repoPath) {
      summary.Skipped += 1
      continue
    }

    identity := repoPath
    if remote := gitRemoteURL(repoPath); remote != "" {
      identity = remote
    }
    if seen[identity] {
      summary.Duplicates += 1
      continue
    }
    seen[identity] = true

    repoName := filepath.Base(repoPath)
    repoSlug := slugify(repoName)
    description := strings.TrimSpace(descriptionOverride)
    if description == "" {
      description = readReadmeTitle(repoPath)
    }
    if description == "" {
      description = repoName
    }

    days, err := getCommitCounts(repoPath)
    if err != nil {
      summary.Errors = append(summary.Errors, fmt.Sprintf("%s: %s", repoPath, err.Error()))
      summary.Skipped += 1
      continue
    }

    projects = append(projects, Project{
      RepoName:            repoName,
      RepoSlug:            repoSlug,
      Description:         description,
      DescriptionOverride: descriptionOverride != "",
      Days:                days,
    })
    summary.GitRepos += 1
  }

  payload := Payload{
    Machine:  strings.TrimSpace(machine),
    Projects: projects,
  }

  summary.Uploaded = len(projects)
  if len(projects) == 0 {
    return payload, summary, errors.New("no valid git repos found to upload")
  }
  return payload, summary, nil
}

func printSummary(summary Summary, asJSON bool) {
  if asJSON {
    out, _ := json.MarshalIndent(summary, "", "  ")
    fmt.Println(string(out))
    return
  }

  fmt.Printf("Summary: scanned=%d git_repos=%d uploaded=%d skipped=%d duplicates=%d\n",
    summary.Scanned, summary.GitRepos, summary.Uploaded, summary.Skipped, summary.Duplicates)
  if len(summary.Errors) > 0 {
    fmt.Println("Errors:")
    for _, err := range summary.Errors {
      fmt.Printf("- %s\n", err)
    }
  }
}

func discoverRepos() []string {
  roots := []string{}
  if home, err := os.UserHomeDir(); err == nil {
    roots = append(roots, filepath.Join(home, ".config", "claude", "projects"))
    roots = append(roots, filepath.Join(home, ".claude", "projects"))
  }

  env := os.Getenv("CLAUDE_CONFIG_DIR")
  if env != "" {
    parts := strings.Split(env, ",")
    for _, part := range parts {
      p := strings.TrimSpace(part)
      if p == "" {
        continue
      }
      if strings.HasSuffix(p, "projects") {
        roots = append(roots, p)
      } else {
        roots = append(roots, filepath.Join(p, "projects"))
      }
    }
  }

  seen := map[string]bool{}
  repos := []string{}
  for _, root := range roots {
    if root == "" || seen[root] {
      continue
    }
    seen[root] = true
    entries, err := os.ReadDir(root)
    if err != nil {
      continue
    }
    for _, entry := range entries {
      if entry.IsDir() || (entry.Type()&os.ModeSymlink) != 0 {
        repos = append(repos, filepath.Join(root, entry.Name()))
      }
    }
  }
  return repos
}

func isGitRepo(repoPath string) bool {
  cmd := exec.Command("git", "-C", repoPath, "rev-parse", "--is-inside-work-tree")
  out, err := cmd.Output()
  if err != nil {
    return false
  }
  return strings.TrimSpace(string(out)) == "true"
}

func gitRemoteURL(repoPath string) string {
  cmd := exec.Command("git", "-C", repoPath, "config", "--get", "remote.origin.url")
  out, err := cmd.Output()
  if err == nil {
    url := strings.TrimSpace(string(out))
    if url != "" {
      return url
    }
  }

  remotesCmd := exec.Command("git", "-C", repoPath, "remote")
  remotesOut, err := remotesCmd.Output()
  if err != nil {
    return ""
  }
  remotes := strings.Split(strings.TrimSpace(string(remotesOut)), "\n")
  if len(remotes) == 0 || remotes[0] == "" {
    return ""
  }
  name := remotes[0]
  cmd = exec.Command("git", "-C", repoPath, "config", "--get", "remote."+name+".url")
  out, err = cmd.Output()
  if err != nil {
    return ""
  }
  return strings.TrimSpace(string(out))
}
