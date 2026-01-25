ALTER TABLE `appointments` ADD `vippsOrderId` varchar(255);--> statement-breakpoint
ALTER TABLE `appointments` ADD `paymentStatus` enum('pending','paid','failed','refunded','expired') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `appointments` ADD `paymentAmount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `appointments` ADD `paidAt` timestamp;