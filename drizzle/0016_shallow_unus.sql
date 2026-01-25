CREATE TABLE `staffLeaves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffId` int NOT NULL,
	`leaveType` enum('vacation','sick','personal','other') NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`reason` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staffLeaves_id` PRIMARY KEY(`id`)
);
