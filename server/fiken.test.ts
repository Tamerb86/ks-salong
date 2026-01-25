import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fiken from "./fiken";

// Mock fetch globally
global.fetch = vi.fn();

describe("Fiken Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("testFikenConnection", () => {
    it("should successfully connect to Fiken with valid API token", async () => {
      const mockCompanies = [
        { name: "Test Company", slug: "test-company" },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompanies,
      });

      const result = await fiken.testFikenConnection("valid-token");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Successfully connected to Fiken");
      expect(result.companies).toEqual(mockCompanies);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.fiken.no/api/v2/companies",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer valid-token",
          }),
        })
      );
    });

    it("should fail with invalid API token", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      });

      const result = await fiken.testFikenConnection("invalid-token");

      expect(result.success).toBe(false);
      expect(result.message).toContain("Fiken API error");
    });
  });

  describe("syncOrderToFiken", () => {
    it("should successfully sync order with 25% MVA", async () => {
      const mockOrder = {
        orderNumber: "INV-20260125-001",
        createdAt: new Date("2026-01-25"),
        orderItems: [
          {
            itemName: "Herreklipp",
            quantity: 1,
            unitPrice: "400.00",
            taxRate: "25.00",
          },
          {
            itemName: "Hårprodukt",
            quantity: 2,
            unitPrice: "150.00",
            taxRate: "25.00",
          },
        ],
      };

      // Mock draft creation (returns Location header)
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: {
          get: (header: string) =>
            header === "Location"
              ? "/api/v2/companies/test-company/sales/drafts/123"
              : null,
        },
        json: async () => ({}),
      });

      // Mock sale creation from draft
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: {
          get: (header: string) =>
            header === "Location"
              ? "/api/v2/companies/test-company/sales/456"
              : null,
        },
        json: async () => ({}),
      });

      // Mock mark as settled
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await fiken.syncOrderToFiken(
        "valid-token",
        "test-company",
        mockOrder
      );

      expect(result.success).toBe(true);
      expect(result.saleId).toBe(456);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it("should handle different VAT rates correctly", async () => {
      const mockOrder = {
        orderNumber: "INV-20260125-002",
        createdAt: new Date("2026-01-25"),
        orderItems: [
          {
            itemName: "Service with 25% MVA",
            quantity: 1,
            unitPrice: "100.00",
            taxRate: "25.00",
          },
          {
            itemName: "Service with 15% MVA",
            quantity: 1,
            unitPrice: "100.00",
            taxRate: "15.00",
          },
          {
            itemName: "Service with 0% MVA",
            quantity: 1,
            unitPrice: "100.00",
            taxRate: "0.00",
          },
        ],
      };

      // Mock all fetch calls
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          headers: {
            get: () => "/api/v2/companies/test-company/sales/drafts/123",
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          headers: {
            get: () => "/api/v2/companies/test-company/sales/456",
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 204,
        });

      const result = await fiken.syncOrderToFiken(
        "valid-token",
        "test-company",
        mockOrder
      );

      expect(result.success).toBe(true);

      // Verify the draft creation call had correct VAT types
      const draftCall = (global.fetch as any).mock.calls[0];
      const draftBody = JSON.parse(draftCall[1].body);
      expect(draftBody.lines[0].vatType).toBe("HIGH"); // 25%
      expect(draftBody.lines[1].vatType).toBe("MEDIUM"); // 15%
      expect(draftBody.lines[2].vatType).toBe("NONE"); // 0%
    });

    it("should fail gracefully when draft creation fails", async () => {
      const mockOrder = {
        orderNumber: "INV-20260125-003",
        createdAt: new Date("2026-01-25"),
        orderItems: [
          {
            itemName: "Test Service",
            quantity: 1,
            unitPrice: "100.00",
            taxRate: "25.00",
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Invalid request",
      });

      const result = await fiken.syncOrderToFiken(
        "valid-token",
        "test-company",
        mockOrder
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Fiken API error");
    });
  });

  describe("verifyTotals", () => {
    it("should match totals when K.S Salong and Fiken agree", async () => {
      const mockFikenSales = [
        { totalAmountInclVat: 500.0 },
        { totalAmountInclVat: 300.0 },
        { totalAmountInclVat: 200.0 },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFikenSales,
      });

      const result = await fiken.verifyTotals(
        "valid-token",
        "test-company",
        "2026-01-25",
        "2026-01-25",
        1000.0 // K.S Salong total
      );

      expect(result.match).toBe(true);
      expect(result.fikenTotal).toBe(1000.0);
      expect(result.ksSalongTotal).toBe(1000.0);
      expect(result.difference).toBeLessThan(0.01);
    });

    it("should detect discrepancy when totals don't match", async () => {
      const mockFikenSales = [
        { totalAmountInclVat: 500.0 },
        { totalAmountInclVat: 300.0 },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFikenSales,
      });

      const result = await fiken.verifyTotals(
        "valid-token",
        "test-company",
        "2026-01-25",
        "2026-01-25",
        1000.0 // K.S Salong total (but Fiken has 800)
      );

      expect(result.match).toBe(false);
      expect(result.fikenTotal).toBe(800.0);
      expect(result.ksSalongTotal).toBe(1000.0);
      expect(result.difference).toBe(200.0);
    });

    it("should allow small rounding differences (< 1 øre)", async () => {
      const mockFikenSales = [{ totalAmountInclVat: 1000.005 }];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFikenSales,
      });

      const result = await fiken.verifyTotals(
        "valid-token",
        "test-company",
        "2026-01-25",
        "2026-01-25",
        1000.0
      );

      expect(result.match).toBe(true); // Should match despite tiny difference
    });
  });

  describe("getFikenAccounts", () => {
    it("should fetch account list from Fiken", async () => {
      const mockAccounts = [
        { code: "3000", name: "Salgsinntekt" },
        { code: "3100", name: "Produktsalg" },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccounts,
      });

      const result = await fiken.getFikenAccounts("valid-token", "test-company");

      expect(result).toEqual(mockAccounts);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.fiken.no/api/v2/companies/test-company/accounts",
        expect.any(Object)
      );
    });
  });
});
