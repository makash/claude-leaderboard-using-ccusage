-- Seed initial invite codes (replace or add as needed)
INSERT OR IGNORE INTO invite_codes (code, created_by, max_uses, use_count) VALUES
  ('CLAUDE-ALPHA-001', NULL, 10, 0),
  ('CLAUDE-ALPHA-002', NULL, 10, 0),
  ('CLAUDE-ALPHA-003', NULL, 10, 0),
  ('CLAUDE-BETA-001', NULL, 5, 0),
  ('CLAUDE-BETA-002', NULL, 5, 0);
