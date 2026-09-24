-- Migration: Add courses table and refactor purchases for course-based model.
-- Idempotent: safe to run multiple times.

-- ---------------------------------------------------------------- course_status enum
DO $$ BEGIN
  CREATE TYPE course_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------- courses table
CREATE TABLE IF NOT EXISTS courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL DEFAULT 299 CHECK (price >= 0),
  discount_price  NUMERIC(10,2) CHECK (discount_price IS NULL OR discount_price >= 0),
  promo_code      TEXT,
  currency        TEXT NOT NULL DEFAULT 'INR',
  status          course_status NOT NULL DEFAULT 'DRAFT',
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses (status);

-- ---------------------------------------------------------------- test_series additions
ALTER TABLE test_series ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
ALTER TABLE test_series ADD COLUMN IF NOT EXISTS release_after_days INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_test_series_course_id ON test_series (course_id);

-- ---------------------------------------------------------------- purchases additions
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE RESTRICT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS promo_code_used TEXT;
-- Make test_series_id nullable (course purchases don't target a single series)
ALTER TABLE purchases ALTER COLUMN test_series_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_purchases_course_id ON purchases (course_id);

-- ---------------------------------------------------------------- course_access view helper
-- Stores the moment a student's drip schedule starts (= first successful course purchase).
-- We derive this from purchases rather than a separate table, keeping the single source of truth.

-- ---------------------------------------------------------------- triggers for courses
DO $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS trg_courses_updated_at ON courses';
  EXECUTE 'CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
END $$;

-- ---------------------------------------------------------------- seed a default course
INSERT INTO courses (title, description, price, discount_price, promo_code, currency, status)
VALUES (
  'Nursing Level Up — Complete Course',
  'Full access to all nursing MCQ test series with daily releases. Practice smarter, prepare better.',
  299,
  199,
  'NLUP199',
  'INR',
  'PUBLISHED'
) ON CONFLICT DO NOTHING;
