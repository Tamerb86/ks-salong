/**
 * Fiken Accounting API Integration
 * 
 * This module handles integration with Fiken.no accounting system.
 * Documentation: https://api.fiken.no/api/v2/docs/
 */

const FIKEN_API_BASE = "https://api.fiken.no/api/v2";

/**
 * Fiken Sale Line Item
 */
export interface FikenSaleLine {
  description: string;
  quantity: number;
  unitPrice: number; // Price excluding VAT
  vatType: "HIGH" | "MEDIUM" | "LOW" | "NONE"; // HIGH = 25% MVA
  account?: string; // Account code (e.g., "3000" for sales revenue)
}

/**
 * Fiken Sale Draft
 */
export interface FikenSaleDraft {
  date: string; // YYYY-MM-DD format
  lines: FikenSaleLine[];
  contactId?: number; // Optional customer reference
  saleNumber?: string; // Optional custom sale number
  currency?: string; // Default: "NOK"
}

/**
 * Fiken Sale Response
 */
export interface FikenSale {
  saleId: number;
  saleNumber: string;
  date: string;
  totalAmount: number;
  totalAmountInclVat: number;
  settled: boolean;
  lines: FikenSaleLine[];
}

/**
 * Make authenticated request to Fiken API
 */
async function fikenRequest<T>(
  apiToken: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${FIKEN_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Fiken API error (${response.status}): ${errorText}`
    );
  }

  // Handle 201 Created with Location header (no body)
  if (response.status === 201) {
    const location = response.headers.get("Location");
    return { location } as T;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Test Fiken API connection
 */
export async function testFikenConnection(
  apiToken: string
): Promise<{ success: boolean; message: string; companies?: any[] }> {
  try {
    const companies = await fikenRequest<any[]>(
      apiToken,
      "/companies",
      { method: "GET" }
    );

    return {
      success: true,
      message: "Successfully connected to Fiken",
      companies,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to connect to Fiken",
    };
  }
}

/**
 * Get company details
 */
export async function getFikenCompany(
  apiToken: string,
  companySlug: string
): Promise<any> {
  return fikenRequest(
    apiToken,
    `/companies/${companySlug}`,
    { method: "GET" }
  );
}

/**
 * Create sale draft in Fiken
 */
export async function createFikenSaleDraft(
  apiToken: string,
  companySlug: string,
  draft: FikenSaleDraft
): Promise<{ location: string }> {
  return fikenRequest<{ location: string }>(
    apiToken,
    `/companies/${companySlug}/sales/drafts`,
    {
      method: "POST",
      body: JSON.stringify(draft),
    }
  );
}

/**
 * Convert draft to actual sale
 */
export async function createSaleFromDraft(
  apiToken: string,
  companySlug: string,
  draftId: number
): Promise<{ location: string }> {
  return fikenRequest<{ location: string }>(
    apiToken,
    `/companies/${companySlug}/sales/drafts/${draftId}/createSale`,
    { method: "POST" }
  );
}

/**
 * Mark sale as settled (paid)
 */
export async function markSaleAsSettled(
  apiToken: string,
  companySlug: string,
  saleId: number,
  date: string // YYYY-MM-DD
): Promise<void> {
  await fikenRequest(
    apiToken,
    `/companies/${companySlug}/sales/${saleId}/settled`,
    {
      method: "PUT",
      body: JSON.stringify({ date }),
    }
  );
}

/**
 * Get sales for date range
 */
export async function getFikenSales(
  apiToken: string,
  companySlug: string,
  fromDate: string, // YYYY-MM-DD
  toDate: string // YYYY-MM-DD
): Promise<FikenSale[]> {
  const params = new URLSearchParams({
    from: fromDate,
    to: toDate,
  });

  return fikenRequest<FikenSale[]>(
    apiToken,
    `/companies/${companySlug}/sales?${params}`,
    { method: "GET" }
  );
}

/**
 * Get account list from Fiken
 */
export async function getFikenAccounts(
  apiToken: string,
  companySlug: string
): Promise<any[]> {
  return fikenRequest<any[]>(
    apiToken,
    `/companies/${companySlug}/accounts`,
    { method: "GET" }
  );
}

/**
 * Sync K.S Salong order to Fiken
 * 
 * This function takes a K.S Salong order and creates a corresponding
 * sale in Fiken with proper MVA handling.
 */
export async function syncOrderToFiken(
  apiToken: string,
  companySlug: string,
  order: {
    orderNumber: string;
    createdAt: Date;
    orderItems: Array<{
      itemName: string;
      quantity: number;
      unitPrice: string; // Decimal string
      taxRate: string; // "25.00" for 25% MVA
    }>;
    customerId?: number;
  }
): Promise<{ success: boolean; saleId?: number; error?: string }> {
  try {
    // Convert order items to Fiken sale lines
    const lines: FikenSaleLine[] = order.orderItems.map((item) => {
      const unitPrice = parseFloat(item.unitPrice);
      const taxRate = parseFloat(item.taxRate);
      
      // Determine VAT type based on tax rate
      let vatType: "HIGH" | "MEDIUM" | "LOW" | "NONE" = "HIGH";
      if (taxRate === 25) {
        vatType = "HIGH";
      } else if (taxRate === 15) {
        vatType = "MEDIUM";
      } else if (taxRate === 12) {
        vatType = "LOW";
      } else if (taxRate === 0) {
        vatType = "NONE";
      }

      return {
        description: item.itemName,
        quantity: item.quantity,
        unitPrice: unitPrice,
        vatType: vatType,
        account: "3000", // Default sales revenue account
      };
    });

    // Create sale draft
    const draft: FikenSaleDraft = {
      date: order.createdAt.toISOString().split("T")[0], // YYYY-MM-DD
      lines: lines,
      saleNumber: order.orderNumber,
      currency: "NOK",
    };

    // Step 1: Create draft
    const draftResponse = await createFikenSaleDraft(
      apiToken,
      companySlug,
      draft
    );

    // Extract draft ID from Location header
    // Location format: /api/v2/companies/{slug}/sales/drafts/{draftId}
    const draftId = parseInt(
      draftResponse.location.split("/").pop() || "0"
    );

    if (!draftId) {
      throw new Error("Failed to extract draft ID from response");
    }

    // Step 2: Convert draft to sale
    const saleResponse = await createSaleFromDraft(
      apiToken,
      companySlug,
      draftId
    );

    // Extract sale ID from Location header
    const saleId = parseInt(
      saleResponse.location.split("/").pop() || "0"
    );

    // Step 3: Mark as settled (since payment already received in POS)
    if (saleId) {
      await markSaleAsSettled(
        apiToken,
        companySlug,
        saleId,
        draft.date
      );
    }

    return {
      success: true,
      saleId: saleId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to sync order to Fiken",
    };
  }
}

/**
 * Verify K.S Salong totals against Fiken
 * 
 * Compares total sales between K.S Salong and Fiken for a date range.
 */
export async function verifyTotals(
  apiToken: string,
  companySlug: string,
  fromDate: string,
  toDate: string,
  ksSalongTotal: number
): Promise<{
  match: boolean;
  fikenTotal: number;
  ksSalongTotal: number;
  difference: number;
}> {
  try {
    const fikenSales = await getFikenSales(
      apiToken,
      companySlug,
      fromDate,
      toDate
    );

    const fikenTotal = fikenSales.reduce(
      (sum, sale) => sum + sale.totalAmountInclVat,
      0
    );

    const difference = Math.abs(fikenTotal - ksSalongTotal);
    const match = difference < 0.01; // Allow 1 øre difference for rounding

    return {
      match,
      fikenTotal,
      ksSalongTotal,
      difference,
    };
  } catch (error: any) {
    throw new Error(`Failed to verify totals: ${error.message}`);
  }
}

/**
 * Sync all sales for a date range to Fiken
 * Used by auto-sync cron job
 */
export async function syncDailySalesToFiken(
  apiToken: string,
  companySlug: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; salesCount: number; totalAmount: number; error?: string }> {
  try {
    // Import db here to avoid circular dependency
    const db = await import("./db");
    
    // Get all completed orders for the date range
    const orders = await db.getOrdersByDateRange(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );

    if (!orders || orders.length === 0) {
      return {
        success: true,
        salesCount: 0,
        totalAmount: 0,
      };
    }

    let syncedCount = 0;
    let totalAmount = 0;
    const errors: string[] = [];

    for (const order of orders) {
      try {
        const result = await syncOrderToFiken(apiToken, companySlug, {
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          orderItems: order.orderItems,
          customerId: order.customerId || undefined,
        });
        
        if (result.success) {
          syncedCount++;
          // Calculate total from order items
          const orderTotal = order.orderItems.reduce((sum: number, item: any) => {
            return sum + (parseFloat(item.unitPrice) * item.quantity);
          }, 0);
          totalAmount += orderTotal;
        } else {
          errors.push(`Order ${order.orderNumber}: ${result.error}`);
        }
      } catch (error: any) {
        errors.push(`Order ${order.orderNumber}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.error("[Fiken-Sync] Some orders failed:", errors);
    }

    return {
      success: syncedCount > 0,
      salesCount: syncedCount,
      totalAmount: totalAmount,
      error: errors.length > 0 ? errors.join("; ") : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      salesCount: 0,
      totalAmount: 0,
      error: error.message,
    };
  }
}
