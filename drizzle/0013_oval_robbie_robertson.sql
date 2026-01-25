CREATE TABLE `dashboard_access_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`user_name` varchar(255) NOT NULL,
	`user_role` varchar(50),
	`login_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_access_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `dashboard_access_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `login_time_idx` ON `dashboard_access_logs` (`login_time`);