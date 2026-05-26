CREATE TABLE `diagnoses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diagnoses_name_unique` ON `diagnoses` (`name`);--> statement-breakpoint
ALTER TABLE `requests` ADD `request_received_from` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `request_managed_from` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `requestor_email` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `patient_feedback_status` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `requisition_form_upload` text;