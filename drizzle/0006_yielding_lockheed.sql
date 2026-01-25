CREATE TABLE `terminalReaders` (
	`id` varchar(255) NOT NULL,
	`label` varchar(255) NOT NULL,
	`locationId` varchar(255) NOT NULL,
	`serialNumber` varchar(255),
	`deviceType` varchar(100),
	`status` varchar(50),
	`ipAddress` varchar(50),
	`lastSeenAt` timestamp,
	`registeredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `terminalReaders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `salonSettings` ADD `stripeTerminalEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `salonSettings` ADD `stripeTerminalLocationId` varchar(255);