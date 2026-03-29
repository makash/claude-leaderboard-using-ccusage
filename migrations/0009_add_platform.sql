-- Add platform column to track whether usage is from Claude Code or Codex CLI
ALTER TABLE daily_usage ADD COLUMN platform TEXT NOT NULL DEFAULT 'claude';

-- Drop old unique index and create new one that includes platform
DROP INDEX IF EXISTS idx_daily_usage_user_date_source;
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_usage_user_date_source_platform ON daily_usage(user_id, date, source, platform);
