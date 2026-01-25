CREATE TABLE `customer_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`appointment_id` int,
	`note` text NOT NULL,
	`created_by` int NOT NULL,
	`created_by_name` varchar(255),
	`visit_date` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `customer_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`tag` enum('VIP','Regular','New','Inactive','Loyal','HighValue','AtRisk') NOT NULL,
	`added_by` int,
	`added_by_name` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `customer_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_customer_tag` UNIQUE(`customer_id`,`tag`)
);
--> statement-breakpoint
CREATE INDEX `customer_id_idx` ON `customer_notes` (`customer_id`);--> statement-breakpoint
CREATE INDEX `appointment_id_idx` ON `customer_notes` (`appointment_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `customer_notes` (`created_at`);--> statement-breakpoint
CREATE INDEX `customer_id_idx` ON `customer_tags` (`customer_id`);--> statement-breakpoint
CREATE INDEX `tag_idx` ON `customer_tags` (`tag`);