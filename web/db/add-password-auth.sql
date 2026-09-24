-- Migration: Add password_hash column for email/password authentication.
-- Idempotent: safe to run multiple times.

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Index for faster email lookups (already exists but included for completeness)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
