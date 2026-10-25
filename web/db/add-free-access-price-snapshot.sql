-- Migration: Add price_snapshot column to course_free_access table.
-- Records the course's regular price at the time of granting free access,
-- so dashboard statistics are immune to later price changes.
-- Idempotent: safe to run multiple times.

ALTER TABLE course_free_access
  ADD COLUMN IF NOT EXISTS price_snapshot NUMERIC(10,2);

-- Backfill existing grants with the current course price where available.
-- Historical accuracy note: these use the current course price since the original
-- grant-time price was not recorded. The audit_logs.metadata.normal_price field
-- may have the original price for grants created after the audit logging was added.
UPDATE course_free_access cfa
   SET price_snapshot = c.price
  FROM courses c
 WHERE cfa.course_id = c.id
   AND cfa.price_snapshot IS NULL;
