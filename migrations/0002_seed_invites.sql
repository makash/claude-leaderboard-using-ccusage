-- Seed initial invite codes (replace or add as needed)
INSERT OR IGNORE INTO invite_codes (code, created_by, max_uses, use_count) VALUES
  ('CLAUDE-UP-BCE83479', NULL, 10, 0),
  ('CLAUDE-AE495190', NULL, 10, 0),
  ('CLAUDE-BETA-002', NULL, 1, 0);
