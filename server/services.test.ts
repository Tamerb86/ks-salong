import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: AuthenticatedUser["role"] = "owner"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    phone: "+47 123 45 678",
    pin: "123456",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Services API", () => {
  it("should list all services", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const services = await caller.services.list();
    
    expect(Array.isArray(services)).toBe(true);
  });

  it("should require authentication to list services", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
        cookie: () => {},
      } as TrpcContext["res"],
    };
    
    const caller = appRouter.createCaller(ctx);

    await expect(caller.services.list()).rejects.toThrow();
  });

  it("should allow owner to create service", async () => {
    const { ctx } = createAuthContext("owner");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.services.create({
      name: "Test Service",
      description: "Test description",
      duration: 30,
      price: "350.00",
      mvaTax: "25.00",
      category: "Haircut",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should allow manager to create service", async () => {
    const { ctx } = createAuthContext("manager");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.services.create({
      name: "Manager Test Service",
      description: "Test description",
      duration: 45,
      price: "450.00",
      mvaTax: "25.00",
    });

    expect(result).toHaveProperty("id");
  });

  it("should not allow barber to create service", async () => {
    const { ctx } = createAuthContext("barber");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.services.create({
        name: "Barber Test Service",
        description: "Test description",
        duration: 30,
        price: "350.00",
      })
    ).rejects.toThrow();
  });

  it("should not allow cashier to create service", async () => {
    const { ctx } = createAuthContext("cashier");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.services.create({
        name: "Cashier Test Service",
        description: "Test description",
        duration: 30,
        price: "350.00",
      })
    ).rejects.toThrow();
  });
});

describe("Products API", () => {
  it("should list all products", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();
    
    expect(Array.isArray(products)).toBe(true);
  });

  it("should allow owner to create product", async () => {
    const { ctx } = createAuthContext("owner");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.create({
      name: "Test Product",
      description: "Test description",
      sku: "TEST-001",
      price: "250.00",
      cost: "100.00",
      stock: 50,
      mvaTax: "25.00",
      category: "Hair Care",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should not allow barber to create product", async () => {
    const { ctx } = createAuthContext("barber");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.products.create({
        name: "Barber Test Product",
        description: "Test description",
        price: "250.00",
      })
    ).rejects.toThrow();
  });
});

describe("Staff API", () => {
  it("should list all staff", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const staff = await caller.staff.list();
    
    expect(Array.isArray(staff)).toBe(true);
  });

  it("should allow owner to update staff", async () => {
    const { ctx } = createAuthContext("owner");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.staff.update({
      id: 1,
      name: "Updated Name",
    });

    expect(result).toEqual({ success: true });
  });

  it("should not allow barber to update staff", async () => {
    const { ctx } = createAuthContext("barber");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.staff.update({
        id: 1,
        name: "Updated Name",
      })
    ).rejects.toThrow();
  });
});
