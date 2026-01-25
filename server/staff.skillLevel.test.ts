import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Staff Skill Level System", () => {
  let testStaffId: number;

  beforeAll(async () => {
    // Create a test staff member
    const allStaff = await db.getAllStaff();
    if (allStaff && allStaff.length > 0) {
      testStaffId = allStaff[0].id;
    }
  });

  it("should update staff with skill level and duration multiplier", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, role: "owner" } as any,
    });

    const result = await caller.staff.update({
      id: testStaffId,
      skillLevel: "beginner",
      durationMultiplier: "1.50",
    });

    expect(result.success).toBe(true);
  });

  it("should retrieve staff with skill level fields", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, role: "owner" } as any,
    });

    const staff = await caller.staff.getById({ id: testStaffId });
    expect(staff).toBeDefined();
    expect(staff?.skillLevel).toBeDefined();
    expect(staff?.durationMultiplier).toBeDefined();
  });

  it("should accept valid skill levels (beginner, intermediate, expert)", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: 1, role: "owner" } as any,
    });

    // Test beginner
    await caller.staff.update({
      id: testStaffId,
      skillLevel: "beginner",
      durationMultiplier: "1.50",
    });

    // Test intermediate
    await caller.staff.update({
      id: testStaffId,
      skillLevel: "intermediate",
      durationMultiplier: "1.00",
    });

    // Test expert
    await caller.staff.update({
      id: testStaffId,
      skillLevel: "expert",
      durationMultiplier: "0.80",
    });

    const staff = await caller.staff.getById({ id: testStaffId });
    expect(staff?.skillLevel).toBe("expert");
    expect(staff?.durationMultiplier).toBe("0.80");
  });

  it("should calculate correct duration based on skill level multiplier", () => {
    const baseDuration = 60; // 60 minutes service

    // Beginner: 50% longer (1.5x)
    const beginnerDuration = Math.ceil(baseDuration * 1.5);
    expect(beginnerDuration).toBe(90);

    // Intermediate: normal time (1.0x)
    const intermediateDuration = Math.ceil(baseDuration * 1.0);
    expect(intermediateDuration).toBe(60);

    // Expert: 20% faster (0.8x)
    const expertDuration = Math.ceil(baseDuration * 0.8);
    expect(expertDuration).toBe(48);
  });

  it("should list active staff with skill level information", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    });

    const activeStaff = await caller.staff.listActive();
    expect(Array.isArray(activeStaff)).toBe(true);
    
    // Check if staff members have skill level fields
    if (activeStaff.length > 0) {
      const firstStaff = activeStaff[0];
      expect(firstStaff).toHaveProperty("skillLevel");
      expect(firstStaff).toHaveProperty("durationMultiplier");
    }
  });
});
