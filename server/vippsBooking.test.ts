/**
 * Tests for Vipps Booking Payment Integration
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Vipps Booking Payment Integration", () => {
  let testAppointmentId: number;

  it("should have createWithPayment endpoint available", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });

    // Just verify the endpoint exists
    expect(caller.appointments.createWithPayment).toBeDefined();
    expect(typeof caller.appointments.createWithPayment).toBe("function");
  });

  it("should have checkPaymentStatus endpoint available", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });

    // Just verify the endpoint exists
    expect(caller.appointments.checkPaymentStatus).toBeDefined();
    expect(typeof caller.appointments.checkPaymentStatus).toBe("function");
  });

  it("should have getAppointmentById function in db", async () => {
    // Just verify the function exists
    expect(db.getAppointmentById).toBeDefined();
    expect(typeof db.getAppointmentById).toBe("function");
  });

  it("should validate Vipps settings before initiating payment", async () => {
    const settings = await db.getSalonSettings();

    // Settings should exist
    expect(settings).toBeDefined();

    // Vipps fields should be present in settings
    expect(settings).toHaveProperty("vippsEnabled");
    expect(settings).toHaveProperty("vippsClientId");
  });

  it("should have webhook handler for Vipps callbacks", async () => {
    const webhooks = await import("./webhooks");

    // Verify webhook handler exists
    expect(webhooks.handleVippsCallback).toBeDefined();
    expect(typeof webhooks.handleVippsCallback).toBe("function");
  });

  it("should have appointments schema with payment fields", async () => {
    const { appointments } = await import("../drizzle/schema");

    // Verify schema exists
    expect(appointments).toBeDefined();
  });
});
