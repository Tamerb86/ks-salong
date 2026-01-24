import { eq, and, gte, lte, desc, asc, sql, or, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, permissions, services, products, serviceStaff,
  appointments, dropInQueue, payments, orders, orderItems, timeEntries,
  customers, salonSettings, businessHours, holidays, notificationTemplates,
  dailyReports, auditLogs
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * ============================================
 * USER MANAGEMENT
 * ============================================
 */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'owner';
      updateSet.role = 'owner';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByPin(pin: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users)
    .where(and(eq(users.pin, pin), eq(users.isActive, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStaff() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users)
    .where(and(
      sql`${users.role} IN ('owner', 'manager', 'barber', 'cashier')`,
      eq(users.isActive, true)
    ))
    .orderBy(asc(users.name));
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

/**
 * ============================================
 * SERVICES & PRODUCTS
 * ============================================
 */

export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(services)
    .where(eq(services.isActive, true))
    .orderBy(asc(services.name));
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createService(data: typeof services.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(services).values(data);
  return Number(result[0].insertId);
}

export async function updateService(id: number, data: Partial<typeof services.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(services).set(data).where(eq(services.id, id));
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(services).set({ isActive: false }).where(eq(services.id, id));
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.name));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: typeof products.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(products).values(data);
  return Number(result[0].insertId);
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function updateProductStock(id: number, quantity: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(products)
    .set({ stock: sql`${products.stock} + ${quantity}` })
    .where(eq(products.id, id));
}

/**
 * ============================================
 * APPOINTMENTS
 * ============================================
 */

export async function getAppointmentsByDate(date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await db.select().from(appointments)
    .where(and(
      gte(appointments.appointmentDate, startOfDay),
      lte(appointments.appointmentDate, endOfDay)
    ))
    .orderBy(asc(appointments.startTime));
}

export async function getAppointmentsByStaffAndDate(staffId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await db.select().from(appointments)
    .where(and(
      eq(appointments.staffId, staffId),
      gte(appointments.appointmentDate, startOfDay),
      lte(appointments.appointmentDate, endOfDay),
      sql`${appointments.status} NOT IN ('cancelled')`
    ))
    .orderBy(asc(appointments.startTime));
}

export async function createAppointment(data: typeof appointments.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(appointments).values(data);
  return Number(result[0].insertId);
}

export async function updateAppointment(id: number, data: Partial<typeof appointments.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(appointments).set(data).where(eq(appointments.id, id));
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * ============================================
 * DROP-IN QUEUE
 * ============================================
 */

export async function getActiveQueue() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(dropInQueue)
    .where(eq(dropInQueue.status, 'waiting'))
    .orderBy(asc(dropInQueue.position));
}

export async function addToQueue(data: typeof dropInQueue.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  
  // Get the next position
  const maxPosition = await db.select({ max: sql<number>`MAX(${dropInQueue.position})` })
    .from(dropInQueue)
    .where(eq(dropInQueue.status, 'waiting'));
  
  const nextPosition = (maxPosition[0]?.max || 0) + 1;
  
  const result = await db.insert(dropInQueue).values({
    ...data,
    position: nextPosition
  });
  return Number(result[0].insertId);
}

export async function updateQueueItem(id: number, data: Partial<typeof dropInQueue.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(dropInQueue).set(data).where(eq(dropInQueue.id, id));
}

export async function reorderQueue(updates: { id: number; position: number }[]) {
  const db = await getDb();
  if (!db) return;
  
  for (const update of updates) {
    await db.update(dropInQueue)
      .set({ position: update.position })
      .where(eq(dropInQueue.id, update.id));
  }
}

/**
 * ============================================
 * CUSTOMERS
 * ============================================
 */

export async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers)
    .where(eq(customers.isActive, true))
    .orderBy(desc(customers.lastVisit));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchCustomers(query: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customers)
    .where(and(
      eq(customers.isActive, true),
      or(
        like(customers.firstName, `%${query}%`),
        like(customers.lastName, `%${query}%`),
        like(customers.phone, `%${query}%`),
        like(customers.email, `%${query}%`)
      )
    ))
    .limit(20);
}

export async function createCustomer(data: typeof customers.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(customers).values(data);
  return Number(result[0].insertId);
}

export async function updateCustomer(id: number, data: Partial<typeof customers.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(customers).set(data).where(eq(customers.id, id));
}

/**
 * ============================================
 * ORDERS & PAYMENTS
 * ============================================
 */

export async function createOrder(orderData: typeof orders.$inferInsert, items: typeof orderItems.$inferInsert[]) {
  const db = await getDb();
  if (!db) return;
  
  const result = await db.insert(orders).values(orderData);
  const orderId = Number(result[0].insertId);
  
  for (const item of items) {
    await db.insert(orderItems).values({ ...item, orderId });
  }
  
  return orderId;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createPayment(data: typeof payments.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(payments).values(data);
  return Number(result[0].insertId);
}

export async function updatePayment(id: number, data: Partial<typeof payments.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(payments).set(data).where(eq(payments.id, id));
}

/**
 * ============================================
 * TIME TRACKING
 * ============================================
 */

export async function clockIn(staffId: number) {
  const db = await getDb();
  if (!db) return;
  
  const result = await db.insert(timeEntries).values({
    staffId,
    clockIn: new Date()
  });
  return Number(result[0].insertId);
}

export async function clockOut(entryId: number) {
  const db = await getDb();
  if (!db) return;
  
  const entry = await db.select().from(timeEntries).where(eq(timeEntries.id, entryId)).limit(1);
  if (entry.length === 0) return;
  
  const clockOutTime = new Date();
  const clockInTime = entry[0].clockIn;
  const breakMinutes = entry[0].totalBreakMinutes || 0;
  
  const totalMinutes = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / 60000);
  const workMinutes = totalMinutes - breakMinutes;
  
  // Calculate overtime (assuming 8 hours = 480 minutes is regular)
  const overtimeMinutes = Math.max(0, workMinutes - 480);
  
  await db.update(timeEntries).set({
    clockOut: clockOutTime,
    totalWorkMinutes: workMinutes,
    overtimeMinutes
  }).where(eq(timeEntries.id, entryId));
}

export async function getTimeEntriesByStaffAndDate(staffId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await db.select().from(timeEntries)
    .where(and(
      eq(timeEntries.staffId, staffId),
      gte(timeEntries.clockIn, startOfDay),
      lte(timeEntries.clockIn, endOfDay)
    ))
    .orderBy(desc(timeEntries.clockIn));
}

export async function startBreak(entryId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(timeEntries).set({
    breakStart: new Date()
  }).where(eq(timeEntries.id, entryId));
}

export async function endBreak(entryId: number) {
  const db = await getDb();
  if (!db) return;
  
  const entry = await db.select().from(timeEntries).where(eq(timeEntries.id, entryId)).limit(1);
  if (entry.length === 0 || !entry[0].breakStart) return;
  
  const breakEnd = new Date();
  const breakStart = entry[0].breakStart;
  const breakMinutes = Math.floor((breakEnd.getTime() - breakStart.getTime()) / 60000);
  const totalBreakMinutes = (entry[0].totalBreakMinutes || 0) + breakMinutes;
  
  await db.update(timeEntries).set({
    breakEnd,
    totalBreakMinutes
  }).where(eq(timeEntries.id, entryId));
}

export async function updateTimeEntry(entryId: number, data: {
  clockInTime?: Date;
  clockOutTime?: Date;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = {};
  if (data.clockInTime) updateData.clockIn = data.clockInTime;
  if (data.clockOutTime) updateData.clockOut = data.clockOutTime;
  if (data.notes !== undefined) updateData.notes = data.notes;
  
  await db.update(timeEntries).set(updateData).where(eq(timeEntries.id, entryId));
}

/**
 * ============================================
 * SETTINGS
 * ============================================
 */

export async function getSalonSettings() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(salonSettings).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSalonSettings(data: Partial<typeof salonSettings.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getSalonSettings();
  if (existing) {
    await db.update(salonSettings).set(data).where(eq(salonSettings.id, existing.id));
  } else {
    await db.insert(salonSettings).values(data as typeof salonSettings.$inferInsert);
  }
}

export async function getBusinessHours() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(businessHours).orderBy(asc(businessHours.dayOfWeek));
}

export async function updateBusinessHours(dayOfWeek: number, data: Partial<typeof businessHours.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select().from(businessHours)
    .where(eq(businessHours.dayOfWeek, dayOfWeek))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(businessHours).set(data).where(eq(businessHours.dayOfWeek, dayOfWeek));
  } else {
    await db.insert(businessHours).values({ ...data, dayOfWeek } as typeof businessHours.$inferInsert);
  }
}

/**
 * ============================================
 * AUDIT LOGS
 * ============================================
 */

export async function createAuditLog(data: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(data);
}
