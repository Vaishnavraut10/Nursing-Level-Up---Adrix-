-- Migration: Add promo_codes table for multiple promo codes per course
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  code CITEXT NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'FIXED' CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER,
  per_user_limit INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_promo_code_per_course UNIQUE (course_id, code)
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_course_id ON promo_codes (course_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes (code);

-- Trigger for updated_at
DO $$
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS trg_promo_codes_updated_at ON promo_codes';
  EXECUTE 'CREATE TRIGGER trg_promo_codes_updated_at BEFORE UPDATE ON promo_codes FOR EACH ROW EXECUTE FUNCTION set_updated_at()';
END $$;

-- Migrate existing course promo codes if any
INSERT INTO promo_codes (course_id, code, discount_type, discount_value, is_active)
SELECT 
  id AS course_id, 
  promo_code AS code, 
  'FIXED' AS discount_type, 
  (price - discount_price) AS discount_value,
  true AS is_active
FROM courses 
WHERE promo_code IS NOT NULL 
  AND discount_price IS NOT NULL 
  AND price > discount_price
ON CONFLICT (course_id, code) DO NOTHING;
