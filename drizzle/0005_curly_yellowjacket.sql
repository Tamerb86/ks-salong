ALTER TABLE `salonSettings` ADD `fikenEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `salonSettings` ADD `fikenApiToken` text;--> statement-breakpoint
ALTER TABLE `salonSettings` ADD `fikenCompanySlug` varchar(255);--> statement-breakpoint
ALTER TABLE `salonSettings` ADD `fikenLastSyncDate` timestamp;--> statement-breakpoint
ALTER TABLE `salonSettings` ADD `fikenAutoSync` boolean DEFAULT false NOT NULL;