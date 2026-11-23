-- Migration: Add study notes table for downloadable student materials
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('PDF', 'DOCX', 'DOC')),
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  storage_key TEXT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_published ON notes (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes (subject);
CREATE INDEX IF NOT EXISTS idx_notes_course_id ON notes (course_id);
