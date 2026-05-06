-- ──────────────────────────────────────────────────────────────────────────────
-- Hamro Life Bank — BIDS v3 Enhancement Migration
-- ──────────────────────────────────────────────────────────────────────────────

-- ── blood_requests: new fields & updated status vocabulary ───────────────────
-- Status mapping:  pending (removed) | new→in_progress | fulfilled→managed |
--                  (new) managed_and_verified | (new) unmanaged

ALTER TABLE blood_requests ADD COLUMN requester_name      TEXT;
ALTER TABLE blood_requests ADD COLUMN requester_phone     TEXT;
ALTER TABLE blood_requests ADD COLUMN transportation_required INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blood_requests ADD COLUMN blood_required_on   TEXT;   -- defaults to today on insert
ALTER TABLE blood_requests ADD COLUMN managed_at          TEXT;   -- set when status→managed

-- Back-fill: map old statuses to new ones
UPDATE blood_requests SET status = 'in_progress'        WHERE status = 'new';
UPDATE blood_requests SET status = 'managed'            WHERE status = 'fulfilled';
UPDATE blood_requests SET status = 'in_progress'        WHERE status = 'pending';
UPDATE blood_requests SET status = 'in_progress'        WHERE status = 'cancelled';

-- Back-fill requester fields from existing columns
UPDATE blood_requests SET requester_name  = contact_person WHERE requester_name IS NULL;
UPDATE blood_requests SET requester_phone = phone          WHERE requester_phone IS NULL;
UPDATE blood_requests SET blood_required_on = date(requested_at) WHERE blood_required_on IS NULL;

-- ── donors: extended fields ───────────────────────────────────────────────────
-- Status: available→active | blacklisted stays | add pledged / dormant / do_not_call

ALTER TABLE donors ADD COLUMN last_contacted     TEXT;
ALTER TABLE donors ADD COLUMN communication_type TEXT NOT NULL DEFAULT 'phone_call'; -- phone_call|sms
ALTER TABLE donors ADD COLUMN notes              TEXT;   -- merged remarks + feedback
ALTER TABLE donors ADD COLUMN source             TEXT NOT NULL DEFAULT 'direct';     -- direct|pledged|event|walk_in
ALTER TABLE donors ADD COLUMN category           TEXT NOT NULL DEFAULT 'active';     -- active|pledged|event

-- Back-fill: rename 'available' → 'active', 'unavailable' → 'active'
UPDATE donors SET status = 'active'      WHERE status = 'available';
UPDATE donors SET status = 'active'      WHERE status = 'unavailable';

-- ── hospitals: valley segmentation + address ─────────────────────────────────
ALTER TABLE hospitals ADD COLUMN valley  TEXT NOT NULL DEFAULT 'inside_valley'; -- inside_valley|outside_valley
ALTER TABLE hospitals ADD COLUMN address TEXT;

-- ── feedback: link donor feedback to requests + donation flag ────────────────
ALTER TABLE feedback ADD COLUMN request_id TEXT REFERENCES blood_requests(id);
ALTER TABLE feedback ADD COLUMN donated     INTEGER NOT NULL DEFAULT 1; -- 1=yes, 0=no (donor feedback)

-- Remove contacted/not-contacted and is_verified by not adding them (they never existed)
-- Remove type=patient fields that are no longer needed: handled in application layer

-- ── request_donors: many-to-many: donors assigned to requests ────────────────
CREATE TABLE IF NOT EXISTS request_donors (
  id          TEXT PRIMARY KEY,
  request_id  TEXT NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  donor_id    TEXT NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  assigned_by TEXT NOT NULL REFERENCES users(id),
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  status      TEXT NOT NULL DEFAULT 'assigned', -- assigned|donated|declined|no_show
  notes       TEXT,
  UNIQUE(request_id, donor_id)
);

-- ── follow_up_reminders: 1-hour post-managed reminder ────────────────────────
CREATE TABLE IF NOT EXISTS follow_up_reminders (
  id          TEXT PRIMARY KEY,
  request_id  TEXT NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  due_at      TEXT NOT NULL,             -- managed_at + 1 hour
  resolved    INTEGER NOT NULL DEFAULT 0,
  resolution  TEXT,                      -- collected|managed_elsewhere
  resolved_by TEXT REFERENCES users(id),
  resolved_at TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── donor_contacts: log of every call/sms made to a donor ────────────────────
CREATE TABLE IF NOT EXISTS donor_contacts (
  id               TEXT PRIMARY KEY,
  donor_id         TEXT NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  request_id       TEXT REFERENCES blood_requests(id),
  contacted_by     TEXT NOT NULL REFERENCES users(id),
  communication_type TEXT NOT NULL DEFAULT 'phone_call', -- phone_call|sms
  contacted_at     TEXT NOT NULL DEFAULT (datetime('now')),
  notes            TEXT
);

-- ── Update settings seed ─────────────────────────────────────────────────────
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('follow_up_reminder_hours', '1'),
  ('password_reset_interval_days', '180');
