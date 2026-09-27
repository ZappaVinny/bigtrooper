-- Session tokens are now stored hashed; existing raw tokens can't be used.
DELETE FROM sessions;

ALTER TABLE users ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);
ALTER TABLE users ALTER COLUMN preferences SET DEFAULT '{"email": true, "sms": true}'::jsonb;

ALTER TABLE pets ADD CONSTRAINT pets_code_key UNIQUE (code);

-- Soft-deleted articles no longer hold on to their slugs.
ALTER TABLE articles DROP CONSTRAINT articles_slug_key;
CREATE UNIQUE INDEX articles_slug_live_key ON articles (slug) WHERE deleted = FALSE;

ALTER TABLE categories
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ;
