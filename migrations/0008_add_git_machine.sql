-- Add machine to git daily stats and update uniqueness
ALTER TABLE git_daily_stats ADD COLUMN machine TEXT NOT NULL DEFAULT 'default';

DROP INDEX IF EXISTS idx_git_daily_user_project_date;
CREATE UNIQUE INDEX IF NOT EXISTS idx_git_daily_user_project_date_machine ON git_daily_stats(user_id, project_id, date, machine);
CREATE INDEX IF NOT EXISTS idx_git_daily_user_machine_date ON git_daily_stats(user_id, machine, date);
