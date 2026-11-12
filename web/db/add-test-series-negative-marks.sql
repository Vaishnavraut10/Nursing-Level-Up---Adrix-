-- Migration: Add negative_marks to test_series and convert attempts.score to NUMERIC(6,2)
ALTER TABLE test_series ADD COLUMN IF NOT EXISTS negative_marks NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (negative_marks >= 0);

ALTER TABLE attempts ALTER COLUMN score TYPE NUMERIC(6,2);

