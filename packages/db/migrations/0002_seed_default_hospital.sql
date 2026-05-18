INSERT OR IGNORE INTO hospitals (
  id,
  name,
  location,
  address,
  valley,
  contact_person,
  phone,
  created_at,
  updated_at
) VALUES (
  'HOSPITAL-SEED-1',
  'Bir Hospital',
  'Kathmandu',
  'Kalimati, Kathmandu, Nepal',
  'inside_valley',
  'Dr. Sharma',
  '+977-1-4242424',
  datetime('now'),
  datetime('now')
);
