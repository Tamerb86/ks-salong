import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Terminal Payment Integration", () => {
  let testAppointmentId: number;
  let testCustomerId: number;
  let testServiceId: number;
  let testStaffId: number;

  beforeAll(async () => {
    // Create test customer
    testCustomerId = await db.createCustomer({
      firstName: "Test",
      lastName: "Terminal Customer",
      phone: "+4712345678",
      email: "terminal@test.com",
    });

    // Get existing staff (assuming at least one exists from seed data)
    const allStaff = await db.getAllStaff();
    if (allStaff.length === 0) {
      throw new Error("No staff found in database. Please run seed data first.");
    }
    testStaffId = allStaff[0].id;

    // Create test service
    testServiceId = await db.createService({
      name: "Test Haircut",
      duration: 30,
      price: "500.00",
      isActive: true,
    });

    // Create test appointment
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1); // Tomorrow

    testAppointmentId = await db.createAppointment({
      customerId: testCustomerId,
      staffId: testStaffId,
      serviceId: testServiceId,
      appointmentDate,
      startTime: "10:00",
      endTime: "10:30",
      status: "confirmed",
    });
  });

  it("should create payment record linked to appointment", async () => {
    const paymentId = await db.createPayment({
      appointmentId: testAppointmentId,
      customerId: testCustomerId,
      amount: "500.00",
      method: "stripe",
      provider: "stripe",
      status: "captured",
      providerTransactionId: "pi_test_123456",
    });

    expect(paymentId).toBeGreaterThan(0);

    const payments = await db.getPaymentsByAppointmentId(testAppointmentId);
    expect(payments.length).toBe(1);
    expect(payments[0].amount).toBe("500.00");
    expect(payments[0].method).toBe("stripe");
    expect(payments[0].status).toBe("captured");
  });

  it("should update appointment paymentStatus after successful payment", async () => {
    await db.updateAppointment(testAppointmentId, {
      paymentStatus: "paid",
    });

    const appointment = await db.getAppointmentById(testAppointmentId);
    expect(appointment).toBeDefined();
    expect(appointment?.paymentStatus).toBe("paid");
  });

  it("should retrieve payments with filters", async () => {
    // Create additional payment
    await db.createPayment({
      appointmentId: testAppointmentId,
      customerId: testCustomerId,
      amount: "250.00",
      method: "vipps",
      provider: "vipps",
      status: "pending",
      providerTransactionId: "vipps_test_789",
    });

    // Test status filter
    const capturedPayments = await db.getPayments({ status: "captured" });
    expect(capturedPayments.length).toBeGreaterThan(0);
    expect(capturedPayments.every((p: any) => p.status === "captured")).toBe(true);

    // Test method filter
    const stripePayments = await db.getPayments({ method: "stripe" });
    expect(stripePayments.length).toBeGreaterThan(0);
    expect(stripePayments.every((p: any) => p.method === "stripe")).toBe(true);
  });

  it("should retrieve payments with date range filter", async () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    const paymentsToday = await db.getPayments({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    expect(Array.isArray(paymentsToday)).toBe(true);
    // All payments should be within today's date range
    paymentsToday.forEach((payment: any) => {
      const paymentDate = new Date(payment.createdAt);
      expect(paymentDate >= startDate).toBe(true);
      expect(paymentDate <= endDate).toBe(true);
    });
  });

  it("should include customer name in payment list", async () => {
    const payments = await db.getPayments({});
    const paymentWithCustomer = payments.find((p: any) => p.customerId === testCustomerId);
    
    expect(paymentWithCustomer).toBeDefined();
    expect(paymentWithCustomer?.customerName).toBeDefined();
    expect(paymentWithCustomer?.customerName).toContain("Test");
  });

  it("should handle payments without appointment link", async () => {
    // Create payment without appointment (e.g., direct POS sale)
    const paymentId = await db.createPayment({
      customerId: testCustomerId,
      amount: "100.00",
      method: "cash",
      status: "captured",
    });

    expect(paymentId).toBeGreaterThan(0);

    const payments = await db.getPayments({});
    const cashPayment = payments.find((p: any) => p.id === paymentId);
    
    expect(cashPayment).toBeDefined();
    expect(cashPayment?.appointmentId).toBeNull();
    expect(cashPayment?.method).toBe("cash");
  });
});
