CREATE TABLE `donors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`blood_type` text NOT NULL,
	`phone` text NOT NULL,
	`location` text NOT NULL,
	`last_donation` text,
	`last_contacted` text,
	`rating` real NOT NULL DEFAULT 0,
	`donation_count` integer NOT NULL DEFAULT 0,
	`status` text NOT NULL DEFAULT 'active',
	`blacklist_reason` text,
	`communication_type` text NOT NULL DEFAULT 'phone_call',
	`notes` text,
	`source` text NOT NULL DEFAULT 'direct',
	`category` text NOT NULL DEFAULT 'active',
	`created_at` text NOT NULL DEFAULT (datetime('now')),
	`updated_at` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `donor_contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`donor_id` text NOT NULL REFERENCES `donors`(`id`),
	`request_id` text,
	`contacted_by` text NOT NULL,
	`communication_type` text NOT NULL DEFAULT 'phone_call',
	`notes` text,
	`created_at` text NOT NULL DEFAULT (datetime('now'))
);
