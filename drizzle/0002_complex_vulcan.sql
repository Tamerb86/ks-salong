ALTER TABLE `appointments` ADD `cancellationToken` varchar(64);--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_cancellationToken_unique` UNIQUE(`cancellationToken`);