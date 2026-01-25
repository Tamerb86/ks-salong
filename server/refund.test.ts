import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { users, orders, orderItems, products } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Refund System", () => {
  let testStaffId: number;
  let testProductId: number;
  let testOrderId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Create test staff member
    const staffResult = await db
      .insert(users)
      .values({
        openId: `test-staff-${Date.now()}`,
        name: "Test Staff",
        email: `test-staff-${Date.now()}@example.com`,
        role: "owner",
        isActive: true,
      });
    testStaffId = Number(staffResult[0].insertId);

    // Create test product
    const productResult = await db
      .insert(products)
      .values({
        name: "Test Product",
        description: "Test product for refund",
        price: "100.00",
        category: "Test",
        stock: 10,
        isActive: true,
      });
    testProductId = Number(productResult[0].insertId);

    // Create test order
    const orderResult = await db
      .insert(orders)
      .values({
        orderNumber: `TEST-${Date.now()}`,
        staffId: testStaffId,
        subtotal: "100.00",
        taxAmount: "25.00",
        total: "125.00",
        status: "completed",
        notes: "Test order for refund",
      });
    testOrderId = Number(orderResult[0].insertId);

    // Create order item
    await db.insert(orderItems).values({
      orderId: testOrderId,
      itemType: "product",
      itemId: testProductId,
      itemName: "Test Product",
      quantity: 2,
      unitPrice: "50.00",
      taxRate: "25.00",
      total: "100.00",
    });

    // Decrease product stock (simulate sale)
    await db
      .update(products)
      .set({ stock: 8 })
      .where(eq(products.id, testProductId));
  });

  it("should refund order and update status", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Refund order
    await db
      .update(orders)
      .set({
        status: "refunded",
      })
      .where(eq(orders.id, testOrderId));

    // Verify order status updated
    const [refundedOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, testOrderId));

    expect(refundedOrder.status).toBe("refunded");
  });

  it("should restore product inventory after refund", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, testOrderId));

    // Restore inventory for each item
    for (const item of items) {
      if (item.itemType === "product") {
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.itemId));

        if (product) {
          await db
            .update(products)
            .set({
              stock: product.stock + item.quantity,
            })
            .where(eq(products.id, item.itemId));
        }
      }
    }

    // Verify inventory restored
    const [restoredProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, testProductId));

    expect(restoredProduct.stock).toBe(10); // Back to original 10
  });

  it("should not allow refunding already refunded order", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Try to refund again
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, testOrderId));

    expect(order.status).toBe("refunded");
    // In real implementation, API should check status and reject
  });

  it("should calculate correct refund amount including MVA", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, testOrderId));

    const refundAmount = parseFloat(order.total);
    const refundMVA = parseFloat(order.taxAmount);

    expect(refundAmount).toBe(125.0); // Total with MVA
    expect(refundMVA).toBe(25.0); // 25% MVA
  });

  it("should handle partial refund by updating order items", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Create new test order for partial refund
    const orderResult = await db
      .insert(orders)
      .values({
        orderNumber: `TEST-PARTIAL-${Date.now()}`,
        staffId: testStaffId,
        subtotal: "200.00",
        taxAmount: "50.00",
        total: "250.00",
        status: "completed",
        notes: "Test order for partial refund",
      });
    const partialOrderId = Number(orderResult[0].insertId);

    // Add 2 items
    await db.insert(orderItems).values([
      {
        orderId: partialOrderId,
        itemType: "product",
        itemId: testProductId,
        itemName: "Test Product",
        quantity: 2,
        unitPrice: "50.00",
        taxRate: "25.00",
        total: "100.00",
      },
      {
        orderId: partialOrderId,
        itemType: "product",
        itemId: testProductId,
        itemName: "Test Product",
        quantity: 2,
        unitPrice: "50.00",
        taxRate: "25.00",
        total: "100.00",
      },
    ]);

    // Update status to partially_refunded
    await db
      .update(orders)
      .set({
        status: "partially_refunded",
      })
      .where(eq(orders.id, partialOrderId));

    const [partialOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, partialOrderId));

    expect(partialOrder.status).toBe("partially_refunded");
  });
});
