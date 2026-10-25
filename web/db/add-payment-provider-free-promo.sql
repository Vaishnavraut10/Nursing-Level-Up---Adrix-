-- Add FREE and PROMO values to payment_provider enum
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'FREE';
ALTER TYPE payment_provider ADD VALUE IF NOT EXISTS 'PROMO';
