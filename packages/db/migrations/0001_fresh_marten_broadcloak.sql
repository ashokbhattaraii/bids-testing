CREATE TABLE `hospitals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`address` text,
	`valley` text DEFAULT 'inside_valley' NOT NULL,
	`contact_person` text,
	`phone` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_name` text NOT NULL,
	`requester_name` text,
	`requester_phone` text,
	`diagnosis` text,
	`hospital` text,
	`hospital_id` text NOT NULL,
	`blood_type` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`urgency` text DEFAULT 'high' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`transportation_required` text,
	`requested_at` text NOT NULL,
	`needed_by` text,
	`notes` text,
	`contact_person` text,
	`phone` text,
	`location` text,
	`selected_components` text,
	`component_quantities` text,
	`images` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON UPDATE no action ON DELETE no action
);
