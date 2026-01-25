ALTER TABLE `users` ADD `skillLevel` enum('beginner','intermediate','expert') DEFAULT 'intermediate';--> statement-breakpoint
ALTER TABLE `users` ADD `durationMultiplier` decimal(3,2) DEFAULT '1.00';