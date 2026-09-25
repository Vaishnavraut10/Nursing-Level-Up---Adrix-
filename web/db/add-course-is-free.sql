-- Migration: Add is_free column to courses table.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false;

-- Sync existing courses: set is_free = true for price = 0
UPDATE courses SET is_free = true WHERE price = 0;
