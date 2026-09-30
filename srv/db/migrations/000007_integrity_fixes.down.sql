ALTER TABLE categories
  ALTER COLUMN created_at TYPE TIMESTAMP,
  ALTER COLUMN updated_at TYPE TIMESTAMP;

DROP INDEX IF EXISTS articles_slug_live_key;
ALTER TABLE articles ADD CONSTRAINT articles_slug_key UNIQUE (slug);

ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_code_key;

ALTER TABLE users ALTER COLUMN preferences SET DEFAULT '{"preferences": {"email": true, "sms": true}}'::jsonb;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_number_key;
