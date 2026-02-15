-- Add favorite tools column (JSON array of up to 3 strings)
ALTER TABLE users ADD COLUMN fav_tools TEXT NOT NULL DEFAULT '[]';
