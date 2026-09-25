-- Migration: Add thumbnail_key column to courses table.
-- Idempotent: safe to run multiple times.

ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_key TEXT;
