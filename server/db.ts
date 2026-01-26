import { eq, and, gte, lte, desc, asc, sql, or, like, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, permissions, services, products, serviceStaff,
  appointments, dropInQueue, payments, orders, orderItems, timeEntries,
  customers, salonSettings, businessHours, holidays, notificationTemplates,
  dailyReports, auditLogs, terminalReaders, fikenSyncLogs, dashboardAccessLogs,
  customerNotes, customerTags, staffLeaves
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

// Staff Leave Management Functions (exported below at line 1521+)

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

export async function getStaffById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(users).where(eq(users.id, id));
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

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
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

export async function getAppointmentsByDateRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const results = await db.select({
    id: appointments.id,
    customerId: appointments.customerId,
    staffId: appointments.staffId,
    serviceId: appointments.serviceId,
    appointmentDate: appointments.appointmentDate,
    startTime: appointments.startTime,
    endTime: appointments.endTime,
    status: appointments.status,
    notes: appointments.notes,
    customer: {
      id: customers.id,
      firstName: customers.firstName,
      lastName: customers.lastName,
      phone: customers.phone,
      email: customers.email,
    },
    staff: {
      id: users.id,
      name: users.name,
    },
    service: {
      id: services.id,
      name: services.name,
      price: services.price,
      duration: services.duration,
    },
  })
  .from(appointments)
  .leftJoin(customers, eq(appointments.customerId, customers.id))
  .leftJoin(users, eq(appointments.staffId, users.id))
  .leftJoin(services, eq(appointments.serviceId, services.id))
  .where(and(
    gte(appointments.appointmentDate, start),
    lte(appointments.appointmentDate, end)
  ))
  .orderBy(asc(appointments.appointmentDate), asc(appointments.startTime));
  
  return results;
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
  
  const result = await db.select({
    id: appointments.id,
    customerId: appointments.customerId,
    staffId: appointments.staffId,
    serviceId: appointments.serviceId,
    appointmentDate: appointments.appointmentDate,
    startTime: appointments.startTime,
    endTime: appointments.endTime,
    status: appointments.status,
    notes: appointments.notes,
    customer: {
      id: customers.id,
      firstName: customers.firstName,
      lastName: customers.lastName,
      phone: customers.phone,
      email: customers.email,
    },
    staff: {
      id: users.id,
      name: users.name,
    },
    service: {
      id: services.id,
      name: services.name,
      price: services.price,
      duration: services.duration,
    },
  })
  .from(appointments)
  .leftJoin(customers, eq(appointments.customerId, customers.id))
  .leftJoin(users, eq(appointments.staffId, users.id))
  .leftJoin(services, eq(appointments.serviceId, services.id))
  .where(eq(appointments.id, id))
  .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getAppointmentByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(appointments)
    .where(eq(appointments.cancellationToken, token))
    .limit(1);
  
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
  return await db.select({
    id: dropInQueue.id,
    customerName: dropInQueue.customerName,
    customerPhone: dropInQueue.customerPhone,
    serviceId: dropInQueue.serviceId,
    serviceName: services.name,
    preferredStaffId: dropInQueue.preferredStaffId,
    position: dropInQueue.position,
    status: dropInQueue.status,
    estimatedWaitTime: dropInQueue.estimatedWaitTime,
    convertedToAppointmentId: dropInQueue.convertedToAppointmentId,
    createdAt: dropInQueue.createdAt,
    updatedAt: dropInQueue.updatedAt,
  })
    .from(dropInQueue)
    .leftJoin(services, eq(dropInQueue.serviceId, services.id))
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

// Removed - replaced with enhanced version below in CRM section

// Removed - replaced with enhanced version below in CRM section

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

export async function getCustomerByPhone(phone: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  return result[0] || null;
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

export async function getCustomerBookingHistory(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: appointments.id,
    appointmentDate: appointments.appointmentDate,
    startTime: appointments.startTime,
    endTime: appointments.endTime,
    status: appointments.status,
    notes: appointments.notes,
    serviceName: services.name,
    servicePrice: services.price,
    staffName: users.name,
  })
    .from(appointments)
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(users, eq(appointments.staffId, users.id))
    .where(eq(appointments.customerId, customerId))
    .orderBy(desc(appointments.appointmentDate));
}

export async function getCustomerStatistics(customerId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Get total visits (completed appointments)
  const completedAppointments = await db.select({
    count: sql<number>`count(*)`,
  })
    .from(appointments)
    .where(and(
      eq(appointments.customerId, customerId),
      eq(appointments.status, 'completed')
    ));
  
  // Get total spending from orders
  const totalSpending = await db.select({
    total: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
  })
    .from(orders)
    .where(eq(orders.customerId, customerId));
  
  // Get last visit date
  const lastVisit = await db.select({
    date: appointments.appointmentDate,
  })
    .from(appointments)
    .where(and(
      eq(appointments.customerId, customerId),
      eq(appointments.status, 'completed')
    ))
    .orderBy(desc(appointments.appointmentDate))
    .limit(1);
  
  return {
    totalVisits: Number(completedAppointments[0]?.count || 0),
    totalSpending: Number(totalSpending[0]?.total || 0),
    lastVisit: lastVisit[0]?.date || null,
  };
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

export async function getOrdersByFilters(filters: {
  dateFrom?: string;
  dateTo?: string;
  staffId?: number;
  paymentMethod?: string;
}) {
  const dbConn = await getDb();
  if (!dbConn) return [];
  
  let query = dbConn.select({
    id: orders.id,
    orderNumber: orders.orderNumber,
    customerId: orders.customerId,
    staffId: orders.staffId,
    staffName: users.name,
    subtotal: orders.subtotal,
    taxAmount: orders.taxAmount,
    discountAmount: orders.discountAmount,
    tipAmount: orders.tipAmount,
    total: orders.total,
    status: orders.status,
    paymentMethod: sql<string>`${payments.method}`.as('paymentMethod'),
    notes: orders.notes,
    createdAt: orders.createdAt,
  })
  .from(orders)
  .leftJoin(users, eq(orders.staffId, users.id))
  .leftJoin(payments, eq(orders.id, payments.orderId));
  
  const conditions = [];
  
  if (filters.dateFrom) {
    conditions.push(gte(orders.createdAt, new Date(filters.dateFrom)));
  }
  
  if (filters.dateTo) {
    const endDate = new Date(filters.dateTo);
    endDate.setHours(23, 59, 59, 999);
    conditions.push(lte(orders.createdAt, endDate));
  }
  
  if (filters.staffId) {
    conditions.push(eq(orders.staffId, filters.staffId));
  }
  
  if (filters.paymentMethod) {
    conditions.push(sql`${payments.method} = ${filters.paymentMethod}`);
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const result = await query.orderBy(desc(orders.createdAt));
  return result;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  return result;
}

export async function updateOrderStatus(orderId: number, status: string, refundReason?: string) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { status };
  if (refundReason) {
    updateData.notes = sql`CONCAT(COALESCE(${orders.notes}, ''), ' [Refund: ', ${refundReason}, ']')`;
  }
  
  await db.update(orders)
    .set(updateData)
    .where(eq(orders.id, orderId));
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


/**
 * ============================================
 * TIME TRACKING
 * ============================================
 */

// Verify PIN and get employee
export async function verifyEmployeePin(pin: string) {
  const db = await getDb();
  if (!db) return null;
  
  const employee = await db
    .select()
    .from(users)
    .where(and(
      eq(users.pin, pin),
      eq(users.isActive, true)
    ))
    .limit(1);
  
  return employee[0] || null;
}

// Clock in employee
export async function clockInEmployee(staffId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Check if already clocked in
  const existing = await db
    .select()
    .from(timeEntries)
    .where(and(
      eq(timeEntries.staffId, staffId),
      isNull(timeEntries.clockOut)
    ))
    .limit(1);
  
  if (existing[0]) {
    return { error: "Already clocked in", entry: existing[0] };
  }
  
  const result = await db.insert(timeEntries).values({
    staffId,
    clockIn: new Date(),
  });
  
  return { success: true, id: result[0].insertId };
}

// Clock out employee
export async function clockOutEmployee(staffId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const entry = await db
    .select()
    .from(timeEntries)
    .where(and(
      eq(timeEntries.staffId, staffId),
      isNull(timeEntries.clockOut)
    ))
    .limit(1);
  
  if (!entry[0]) {
    return { error: "Not clocked in" };
  }
  
  const clockOut = new Date();
  const clockIn = entry[0].clockIn;
  const totalMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / 60000);
  
  // Calculate overtime (weekends = Saturday & Sunday)
  const dayOfWeek = clockIn.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const overtimeMinutes = isWeekend ? totalMinutes : 0;
  
  await db
    .update(timeEntries)
    .set({
      clockOut,
      totalWorkMinutes: totalMinutes - entry[0].totalBreakMinutes,
      overtimeMinutes,
    })
    .where(eq(timeEntries.id, entry[0].id));
  
  return { success: true, totalMinutes, overtimeMinutes };
}

// Get currently clocked in employees
export async function getClockedInEmployees() {
  const db = await getDb();
  if (!db) return [];
  
  const entries = await db
    .select({
      id: timeEntries.id,
      staffId: timeEntries.staffId,
      clockIn: timeEntries.clockIn,
      name: users.name,
      role: users.role,
    })
    .from(timeEntries)
    .leftJoin(users, eq(timeEntries.staffId, users.id))
    .where(isNull(timeEntries.clockOut))
    .orderBy(desc(timeEntries.clockIn));
  
  return entries;
}

// Get time entries for date range
export async function getTimeEntries(startDate: Date, endDate: Date, staffId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    gte(timeEntries.clockIn, startDate),
    lte(timeEntries.clockIn, endDate),
  ];
  
  if (staffId) {
    conditions.push(eq(timeEntries.staffId, staffId));
  }
  
  const entries = await db
    .select({
      id: timeEntries.id,
      staffId: timeEntries.staffId,
      staffName: users.name,
      clockIn: timeEntries.clockIn,
      clockOut: timeEntries.clockOut,
      totalWorkMinutes: timeEntries.totalWorkMinutes,
      overtimeMinutes: timeEntries.overtimeMinutes,
      totalBreakMinutes: timeEntries.totalBreakMinutes,
    })
    .from(timeEntries)
    .leftJoin(users, eq(timeEntries.staffId, users.id))
    .where(and(...conditions))
    .orderBy(desc(timeEntries.clockIn));
  
  return entries;
}

// Get employee work summary
export async function getEmployeeWorkSummary(staffId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;
  
  const entries = await getTimeEntries(startDate, endDate, staffId);
  
  const totalWorkMinutes = entries.reduce((sum, e) => sum + (e.totalWorkMinutes || 0), 0);
  const totalOvertimeMinutes = entries.reduce((sum, e) => sum + (e.overtimeMinutes || 0), 0);
  const totalBreakMinutes = entries.reduce((sum, e) => sum + (e.totalBreakMinutes || 0), 0);
  const totalDays = entries.filter(e => e.clockOut).length;
  
  return {
    staffId,
    totalWorkMinutes,
    totalOvertimeMinutes,
    totalBreakMinutes,
    totalDays,
    totalWorkHours: (totalWorkMinutes / 60).toFixed(2),
    totalOvertimeHours: (totalOvertimeMinutes / 60).toFixed(2),
    entries,
  };
}

/**
 * ============================================
 * STRIPE TERMINAL READERS
 * ============================================
 */

// Save Terminal Reader
export async function saveTerminalReader(reader: {
  id: string;
  label: string;
  locationId: string;
  serialNumber?: string;
  deviceType?: string;
  status?: string;
  ipAddress?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.insert(terminalReaders).values({
    id: reader.id,
    label: reader.label,
    locationId: reader.locationId,
    serialNumber: reader.serialNumber || null,
    deviceType: reader.deviceType || null,
    status: reader.status || "offline",
    ipAddress: reader.ipAddress || null,
    lastSeenAt: new Date(),
  }).onDuplicateKeyUpdate({
    set: {
      label: reader.label,
      status: reader.status || "offline",
      ipAddress: reader.ipAddress || null,
      lastSeenAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

// Get all Terminal Readers
export async function getTerminalReaders() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(terminalReaders).orderBy(desc(terminalReaders.registeredAt));
}

// Get Terminal Reader by ID
export async function getTerminalReaderById(id: string) {
  const db = await getDb();
  if (!db) return null;
  
  const [reader] = await db.select().from(terminalReaders).where(eq(terminalReaders.id, id)).limit(1);
  return reader || null;
}

// Delete Terminal Reader
export async function deleteTerminalReader(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.delete(terminalReaders).where(eq(terminalReaders.id, id));
}

export async function getPendingPaymentAppointments() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(appointments)
    .leftJoin(customers, eq(appointments.customerId, customers.id))
    .where(eq(appointments.paymentStatus, 'pending'));
  
  return result.map(row => ({
    ...row.appointments,
    customer: row.customers
  }));
}

export async function cancelAppointment(id: number, cancellationReason: string) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(appointments)
    .set({ 
      status: 'cancelled',
      notes: cancellationReason,
      updatedAt: new Date()
    })
    .where(eq(appointments.id, id));
}

export async function getOrdersByDateRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, new Date(startDate)),
        lte(orders.createdAt, new Date(endDate + "T23:59:59")),
        eq(orders.status, 'completed')
      )
    );
  
  // Get order items for each order
  const ordersWithItems = await Promise.all(
    result.map(async (order) => {
      const items = await getOrderItems(order.id);
      return {
        ...order,
        orderItems: items.map(item => ({
          itemName: item.itemName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || "25.00",
        })),
      };
    })
  );
  
  return ordersWithItems;
}

export async function createFikenSyncLog(logData: typeof fikenSyncLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(fikenSyncLogs).values(logData);
  // Return the last inserted ID
  const inserted = await db.select().from(fikenSyncLogs).orderBy(desc(fikenSyncLogs.id)).limit(1);
  return inserted[0]?.id || null;
}

export async function updateFikenSyncLog(
  logId: number,
  updates: Partial<typeof fikenSyncLogs.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(fikenSyncLogs).set(updates).where(eq(fikenSyncLogs.id, logId));
}

export async function getFikenSyncLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(fikenSyncLogs)
    .orderBy(desc(fikenSyncLogs.createdAt))
    .limit(limit);
}

export async function getFikenSyncLogsByDateRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(fikenSyncLogs)
    .where(
      and(
        gte(fikenSyncLogs.syncDate, startDate),
        lte(fikenSyncLogs.syncDate, endDate)
      )
    )
    .orderBy(desc(fikenSyncLogs.createdAt));
}

/**
 * ============================================
 * DASHBOARD ACCESS LOGS
 * ============================================
 */

export async function logDashboardAccess(data: {
  userId: number;
  userName: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(dashboardAccessLogs).values({
    userId: data.userId,
    userName: data.userName,
    userRole: data.userRole || null,
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
  });

  return result;
}

export async function getDashboardAccessLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(dashboardAccessLogs)
    .orderBy(desc(dashboardAccessLogs.loginTime))
    .limit(limit);
}

export async function getDashboardAccessLogsByUser(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(dashboardAccessLogs)
    .where(eq(dashboardAccessLogs.userId, userId))
    .orderBy(desc(dashboardAccessLogs.loginTime))
    .limit(limit);
}

/**
 * ============================================
 * CUSTOMER CRM FUNCTIONS
 * ============================================
 */

// Get all customers with pagination and search
export async function getAllCustomers(params: {
  search?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { customers: [], total: 0 };

  const { search, tag, limit = 50, offset = 0 } = params;

  let query = db.select().from(customers);

  // Apply search filter
  if (search) {
    query = query.where(
      or(
        like(customers.firstName, `%${search}%`),
        like(customers.lastName, `%${search}%`),
        like(customers.phone, `%${search}%`),
        like(customers.email, `%${search}%`)
      )
    ) as any;
  }

  // Get total count
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(customers);
  const total = Number(countResult[0]?.count || 0);

  // Get paginated results
  const results = await query
    .orderBy(desc(customers.lastVisit), desc(customers.createdAt))
    .limit(limit)
    .offset(offset);

  return { customers: results, total };
}

// Get customer by ID with full details
export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0] || null;
}

// Customer Notes Functions
export async function addCustomerNote(data: {
  customerId: number;
  note: string;
  createdBy: number;
  createdByName: string;
  appointmentId?: number;
  visitDate?: Date;
}) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(customerNotes).values({
    customerId: data.customerId,
    note: data.note,
    createdBy: data.createdBy,
    createdByName: data.createdByName,
    appointmentId: data.appointmentId || null,
    visitDate: data.visitDate || null,
  });

  return Number(result[0].insertId);
}

export async function getCustomerNotes(customerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(customerNotes)
    .where(eq(customerNotes.customerId, customerId))
    .orderBy(desc(customerNotes.createdAt));
}

export async function updateCustomerNote(id: number, note: string) {
  const db = await getDb();
  if (!db) return;

  await db.update(customerNotes).set({ note }).where(eq(customerNotes.id, id));
}

export async function deleteCustomerNote(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(customerNotes).where(eq(customerNotes.id, id));
}

// Customer Tags Functions
export async function addCustomerTag(data: {
  customerId: number;
  tag: string;
  addedBy?: number;
  addedByName?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(customerTags).values({
      customerId: data.customerId,
      tag: data.tag as any,
      addedBy: data.addedBy || null,
      addedByName: data.addedByName || null,
    });

    return Number(result[0].insertId);
  } catch (error) {
    // Handle duplicate tag error
    console.error("Error adding customer tag:", error);
    return null;
  }
}

export async function getCustomerTags(customerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(customerTags)
    .where(eq(customerTags.customerId, customerId))
    .orderBy(desc(customerTags.createdAt));
}

export async function deleteCustomerTag(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(customerTags).where(eq(customerTags.id, id));
}

export async function getCustomersByTag(tag: string) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      customer: customers,
      tag: customerTags,
    })
    .from(customerTags)
    .innerJoin(customers, eq(customerTags.customerId, customers.id))
    .where(eq(customerTags.tag, tag as any));

  return result.map(r => r.customer);
}

// Find potential duplicate customers
export async function findDuplicateCustomers() {
  const db = await getDb();
  if (!db) return [];

  // Find customers with same phone number
  const duplicates = await db
    .select({
      phone: customers.phone,
      count: sql<number>`count(*)`,
    })
    .from(customers)
    .groupBy(customers.phone)
    .having(sql`count(*) > 1`);

  const results = [];
  for (const dup of duplicates) {
    const matchingCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, dup.phone));
    
    if (matchingCustomers.length > 1) {
      results.push(matchingCustomers);
    }
  }

  return results;
}

// Merge two customer records
export async function mergeCustomers(keepId: number, deleteId: number) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Get both customers
    const keepCustomer = await getCustomerById(keepId);
    const deleteCustomer = await getCustomerById(deleteId);

    if (!keepCustomer || !deleteCustomer) {
      return { success: false, error: "One or both customers not found" };
    }

    // Update all appointments to point to keep customer
    await db
      .update(appointments)
      .set({ customerId: keepId })
      .where(eq(appointments.customerId, deleteId));

    // Update all notes to point to keep customer
    // Get all notes from delete customer
    const notesToMerge = await getCustomerNotes(deleteId);
    
    // Delete notes from delete customer (they will be re-created under keep customer)
    await db.delete(customerNotes).where(eq(customerNotes.customerId, deleteId));
    
    // Re-create notes under keep customer
    for (const note of notesToMerge) {
      await db.insert(customerNotes).values({
        customerId: keepId,
        appointmentId: note.appointmentId,
        note: note.note,
        createdBy: note.createdBy,
        createdByName: note.createdByName,
        visitDate: note.visitDate,
        createdAt: note.createdAt,
      });
    }

    // Copy tags from delete customer to keep customer
    const tagsToMerge = await getCustomerTags(deleteId);
    for (const tag of tagsToMerge) {
      try {
        await addCustomerTag({
          customerId: keepId,
          tag: tag.tag,
          addedBy: tag.addedBy || undefined,
          addedByName: tag.addedByName || undefined,
        });
      } catch (error) {
        // Ignore duplicate tag errors
        console.log(`Tag ${tag.tag} already exists for customer ${keepId}`);
      }
    }

    // Note: Statistics (totalVisits, totalSpent) are calculated dynamically from appointments
    // No need to manually update them

    // Delete the duplicate customer
    await db.delete(customers).where(eq(customers.id, deleteId));

    return { success: true };
  } catch (error) {
    console.error("Error merging customers:", error);
    return { success: false, error: String(error) };
  }
}

// GDPR: Export customer data
export async function exportCustomerData(customerId: number) {
  const db = await getDb();
  if (!db) return null;

  const customer = await getCustomerById(customerId);
  if (!customer) return null;

  const bookingHistory = await getCustomerBookingHistory(customerId);
  const notes = await getCustomerNotes(customerId);
  const tags = await getCustomerTags(customerId);
  const stats = await getCustomerStatistics(customerId);

  return {
    customer,
    bookingHistory,
    notes,
    tags,
    statistics: stats,
    exportDate: new Date().toISOString(),
  };
}

// GDPR: Delete customer data
export async function deleteCustomerData(customerId: number) {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Delete customer notes
    await db.delete(customerNotes).where(eq(customerNotes.customerId, customerId));

    // Delete customer tags
    await db.delete(customerTags).where(eq(customerTags.customerId, customerId));

    // Delete or anonymize appointments (depending on business requirements)
    // For now, we'll delete them
    await db.delete(appointments).where(eq(appointments.customerId, customerId));

    // Delete customer record
    await db.delete(customers).where(eq(customers.id, customerId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting customer data:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * ============================================
 * STAFF LEAVE MANAGEMENT
 * ============================================
 */

export async function getStaffLeaves(staffId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (staffId) {
    return await db.select().from(staffLeaves)
      .where(eq(staffLeaves.staffId, staffId))
      .orderBy(desc(staffLeaves.startDate));
  }
  
  return await db.select().from(staffLeaves)
    .orderBy(desc(staffLeaves.startDate));
}

export async function createStaffLeave(data: typeof staffLeaves.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(staffLeaves).values(data);
  return Number(result[0].insertId);
}

export async function updateStaffLeave(id: number, data: Partial<typeof staffLeaves.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(staffLeaves).set(data).where(eq(staffLeaves.id, id));
}

export async function deleteStaffLeave(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(staffLeaves).where(eq(staffLeaves.id, id));
}

export async function getStaffLeavesForDate(staffId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  // Check if the given date falls within any leave period
  return await db.select().from(staffLeaves)
    .where(and(
      eq(staffLeaves.staffId, staffId),
      eq(staffLeaves.status, "approved"),
      lte(staffLeaves.startDate, date),
      gte(staffLeaves.endDate, date)
    ));
}


export async function deleteOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function deleteOrder(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orders).where(eq(orders.id, orderId));
}

export async function createUser(data: any): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate openId for manual staff creation (required field)
  const openId = data.openId || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Build fields and values arrays for dynamic SQL
  // Build insert object dynamically to avoid Drizzle inserting default values
  const insertData: any = { openId, name: data.name };
  
  if (data.email) insertData.email = data.email;
  if (data.phone) insertData.phone = data.phone;
  if (data.role) insertData.role = data.role;
  if (data.pin) insertData.pin = data.pin;
  if (data.skillLevel) insertData.skillLevel = data.skillLevel;
  if (data.loginMethod) insertData.loginMethod = data.loginMethod;
  if (data.durationMultiplier) {
    insertData.durationMultiplier = typeof data.durationMultiplier === 'string' 
      ? parseFloat(data.durationMultiplier) 
      : data.durationMultiplier;
  }
  if (data.bookingSlotInterval) {
    insertData.bookingSlotInterval = typeof data.bookingSlotInterval === 'string'
      ? parseInt(data.bookingSlotInterval)
      : data.bookingSlotInterval;
  }
  // Only add break times if both are provided
  if (data.breakStartTime && data.breakEndTime) {
    insertData.breakStartTime = data.breakStartTime;
    insertData.breakEndTime = data.breakEndTime;
  }
  if (data.workingHoursStart) insertData.workingHoursStart = data.workingHoursStart;
  if (data.workingHoursEnd) insertData.workingHoursEnd = data.workingHoursEnd;
  if (data.workingDays) insertData.workingDays = data.workingDays;
  if (data.isActive !== undefined) insertData.isActive = data.isActive;
  
  const result = await db.insert(users).values(insertData);
  return Number(result[0].insertId);
}
