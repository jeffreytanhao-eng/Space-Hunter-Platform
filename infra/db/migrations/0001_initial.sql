CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  file_url TEXT NOT NULL,
  checksum TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fits_metadata (
  id UUID PRIMARY KEY,
  upload_id UUID NOT NULL UNIQUE REFERENCES uploads(id),
  raw_json JSONB NOT NULL,
  normalized_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quality_scores (
  id UUID PRIMARY KEY,
  upload_id UUID NOT NULL UNIQUE REFERENCES uploads(id),
  quality_score INT NOT NULL,
  confidence_score INT NOT NULL,
  flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS points_ledger (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  event_type TEXT NOT NULL,
  delta INT NOT NULL,
  balance_after INT NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY,
  actor_id UUID,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
