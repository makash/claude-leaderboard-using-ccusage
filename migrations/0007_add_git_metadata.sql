-- Add git metadata, tokens, and sharing preferences
ALTER TABLE users ADD COLUMN git_sharing_enabled INTEGER NOT NULL DEFAULT 0;

-- API tokens for CLI uploads
CREATE TABLE IF NOT EXISTS api_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  token_prefix TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  last_used_at TEXT,
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_tokens_hash ON api_tokens(token_hash) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_api_tokens_user ON api_tokens(user_id);

-- Git projects (per user)
CREATE TABLE IF NOT EXISTS git_projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  repo_slug TEXT NOT NULL,
  description TEXT NOT NULL,
  description_override INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_git_projects_user_slug ON git_projects(user_id, repo_slug);

-- Daily commit counts per project
CREATE TABLE IF NOT EXISTS git_daily_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  date TEXT NOT NULL,
  commit_count INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES git_projects(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_git_daily_user_project_date ON git_daily_stats(user_id, project_id, date);
CREATE INDEX IF NOT EXISTS idx_git_daily_user_date ON git_daily_stats(user_id, date);

-- Feedback on git section usefulness
CREATE TABLE IF NOT EXISTS git_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  viewer_id TEXT,
  rating INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_git_feedback_user ON git_feedback(user_id);
