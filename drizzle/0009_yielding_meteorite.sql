CREATE TABLE `fiken_sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sync_date` date NOT NULL,
	`start_time` datetime NOT NULL,
	`end_time` datetime,
	`status` enum('success','failure','in_progress') NOT NULL DEFAULT 'in_progress',
	`sales_count` int DEFAULT 0,
	`total_amount` decimal(10,2) DEFAULT '0.00',
	`error_message` text,
	`sync_type` enum('automatic','manual') NOT NULL DEFAULT 'automatic',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `fiken_sync_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `sync_date_idx` ON `fiken_sync_logs` (`sync_date`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `fiken_sync_logs` (`status`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `fiken_sync_logs` (`created_at`);