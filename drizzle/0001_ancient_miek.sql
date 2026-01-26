ALTER TABLE `appointments` MODIFY COLUMN `staffId` int;--> statement-breakpoint
ALTER TABLE `appointments` ADD `paymentMethod` varchar(50);--> statement-breakpoint
ALTER TABLE `appointments` ADD `createdBy` int;