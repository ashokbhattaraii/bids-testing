CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`avatar` text,
	`joined_at` text NOT NULL,
	`updated_at` text NOT NULL
);
