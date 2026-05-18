CREATE TABLE `donor_contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`donor_id` text NOT NULL,
	`request_id` text,
	`contacted_by` text NOT NULL,
	`communication_type` text DEFAULT 'phone_call' NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`donor_id`) REFERENCES `donors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `donors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`blood_type` text NOT NULL,
	`phone` text NOT NULL,
	`location` text NOT NULL,
	`last_donation` text,
	`last_contacted` text,
	`rating` real DEFAULT 0 NOT NULL,
	`donation_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`blacklist_reason` text,
	`communication_type` text DEFAULT 'phone_call' NOT NULL,
	`notes` text,
	`source` text DEFAULT 'direct' NOT NULL,
	`category` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
