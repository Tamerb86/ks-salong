import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Unified PIN System", () => {
  const universalPin = "1234";

  beforeAll(async () => {
    // Ensure universal PIN is set
    await db.updateSalonSettings({ universalPin });
  });

  it("should verify universal PIN is configured correctly", async () => {
    const settings = await db.getSalonSettings();
    expect(settings).toBeDefined();
    expect(settings?.universalPin).toBe(universalPin);
  });

  it("should list only active employees for selection", async () => {
    const caller = appRouter.createCaller({ user: null });

    const activeEmployees = await caller.staff.listActive();

    expect(Array.isArray(activeEmployees)).toBe(true);
    expect(activeEmployees.length).toBeGreaterThan(0);
    
    // All returned employees should be active
    activeEmployees.forEach((employee: any) => {
      expect(employee.isActive).toBe(true);
    });
  });

  it("should reject invalid universal PIN for clock-in", async () => {
    const caller = appRouter.createCaller({ user: null });

    // Get any active employee
    const activeEmployees = await caller.staff.listActive();
    expect(activeEmployees.length).toBeGreaterThan(0);
    
    const testEmployee = activeEmployees[0];

    await expect(
      caller.timeTracking.clockIn({
        pin: "9999", // Wrong PIN
        employeeId: testEmployee.id,
      })
    ).rejects.toThrow("Ugyldig PIN");
  });

  it("should allow clock-in with valid universal PIN", async () => {
    const caller = appRouter.createCaller({ user: null });

    // Get any active employee
    const activeEmployees = await caller.staff.listActive();
    expect(activeEmployees.length).toBeGreaterThan(0);
    
    const testEmployee = activeEmployees[0];

    // Try to clock out first in case already clocked in
    try {
      await caller.timeTracking.clockOut({
        pin: universalPin,
        employeeId: testEmployee.id,
      });
    } catch (error) {
      // Ignore if not clocked in
    }

    // Now clock in
    const result = await caller.timeTracking.clockIn({
      pin: universalPin,
      employeeId: testEmployee.id,
    });

    expect(result).toBeDefined();
    expect(result.employee).toBeDefined();
    expect(result.employee.id).toBe(testEmployee.id);
    expect(result.timeEntry).toBeDefined();
    expect(result.timeEntry.clockIn).toBeInstanceOf(Date);
  });

  it("should allow clock-out with valid universal PIN", async () => {
    const caller = appRouter.createCaller({ user: null });

    // Get any active employee
    const activeEmployees = await caller.staff.listActive();
    expect(activeEmployees.length).toBeGreaterThan(0);
    
    const testEmployee = activeEmployees[0];

    // Ensure employee is clocked in
    try {
      await caller.timeTracking.clockIn({
        pin: universalPin,
        employeeId: testEmployee.id,
      });
    } catch (error) {
      // May already be clocked in
    }

    // Now clock out
    const result = await caller.timeTracking.clockOut({
      pin: universalPin,
      employeeId: testEmployee.id,
    });

    expect(result).toBeDefined();
    expect(result.employee).toBeDefined();
    expect(result.employee.id).toBe(testEmployee.id);
    expect(result.timeEntry).toBeDefined();
    expect(result.timeEntry.clockOut).toBeInstanceOf(Date);
  });
});
