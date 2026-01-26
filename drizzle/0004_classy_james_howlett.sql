ALTER TABLE `salonSettings` ADD `bankAccountNumber` varchar(11);--> statement-breakpoint
ALTER TABLE `salonSettings` ADD `vippsTestMode` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `salonSettings` ADD `resendApiKey` text;--> statement-breakpoint
ALTER TABLE `salonSettings` ADD `resendFromEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `salonSettings` ADD `resendFromName` varchar(255);