-- Migration: Allow users to sign up and log in with phone or email
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_email_or_phone'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT chk_user_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON users (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
