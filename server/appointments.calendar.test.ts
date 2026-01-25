import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

describe("Appointments Calendar - Monthly View", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testCustomerId: number;
  let testStaffId: number;
  let testServiceId: number;
  let appointmentIds: number[] = [];

  beforeAll(async () => {
    // Create admin context
    const adminContext: TrpcContext = {
      user: {
        id: 1,
        name: "Admin User",
        email: "admin@test.com",
        role: "owner" as const,
        openId: "test-open-id",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        loginMethod: "manus",
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };

    caller = appRouter.createCaller(adminContext);

    // Create test customer
    testCustomerId = await db.createCustomer({
      firstName: "Calendar",
      lastName: "Test",
      phone: "+4712345678",
      email: "calendar@test.com",
    });

    // Create test staff using upsertUser
    await db.upsertUser({
      name: "Test Barber Calendar",
      email: "barber-calendar@test.com",
      role: "barber",
      openId: "test-barber-calendar-openid",
      isActive: true,
    });
    
    const staff = await db.getUserByOpenId("test-barber-calendar-openid");
    if (!staff) throw new Error("Failed to create test staff");
    testStaffId = staff.id;

    // Create test service
    testServiceId = await db.createService({
      name: "Test Haircut",
      duration: 30,
      price: 500,
      mvaRate: 25,
      isActive: true,
    });

    // Create multiple appointments for testing (use far future dates to avoid conflicts)
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() + 5); // 5 years in future
    baseDate.setMonth(2); // March
    baseDate.setDate(15);
    
    const appointments = [
      {
        customerId: testCustomerId,
        staffId: testStaffId,
        serviceId: testServiceId,
        appointmentDate: new Date(baseDate) as any,
        startTime: "09:00",
        endTime: "09:30",
        notes: "Morning appointment",
      },
      {
        customerId: testCustomerId,
        staffId: testStaffId,
        serviceId: testServiceId,
        appointmentDate: new Date(baseDate) as any,
        startTime: "10:00",
        endTime: "10:30",
        notes: "Mid-morning appointment",
      },
      {
        customerId: testCustomerId,
        staffId: testStaffId,
        serviceId: testServiceId,
        appointmentDate: new Date(baseDate.getTime() + 86400000) as any, // Next day
        startTime: "14:00",
        endTime: "14:30",
        notes: "Afternoon appointment",
      },
    ];

    for (const apt of appointments) {
      const result = await caller.appointments.create(apt);
      appointmentIds.push(result.id);
    }
  });

  it("should fetch appointments for a date range (month)", async () => {
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() + 5);
    baseDate.setMonth(2);
    const startDate = `${baseDate.getFullYear()}-03-01`;
    const endDate = `${baseDate.getFullYear()}-03-31`;
    
    const result = await caller.appointments.listByDateRange({
      startDate,
      endDate,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(3);

    // Check that appointments have related data
    const firstAppointment = result[0];
    expect(firstAppointment.customer).toBeDefined();
    expect(firstAppointment.customer?.firstName).toBe("Calendar");
    expect(firstAppointment.staff).toBeDefined();
    expect(firstAppointment.staff?.name).toBe("Test Barber Calendar");
    expect(firstAppointment.service).toBeDefined();
    expect(firstAppointment.service?.name).toBe("Test Haircut");
  });

  it("should return appointments with correct date format", async () => {
    const result = await caller.appointments.listByDateRange({
      startDate: "2026-03-15",
      endDate: "2026-03-15",
    });

    expect(result.length).toBeGreaterThanOrEqual(2);
    
    // Check date format
    result.forEach((apt) => {
      expect(apt.appointmentDate).toBeDefined();
      expect(apt.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(apt.endTime).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  it("should fetch appointment by ID with related data", async () => {
    const appointmentId = appointmentIds[0];
    const result = await caller.appointments.getById({ id: appointmentId });

    expect(result).toBeDefined();
    expect(result?.id).toBe(appointmentId);
    
    // Check related data is included
    expect(result?.customer).toBeDefined();
    expect(result?.customer?.firstName).toBe("Calendar");
    expect(result?.customer?.lastName).toBe("Test");
    expect(result?.customer?.phone).toBe("+4712345678");
    expect(result?.customer?.email).toBe("calendar@test.com");
    
    expect(result?.staff).toBeDefined();
    expect(result?.staff?.name).toBe("Test Barber Calendar");
    
    expect(result?.service).toBeDefined();
    expect(result?.service?.name).toBe("Test Haircut");
    expect(result?.service?.price).toBe("500.00");
    expect(result?.service?.duration).toBe(30);
  });

  it("should update appointment status", async () => {
    const appointmentId = appointmentIds[0];
    
    // Update to confirmed
    await caller.appointments.update({
      id: appointmentId,
      status: "confirmed",
    });

    const updated = await caller.appointments.getById({ id: appointmentId });
    expect(updated?.status).toBe("confirmed");

    // Update to completed
    await caller.appointments.update({
      id: appointmentId,
      status: "completed",
    });

    const completed = await caller.appointments.getById({ id: appointmentId });
    expect(completed?.status).toBe("completed");
  });

  it("should return empty array for date range with no appointments", async () => {
    const result = await caller.appointments.listByDateRange({
      startDate: "2026-12-01",
      endDate: "2026-12-31",
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should handle appointments across multiple days", async () => {
    const result = await caller.appointments.listByDateRange({
      startDate: "2026-03-15",
      endDate: "2026-03-16",
    });

    expect(result.length).toBeGreaterThanOrEqual(3);
    
    // Check that we have appointments on both days
    const dates = new Set(result.map((apt) => {
      const date = new Date(apt.appointmentDate);
      return date.toISOString().split('T')[0];
    }));
    
    expect(dates.size).toBeGreaterThanOrEqual(2);
  });
});
