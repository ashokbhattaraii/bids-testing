-- ──────────────────────────────────────────────────
-- Hamro Life Bank — Blood Dispatch System
-- Initial schema migration
-- ──────────────────────────────────────────────────

-- Users (staff accounts: admin, call_operator, volunteer)
CREATE TABLE IF NOT EXISTS users (
  id          TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  password_hash TEXT,                          -- NULL for OAuth-only accounts
  role        TEXT    NOT NULL DEFAULT 'volunteer', -- admin | call_operator | volunteer
  is_active   INTEGER NOT NULL DEFAULT 1,
  avatar      TEXT,
  joined_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Hospitals / partner blood banks
CREATE TABLE IF NOT EXISTS hospitals (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  location        TEXT NOT NULL,
  contact_person  TEXT,
  phone           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Per-blood-type inventory per hospital
CREATE TABLE IF NOT EXISTS hospital_inventory (
  id          TEXT    PRIMARY KEY,
  hospital_id TEXT    NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  blood_type  TEXT    NOT NULL, -- O+|O-|A+|A-|B+|B-|AB+|AB-
  units       INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(hospital_id, blood_type)
);

-- Blood requests
CREATE TABLE IF NOT EXISTS blood_requests (
  id               TEXT    PRIMARY KEY,
  patient_name     TEXT    NOT NULL,
  hospital_id      TEXT    REFERENCES hospitals(id),
  hospital_name    TEXT    NOT NULL,
  blood_type       TEXT    NOT NULL,
  quantity         INTEGER NOT NULL DEFAULT 1,
  urgency          TEXT    NOT NULL DEFAULT 'high',  -- critical|high|moderate|low
  status           TEXT    NOT NULL DEFAULT 'pending', -- pending|in_progress|fulfilled|cancelled
  diagnosis        TEXT,
  blood_components TEXT,                              -- JSON: [{id,label,qty}]
  needed_by        TEXT,
  notes            TEXT,
  contact_person   TEXT    NOT NULL,
  phone            TEXT    NOT NULL,
  location         TEXT    NOT NULL DEFAULT 'inside_valley', -- inside_valley|outside_valley
  created_by       TEXT    NOT NULL REFERENCES users(id),
  requested_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Registered (verified) donors
CREATE TABLE IF NOT EXISTS donors (
  id               TEXT    PRIMARY KEY,
  name             TEXT    NOT NULL,
  blood_type       TEXT    NOT NULL,
  phone            TEXT    NOT NULL,
  location         TEXT    NOT NULL,
  last_donation    TEXT,
  rating           REAL    NOT NULL DEFAULT 0,
  donation_count   INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'available', -- available|unavailable|blacklisted
  blacklist_reason TEXT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Donor pledges (logged by call operators; may convert to verified donors)
CREATE TABLE IF NOT EXISTS pledges (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  blood_type    TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address       TEXT,
  pledge_date   TEXT NOT NULL DEFAULT (datetime('now')),
  hotline_agent TEXT,
  status        TEXT NOT NULL DEFAULT 'new', -- new|contacted|converted
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Unverified donors (self-registered online / walk-in; await staff verification)
CREATE TABLE IF NOT EXISTS unverified_donors (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  blood_type       TEXT NOT NULL,
  phone            TEXT NOT NULL,
  address          TEXT,
  registered_date  TEXT NOT NULL DEFAULT (datetime('now')),
  source           TEXT NOT NULL DEFAULT 'Online Form', -- Online Form|Walk-in|Referral|Campaign
  status           TEXT NOT NULL DEFAULT 'pending',     -- pending|contacted|verified|rejected
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Feedback from patients and donors
CREATE TABLE IF NOT EXISTS feedback (
  id         TEXT    PRIMARY KEY,
  type       TEXT    NOT NULL DEFAULT 'patient', -- patient|donor
  name       TEXT    NOT NULL,
  message    TEXT    NOT NULL,
  rating     INTEGER NOT NULL DEFAULT 5,
  status     TEXT    NOT NULL DEFAULT 'new', -- new|reviewed|resolved
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Key-value settings store
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Seed default admin user (password: admin123) ─────────────────────────────
-- PBKDF2-SHA256 hash of "admin123" with a fixed salt for the seed only.
-- Replace this user's password via the /auth/change-password endpoint after first login.
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, is_active)
VALUES (
  'usr_seed_admin_001',
  'Admin User',
  'sushil.rumsan@gmail.com',
  -- This is a placeholder; the real hash is generated on first startup via the seed endpoint.
  -- Run: POST /auth/seed  to initialise the admin account properly.
  NULL,
  'admin',
  1
);

-- ── Seed default settings ─────────────────────────────────────────────────────
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('organization_name',    'Hamro Life Bank'),
  ('organization_address', 'Kathmandu, Nepal'),
  ('contact_email',        'info@hamrolifebank.org'),
  ('contact_phone',        '+977-1-4123456'),
  ('hotline_number',       '1166');
