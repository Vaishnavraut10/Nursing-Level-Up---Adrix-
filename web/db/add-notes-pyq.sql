-- Migration: Add PYQ (Previous Year Questions) fields to notes table
ALTER TABLE notes 
  ADD COLUMN IF NOT EXISTS material_type VARCHAR(20) NOT NULL DEFAULT 'NOTE' CHECK (material_type IN ('NOTE', 'PYQ')),
  ADD COLUMN IF NOT EXISTS exam_name TEXT,
  ADD COLUMN IF NOT EXISTS exam_year INTEGER;

CREATE INDEX IF NOT EXISTS idx_notes_material_type ON notes (material_type);
CREATE INDEX IF NOT EXISTS idx_notes_exam_name ON notes (exam_name);
CREATE INDEX IF NOT EXISTS idx_notes_exam_year ON notes (exam_year);
