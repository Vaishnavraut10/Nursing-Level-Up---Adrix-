-- Migration: Add DELETED state to course_status enum.
-- Idempotent: safe to run multiple times.

DO $$ BEGIN
  ALTER TYPE course_status ADD VALUE 'DELETED';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE courses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
