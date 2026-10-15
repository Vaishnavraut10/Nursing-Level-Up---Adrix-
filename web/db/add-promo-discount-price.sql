-- Migration: Add discount_price column to promo_codes table
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS discount_price NUMERIC(10,2);

-- Populate discount_price for existing fixed discount promo codes
UPDATE promo_codes p
   SET discount_price = GREATEST(0, c.price - p.discount_value)
  FROM courses c
 WHERE p.course_id = c.id
   AND p.discount_price IS NULL
   AND p.discount_type = 'FIXED';
