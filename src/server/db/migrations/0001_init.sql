CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  github_id TEXT,
  created_at INTEGER NOT NULL,
  notify_instant INTEGER NOT NULL DEFAULT 0,
  notify_weekly INTEGER NOT NULL DEFAULT 0,
  unsub_token TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS magic_links (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_states (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rigs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  gpu TEXT NOT NULL,
  gpu_count INTEGER NOT NULL,
  vram_gb INTEGER NOT NULL,
  ram_gb INTEGER NOT NULL,
  gfx TEXT,
  cpu TEXT,
  os TEXT,
  distro TEXT,
  rocm_version TEXT,
  backend TEXT NOT NULL,
  backend_version TEXT,
  models_json TEXT NOT NULL,
  context INTEGER NOT NULL,
  priority TEXT NOT NULL,
  usage TEXT NOT NULL,
  style TEXT NOT NULL,
  share_query TEXT,
  rss_token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  update_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  sent_at INTEGER NOT NULL
);
