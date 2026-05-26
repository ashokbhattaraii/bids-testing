CREATE TABLE `diagnoses` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diagnoses_name_unique` ON `diagnoses` (`name`);
--> statement-breakpoint
INSERT INTO `diagnoses` (`id`, `name`, `created_at`, `updated_at`) VALUES
  ('diagnosis-seed-1', 'Accident/Trauma', datetime('now'), datetime('now')),
  ('diagnosis-seed-2', 'Surgery', datetime('now'), datetime('now')),
  ('diagnosis-seed-3', 'Anemia', datetime('now'), datetime('now')),
  ('diagnosis-seed-4', 'Cancer Treatment', datetime('now'), datetime('now')),
  ('diagnosis-seed-5', 'Blood Disorder', datetime('now'), datetime('now')),
  ('diagnosis-seed-6', 'Pregnancy Complication', datetime('now'), datetime('now')),
  ('diagnosis-seed-7', 'Kidney Disease', datetime('now'), datetime('now')),
  ('diagnosis-seed-8', 'Liver Disease', datetime('now'), datetime('now')),
  ('diagnosis-seed-9', 'Heart Surgery', datetime('now'), datetime('now')),
  ('diagnosis-seed-10', 'Burn Treatment', datetime('now'), datetime('now')),
  ('diagnosis-seed-11', 'Dengue', datetime('now'), datetime('now')),
  ('diagnosis-seed-12', 'Thalassemia', datetime('now'), datetime('now')),
  ('diagnosis-seed-13', 'Hemophilia', datetime('now'), datetime('now')),
  ('diagnosis-seed-14', 'Other', datetime('now'), datetime('now'));