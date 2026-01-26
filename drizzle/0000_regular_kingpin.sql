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
	`vippsOrderId` varchar(255),
	`paymentStatus` enum('pending','paid','failed','refunded','expired') DEFAULT 'pending',
	`paymentAmount` decimal(10,2),
	`paidAt` timestamp,
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
CREATE TABLE `customer_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`appointment_id` int,
	`note` text NOT NULL,
	`created_by` int NOT NULL,
	`created_by_name` varchar(255),
	`visit_date` datetime,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `customer_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customer_id` int NOT NULL,
	`tag` enum('VIP','Regular','New','Inactive','Loyal','HighValue','AtRisk') NOT NULL,
	`added_by` int,
	`added_by_name` varchar(255),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `customer_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_customer_tag` UNIQUE(`customer_id`,`tag`)
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
CREATE TABLE `fiken_sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sync_date` varchar(10) NOT NULL,
	`start_time` datetime NOT NULL,
	`end_time` datetime,
	`status` enum('success','failure','in_progress') NOT NULL DEFAULT 'in_progress',
	`sales_count` int DEFAULT 0,
	`total_amount` decimal(10,2) DEFAULT '0.00',
	`error_message` text,
	`sync_type` enum('automatic','manual') NOT NULL DEFAULT 'automatic',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `fiken_sync_logs_id` PRIMARY KEY(`id`)
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
	`costPrice` decimal(10,2) DEFAULT '0.00',
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
	`requirePaymentForBooking` boolean NOT NULL DEFAULT false,
	`autoLogoutTime` varchar(5) DEFAULT '22:00',
	`universalPin` varchar(6) DEFAULT '1234',
	`stripeEnabled` boolean NOT NULL DEFAULT false,
	`stripePublishableKey` text,
	`stripeSecretKey` text,
	`stripeConnectEnabled` boolean NOT NULL DEFAULT false,
	`stripeConnectAccountId` text,
	`platformFeePercent` decimal(5,2) DEFAULT '0.00',
	`fikenEnabled` boolean NOT NULL DEFAULT false,
	`fikenApiToken` text,
	`fikenCompanySlug` varchar(255),
	`fikenLastSyncDate` timestamp,
	`fikenAutoSync` boolean NOT NULL DEFAULT false,
	`stripeTerminalEnabled` boolean NOT NULL DEFAULT false,
	`stripeTerminalLocationId` varchar(255),
	`customBookingUrl` varchar(500),
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
--> statement-breakpoint
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
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`phone` varchar(20),
	`loginMethod` varchar(64),
	`role` enum('owner','manager','barber','cashier','customer') NOT NULL DEFAULT 'customer',
	`pin` varchar(6),
	`skillLevel` enum('beginner','intermediate','expert') DEFAULT 'intermediate',
	`durationMultiplier` decimal(3,2) DEFAULT '1.00',
	`bookingSlotInterval` int NOT NULL DEFAULT 15,
	`breakStartTime` varchar(5),
	`breakEndTime` varchar(5),
	`workingHoursStart` varchar(5),
	`workingHoursEnd` varchar(5),
	`workingDays` varchar(20),
	`twoFactorEnabled` boolean NOT NULL DEFAULT false,
	`twoFactorSecret` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `customer_id_idx` ON `customer_notes` (`customer_id`);--> statement-breakpoint
CREATE INDEX `appointment_id_idx` ON `customer_notes` (`appointment_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `customer_notes` (`created_at`);--> statement-breakpoint
CREATE INDEX `customer_id_idx` ON `customer_tags` (`customer_id`);--> statement-breakpoint
CREATE INDEX `tag_idx` ON `customer_tags` (`tag`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `dashboard_access_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `login_time_idx` ON `dashboard_access_logs` (`login_time`);--> statement-breakpoint
CREATE INDEX `sync_date_idx` ON `fiken_sync_logs` (`sync_date`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `fiken_sync_logs` (`status`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `fiken_sync_logs` (`created_at`);