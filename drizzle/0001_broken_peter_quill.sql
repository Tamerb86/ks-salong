CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`staffId` int NOT NULL,
	`serviceId` int NOT NULL,
	`appointmentDate` timestamp NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`status` enum('pending','confirmed','checked_in','no_show','cancelled','completed') NOT NULL DEFAULT 'pending',
	`notes` text,
	`cancellationReason` text,
	`cancelledAt` timestamp,
	`cancelledBy` int,
	`reminderSent24h` boolean NOT NULL DEFAULT false,
	`reminderSent2h` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`oldValue` json,
	`newValue` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businessHours` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dayOfWeek` int NOT NULL,
	`isOpen` boolean NOT NULL DEFAULT true,
	`openTime` varchar(5) NOT NULL,
	`closeTime` varchar(5) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businessHours_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`dateOfBirth` timestamp,
	`address` text,
	`preferredStaffId` int,
	`preferences` text,
	`notes` text,
	`tags` json,
	`totalVisits` int NOT NULL DEFAULT 0,
	`totalSpent` decimal(10,2) NOT NULL DEFAULT '0.00',
	`lastVisit` timestamp,
	`noShowCount` int NOT NULL DEFAULT 0,
	`marketingEmailConsent` boolean NOT NULL DEFAULT false,
	`marketingSmsConsent` boolean NOT NULL DEFAULT false,
	`consentTimestamp` timestamp,
	`consentIpAddress` varchar(45),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportDate` timestamp NOT NULL,
	`totalSales` decimal(10,2) NOT NULL,
	`totalOrders` int NOT NULL,
	`totalAppointments` int NOT NULL,
	`totalNoShows` int NOT NULL,
	`totalCash` decimal(10,2) NOT NULL,
	`totalCard` decimal(10,2) NOT NULL,
	`totalVipps` decimal(10,2) NOT NULL,
	`totalTips` decimal(10,2) NOT NULL,
	`excelUrl` text,
	`excelKey` text,
	`pdfUrl` text,
	`pdfKey` text,
	`emailedTo` varchar(320),
	`emailedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dropInQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(20),
	`serviceId` int NOT NULL,
	`preferredStaffId` int,
	`position` int NOT NULL,
	`status` enum('waiting','in_service','completed','cancelled') NOT NULL DEFAULT 'waiting',
	`estimatedWaitTime` int,
	`convertedToAppointmentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dropInQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `holidays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`date` timestamp NOT NULL,
	`isRecurring` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `holidays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('email','sms') NOT NULL,
	`subject` varchar(255),
	`body` text NOT NULL,
	`variables` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`itemType` enum('service','product') NOT NULL,
	`itemId` int NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`taxRate` decimal(5,2) NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`customerId` int,
	`staffId` int NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`taxAmount` decimal(10,2) NOT NULL,
	`discountAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`tipAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total` decimal(10,2) NOT NULL,
	`status` enum('pending','completed','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
	`receiptUrl` text,
	`receiptKey` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int,
	`appointmentId` int,
	`customerId` int,
	`amount` decimal(10,2) NOT NULL,
	`method` enum('vipps','stripe','cash','gift_card') NOT NULL,
	`status` enum('initiated','authorized','captured','refunded','failed') NOT NULL DEFAULT 'initiated',
	`provider` varchar(50),
	`providerTransactionId` varchar(255),
	`providerPaymentIntentId` varchar(255),
	`metadata` json,
	`refundedAmount` decimal(10,2) DEFAULT '0.00',
	`refundReason` text,
	`refundedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`canViewReports` boolean NOT NULL DEFAULT false,
	`canEditPrices` boolean NOT NULL DEFAULT false,
	`canProcessRefunds` boolean NOT NULL DEFAULT false,
	`canManageUsers` boolean NOT NULL DEFAULT false,
	`canManageServices` boolean NOT NULL DEFAULT false,
	`canManageProducts` boolean NOT NULL DEFAULT false,
	`canViewAllAppointments` boolean NOT NULL DEFAULT false,
	`canEditSettings` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`sku` varchar(100),
	`price` decimal(10,2) NOT NULL,
	`cost` decimal(10,2),
	`stock` int NOT NULL DEFAULT 0,
	`lowStockThreshold` int NOT NULL DEFAULT 5,
	`mvaTax` decimal(5,2) NOT NULL DEFAULT '25.00',
	`imageUrl` text,
	`imageKey` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`category` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salonSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`salonName` varchar(255) NOT NULL,
	`salonEmail` varchar(320),
	`salonPhone` varchar(20),
	`salonAddress` text,
	`defaultMvaTax` decimal(5,2) NOT NULL DEFAULT '25.00',
	`currency` varchar(3) NOT NULL DEFAULT 'NOK',
	`timezone` varchar(50) NOT NULL DEFAULT 'Europe/Oslo',
	`bookingSlotInterval` int NOT NULL DEFAULT 15,
	`bufferTimeBetweenAppointments` int NOT NULL DEFAULT 5,
	`cancellationPolicyHours` int NOT NULL DEFAULT 24,
	`lateCancellationFeePercent` decimal(5,2) DEFAULT '50.00',
	`noShowFeePercent` decimal(5,2) DEFAULT '100.00',
	`noShowThresholdForPrepayment` int NOT NULL DEFAULT 3,
	`reminder24hEnabled` boolean NOT NULL DEFAULT true,
	`reminder2hEnabled` boolean NOT NULL DEFAULT true,
	`vippsEnabled` boolean NOT NULL DEFAULT false,
	`vippsClientId` text,
	`vippsClientSecret` text,
	`vippsMerchantSerialNumber` text,
	`vippsSubscriptionKey` text,
	`stripeEnabled` boolean NOT NULL DEFAULT false,
	`stripePublishableKey` text,
	`stripeSecretKey` text,
	`stripeConnectEnabled` boolean NOT NULL DEFAULT false,
	`stripeConnectAccountId` text,
	`platformFeePercent` decimal(5,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salonSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serviceStaff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceId` int NOT NULL,
	`staffId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serviceStaff_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`duration` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`mvaTax` decimal(5,2) NOT NULL DEFAULT '25.00',
	`isActive` boolean NOT NULL DEFAULT true,
	`category` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffId` int NOT NULL,
	`clockIn` timestamp NOT NULL,
	`clockOut` timestamp,
	`breakStart` timestamp,
	`breakEnd` timestamp,
	`totalBreakMinutes` int NOT NULL DEFAULT 0,
	`totalWorkMinutes` int NOT NULL DEFAULT 0,
	`overtimeMinutes` int NOT NULL DEFAULT 0,
	`notes` text,
	`editedBy` int,
	`editReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('owner','manager','barber','cashier','customer') NOT NULL DEFAULT 'customer';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `pin` varchar(6);--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorSecret` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;