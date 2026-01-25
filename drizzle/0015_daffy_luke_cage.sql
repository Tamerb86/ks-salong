ALTER TABLE `payments` MODIFY COLUMN `status` enum('pending','initiated','authorized','captured','refunded','failed','cancelled','expired') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `payments` ADD `currency` varchar(3) DEFAULT 'NOK' NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `paidAt` timestamp;--> statement-breakpoint
CREATE INDEX `payment_appointment_id_idx` ON `payments` (`appointmentId`);--> statement-breakpoint
CREATE INDEX `payment_provider_transaction_id_idx` ON `payments` (`providerTransactionId`);--> statement-breakpoint
CREATE INDEX `payment_status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `payment_created_at_idx` ON `payments` (`createdAt`);