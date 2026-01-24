import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";

describe("Staff Management - Update and Delete", () => {
  let testStaffId: number;
  let adminContext: any;

  beforeAll(async () => {
    // Create a test staff member
    const database = await db.getDb();
    if (!database) throw new Error("Database not available");

    const [result] = await database.insert(users).values({
      openId: "test-staff-" + Date.now(),
      name: "Test Staff Member",
      email: "teststaff@example.com",
      phone: "+47 900 00 099",
      role: "barber",
      pin: "123456",
      isActive: true,
    });

    testStaffId = result.insertId;

    // Create admin context
    adminContext = {
      user: {
        id: 1,
        openId: "admin-test",
        name: "Admin User",
        role: "owner",
        email: "admin@test.com",
      },
      req: {} as any,
      res: {} as any,
    };
  });

  afterAll(async () => {
    // Cleanup: delete test staff member
    const database = await db.getDb();
    if (database && testStaffId) {
      await database.delete(users).where(eq(users.id, testStaffId));
    }
  });

  it("should update staff member details", async () => {
    const caller = appRouter.createCaller(adminContext);

    const result = await caller.staff.update({
      id: testStaffId,
      name: "Updated Staff Name",
      email: "updated@example.com",
      phone: "+47 900 00 100",
      role: "manager",
    });

    expect(result.success).toBe(true);

    // Verify the update
    const updatedStaff = await caller.staff.getById({ id: testStaffId });
    expect(updatedStaff?.name).toBe("Updated Staff Name");
    expect(updatedStaff?.email).toBe("updated@example.com");
    expect(updatedStaff?.phone).toBe("+47 900 00 100");
    expect(updatedStaff?.role).toBe("manager");
  });

  it("should update staff PIN", async () => {
    const caller = appRouter.createCaller(adminContext);

    const result = await caller.staff.update({
      id: testStaffId,
      pin: "654321",
    });

    expect(result.success).toBe(true);

    // Verify the PIN update
    const updatedStaff = await caller.staff.getById({ id: testStaffId });
    expect(updatedStaff?.pin).toBe("654321");
  });

  it("should update staff active status", async () => {
    const caller = appRouter.createCaller(adminContext);

    const result = await caller.staff.update({
      id: testStaffId,
      isActive: false,
    });

    expect(result.success).toBe(true);

    // Verify the status update
    const updatedStaff = await caller.staff.getById({ id: testStaffId });
    expect(updatedStaff?.isActive).toBe(false);
  });

  it("should delete staff member", async () => {
    const caller = appRouter.createCaller(adminContext);

    // Create a temporary staff member for deletion test
    const database = await db.getDb();
    if (!database) throw new Error("Database not available");

    const [result] = await database.insert(users).values({
      openId: "test-delete-staff-" + Date.now(),
      name: "Staff To Delete",
      email: "delete@example.com",
      role: "cashier",
    });

    const staffToDeleteId = result.insertId;

    // Delete the staff member
    const deleteResult = await caller.staff.delete({ id: staffToDeleteId });
    expect(deleteResult.success).toBe(true);

    // Verify deletion - should return undefined
    const deletedStaff = await caller.staff.getById({ id: staffToDeleteId });
    expect(deletedStaff).toBeUndefined();
  });

  it("should require admin role for update", async () => {
    const nonAdminContext = {
      user: {
        id: 2,
        openId: "user-test",
        name: "Regular User",
        role: "barber",
        email: "user@test.com",
      },
      req: {} as any,
      res: {} as any,
    };

    const caller = appRouter.createCaller(nonAdminContext);

    await expect(
      caller.staff.update({
        id: testStaffId,
        name: "Unauthorized Update",
      })
    ).rejects.toThrow();
  });

  it("should require admin role for delete", async () => {
    const nonAdminContext = {
      user: {
        id: 2,
        openId: "user-test",
        name: "Regular User",
        role: "barber",
        email: "user@test.com",
      },
      req: {} as any,
      res: {} as any,
    };

    const caller = appRouter.createCaller(nonAdminContext);

    await expect(
      caller.staff.delete({ id: testStaffId })
    ).rejects.toThrow();
  });
});
