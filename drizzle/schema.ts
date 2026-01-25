import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * ============================================
 * USERS & AUTHENTICATION
 * ============================================
 */

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["owner", "manager", "barber", "cashier", "customer"]).default("customer").notNull(),
  pin: varchar("pin", { length: 6 }), // For employee POS login
  twoFactorEnabled: boolean("twoFactorEnabled").default(false).notNull(),
  twoFactorSecret: text("twoFactorSecret"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  canViewReports: boolean("canViewReports").default(false).notNull(),
  canEditPrices: boolean("canEditPrices").default(false).notNull(),
  canProcessRefunds: boolean("canProcessRefunds").default(false).notNull(),
  canManageUsers: boolean("canManageUsers").default(false).notNull(),
  canManageServices: boolean("canManageServices").default(false).notNull(),
  canManageProducts: boolean("canManageProducts").default(false).notNull(),
  canViewAllAppointments: boolean("canViewAllAppointments").default(false).notNull(),
  canEditSettings: boolean("canEditSettings").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ============================================
 * SERVICES & PRODUCTS
 * ============================================
 */

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  duration: int("duration").notNull(), // in minutes
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  mvaTax: decimal("mvaTax", { precision: 5, scale: 2 }).default("25.00").notNull(), // Norwegian VAT
  isActive: boolean("isActive").default(true).notNull(),
  category: varchar("category", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const serviceStaff = mysqlTable("serviceStaff", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId").notNull(),
  staffId: int("staffId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  stock: int("stock").default(0).notNull(),
  lowStockThreshold: int("lowStockThreshold").default(5).notNull(),
  mvaTax: decimal("mvaTax", { precision: 5, scale: 2 }).default("25.00").notNull(),
  imageUrl: text("imageUrl"),
  imageKey: text("imageKey"),
  isActive: boolean("isActive").default(true).notNull(),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ============================================
 * APPOINTMENTS & BOOKINGS
 * ============================================
 */

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  staffId: int("staffId").notNull(),
  serviceId: int("serviceId").notNull(),
  appointmentDate: timestamp("appointmentDate").notNull(),
  startTime: varchar("startTime", { length: 5 }).notNull(), // HH:MM format
  endTime: varchar("endTime", { length: 5 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "checked_in", "no_show", "cancelled", "completed"]).default("pending").notNull(),
  notes: text("notes"),
  cancellationReason: text("cancellationReason"),
  cancelledAt: timestamp("cancelledAt"),
  cancelledBy: int("cancelledBy"),
  reminderSent24h: boolean("reminderSent24h").default(false).notNull(),
  reminderSent2h: boolean("reminderSent2h").default(false).notNull(),
  // Vipps Payment Integration
  vippsOrderId: varchar("vippsOrderId", { length: 255 }), // Vipps order ID
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded", "expired"]).default("pending"),
  paymentAmount: decimal("paymentAmount", { precision: 10, scale: 2 }),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const dropInQueue = mysqlTable("dropInQueue", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }),
  serviceId: int("serviceId").notNull(),
  preferredStaffId: int("preferredStaffId"),
  position: int("position").notNull(),
  status: mysqlEnum("status", ["waiting", "in_service", "completed", "cancelled"]).default("waiting").notNull(),
  estimatedWaitTime: int("estimatedWaitTime"), // in minutes
  convertedToAppointmentId: int("convertedToAppointmentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ============================================
 * PAYMENTS & TRANSACTIONS
 * ============================================
 */

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId"),
  appointmentId: int("appointmentId"),
  customerId: int("customerId"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: mysqlEnum("method", ["vipps", "stripe", "cash", "gift_card"]).notNull(),
  status: mysqlEnum("status", ["initiated", "authorized", "captured", "refunded", "failed"]).default("initiated").notNull(),
  provider: varchar("provider", { length: 50 }), // vipps or stripe
  providerTransactionId: varchar("providerTransactionId", { length: 255 }),
  providerPaymentIntentId: varchar("providerPaymentIntentId", { length: 255 }),
  metadata: json("metadata"),
  refundedAmount: decimal("refundedAmount", { precision: 10, scale: 2 }).default("0.00"),
  refundReason: text("refundReason"),
  refundedAt: timestamp("refundedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerId: int("customerId"),
  staffId: int("staffId").notNull(), // Who processed the order
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  tipAmount: decimal("tipAmount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "refunded", "partially_refunded"]).default("pending").notNull(),
  receiptUrl: text("receiptUrl"),
  receiptKey: text("receiptKey"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  itemType: mysqlEnum("itemType", ["service", "product"]).notNull(),
  itemId: int("itemId").notNull(), // serviceId or productId
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * ============================================
 * TIME TRACKING
 * ============================================
 */

export const timeEntries = mysqlTable("timeEntries", {
  id: int("id").autoincrement().primaryKey(),
  staffId: int("staffId").notNull(),
  clockIn: timestamp("clockIn").notNull(),
  clockOut: timestamp("clockOut"),
  breakStart: timestamp("breakStart"),
  breakEnd: timestamp("breakEnd"),
  totalBreakMinutes: int("totalBreakMinutes").default(0).notNull(),
  totalWorkMinutes: int("totalWorkMinutes").default(0).notNull(),
  overtimeMinutes: int("overtimeMinutes").default(0).notNull(),
  notes: text("notes"),
  editedBy: int("editedBy"),
  editReason: text("editReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId").notNull(),
  oldValue: json("oldValue"),
  newValue: json("newValue"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * ============================================
 * CUSTOMERS & CRM
 * ============================================
 */

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Link to users table if they have an account
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  dateOfBirth: timestamp("dateOfBirth"),
  address: text("address"),
  preferredStaffId: int("preferredStaffId"),
  preferences: text("preferences"), // Style preferences, etc.
  notes: text("notes"), // Allergies, sensitivities, etc.
  tags: json("tags"), // ["VIP", "New", "Regular", etc.]
  totalVisits: int("totalVisits").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lastVisit: timestamp("lastVisit"),
  noShowCount: int("noShowCount").default(0).notNull(),
  marketingEmailConsent: boolean("marketingEmailConsent").default(false).notNull(),
  marketingSmsConsent: boolean("marketingSmsConsent").default(false).notNull(),
  consentTimestamp: timestamp("consentTimestamp"),
  consentIpAddress: varchar("consentIpAddress", { length: 45 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ============================================
 * SETTINGS & CONFIGURATION
 * ============================================
 */

export const salonSettings = mysqlTable("salonSettings", {
  id: int("id").autoincrement().primaryKey(),
  salonName: varchar("salonName", { length: 255 }).notNull(),
  salonEmail: varchar("salonEmail", { length: 320 }),
  salonPhone: varchar("salonPhone", { length: 20 }),
  salonAddress: text("salonAddress"),
  defaultMvaTax: decimal("defaultMvaTax", { precision: 5, scale: 2 }).default("25.00").notNull(),
  currency: varchar("currency", { length: 3 }).default("NOK").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("Europe/Oslo").notNull(),
  bookingSlotInterval: int("bookingSlotInterval").default(15).notNull(), // minutes
  bufferTimeBetweenAppointments: int("bufferTimeBetweenAppointments").default(5).notNull(), // minutes
  cancellationPolicyHours: int("cancellationPolicyHours").default(24).notNull(),
  lateCancellationFeePercent: decimal("lateCancellationFeePercent", { precision: 5, scale: 2 }).default("50.00"),
  noShowFeePercent: decimal("noShowFeePercent", { precision: 5, scale: 2 }).default("100.00"),
  noShowThresholdForPrepayment: int("noShowThresholdForPrepayment").default(3).notNull(),
  reminder24hEnabled: boolean("reminder24hEnabled").default(true).notNull(),
  reminder2hEnabled: boolean("reminder2hEnabled").default(true).notNull(),
  vippsEnabled: boolean("vippsEnabled").default(false).notNull(),
  vippsClientId: text("vippsClientId"),
  vippsClientSecret: text("vippsClientSecret"),
  vippsMerchantSerialNumber: text("vippsMerchantSerialNumber"),
  vippsSubscriptionKey: text("vippsSubscriptionKey"),
  requirePaymentForBooking: boolean("requirePaymentForBooking").default(false).notNull(), // Require payment before confirming online booking
  autoLogoutTime: varchar("autoLogoutTime", { length: 5 }).default("22:00"), // Automatic logout time (HH:MM format)
  universalPin: varchar("universalPin", { length: 6 }).default("1234"), // Universal PIN for all employees
  stripeEnabled: boolean("stripeEnabled").default(false).notNull(),
  stripePublishableKey: text("stripePublishableKey"),
  stripeSecretKey: text("stripeSecretKey"),
  stripeConnectEnabled: boolean("stripeConnectEnabled").default(false).notNull(),
  stripeConnectAccountId: text("stripeConnectAccountId"),
  platformFeePercent: decimal("platformFeePercent", { precision: 5, scale: 2 }).default("0.00"),
  // Fiken Accounting Integration
  fikenEnabled: boolean("fikenEnabled").default(false).notNull(),
  fikenApiToken: text("fikenApiToken"),
  fikenCompanySlug: varchar("fikenCompanySlug", { length: 255 }),
  fikenLastSyncDate: timestamp("fikenLastSyncDate"),
  fikenAutoSync: boolean("fikenAutoSync").default(false).notNull(),
  // Stripe Terminal Integration
  stripeTerminalEnabled: boolean("stripeTerminalEnabled").default(false).notNull(),
  stripeTerminalLocationId: varchar("stripeTerminalLocationId", { length: 255 }),
  // Custom Booking URL
  customBookingUrl: varchar("customBookingUrl", { length: 500 }), // Custom subdomain or full URL for booking page
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const businessHours = mysqlTable("businessHours", {
  id: int("id").autoincrement().primaryKey(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0 = Sunday, 6 = Saturday
  isOpen: boolean("isOpen").default(true).notNull(),
  openTime: varchar("openTime", { length: 5 }).notNull(), // HH:MM
  closeTime: varchar("closeTime", { length: 5 }).notNull(), // HH:MM
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const holidays = mysqlTable("holidays", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notificationTemplates = mysqlTable("notificationTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["email", "sms"]).notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  variables: json("variables"), // Available template variables
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ============================================
 * REPORTS
 * ============================================
 */

export const dailyReports = mysqlTable("dailyReports", {
  id: int("id").autoincrement().primaryKey(),
  reportDate: timestamp("reportDate").notNull(),
  totalSales: decimal("totalSales", { precision: 10, scale: 2 }).notNull(),
  totalOrders: int("totalOrders").notNull(),
  totalAppointments: int("totalAppointments").notNull(),
  totalNoShows: int("totalNoShows").notNull(),
  totalCash: decimal("totalCash", { precision: 10, scale: 2 }).notNull(),
  totalCard: decimal("totalCard", { precision: 10, scale: 2 }).notNull(),
  totalVipps: decimal("totalVipps", { precision: 10, scale: 2 }).notNull(),
  totalTips: decimal("totalTips", { precision: 10, scale: 2 }).notNull(),
  excelUrl: text("excelUrl"),
  excelKey: text("excelKey"),
  pdfUrl: text("pdfUrl"),
  pdfKey: text("pdfKey"),
  emailedTo: varchar("emailedTo", { length: 320 }),
  emailedAt: timestamp("emailedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * ============================================
 * TYPES
 * ============================================
 */

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

export type Service = typeof services.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type DropInQueue = typeof dropInQueue.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type SalonSettings = typeof salonSettings.$inferSelect;
export type BusinessHours = typeof businessHours.$inferSelect;
export type DailyReport = typeof dailyReports.$inferSelect;

export const terminalReaders = mysqlTable("terminalReaders", {
  id: varchar("id", { length: 255 }).primaryKey(), // Stripe reader ID (e.g., tmr_xxxxx)
  label: varchar("label", { length: 255 }).notNull(),
  locationId: varchar("locationId", { length: 255 }).notNull(),
  serialNumber: varchar("serialNumber", { length: 255 }),
  deviceType: varchar("deviceType", { length: 100 }), // e.g., "bbpos_wisepos_e"
  status: varchar("status", { length: 50 }), // "online", "offline"
  ipAddress: varchar("ipAddress", { length: 50 }),
  lastSeenAt: timestamp("lastSeenAt"),
  registeredAt: timestamp("registeredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TerminalReader = typeof terminalReaders.$inferSelect;
