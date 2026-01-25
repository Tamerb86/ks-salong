/**
 * Vipps Payment Service
 * 
 * This module handles all Vipps ePayment API interactions including:
 * - OAuth authentication
 * - Payment initiation
 * - Payment status checking
 * - Payment capture, cancellation, and refunds
 * 
 * API Documentation: https://developer.vippsmobilepay.com/docs/APIs/epayment-api/
 * 
 * Note: This uses the new Vipps ePayment API (v1), not the legacy eCommerce API (v2)
 */

import { getDb } from "./db";
import { salonSettings } from "../drizzle/schema";

interface VippsConfig {
  clientId: string;
  clientSecret: string;
  merchantSerialNumber: string;
  subscriptionKey: string;
}

interface VippsAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface VippsPaymentRequest {
  amount: {
    currency: string;
    value: number; // Amount in minor units (øre for NOK)
  };
  paymentMethod: {
    type: "WALLET";
  };
  customer: {
    phoneNumber?: string;
  };
  returnUrl: string;
  userFlow: "WEB_REDIRECT" | "NATIVE_REDIRECT";
  paymentDescription: string;
  reference: string; // Unique reference for this payment
}

interface VippsPaymentResponse {
  reference: string;
  redirectUrl: string;
  orderId: string; // Vipps order ID (deprecated but still returned)
}

interface VippsPaymentDetails {
  aggregate: {
    authorizedAmount: {
      currency: string;
      value: number;
    };
    capturedAmount: {
      currency: string;
      value: number;
    };
    refundedAmount: {
      currency: string;
      value: number;
    };
    cancelledAmount: {
      currency: string;
      value: number;
    };
  };
  state: "CREATED" | "ABORTED" | "EXPIRED" | "AUTHORIZED" | "TERMINATED";
  amount: {
    currency: string;
    value: number;
  };
  paymentMethod: {
    type: string;
  };
}

const VIPPS_API_BASE_URL = "https://apitest.vipps.no"; // Test environment
// Production: https://api.vipps.no

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get Vipps configuration from database
 */
async function getVippsConfig(): Promise<VippsConfig> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const settings = await db.select().from(salonSettings).limit(1);
  
  if (!settings.length) {
    throw new Error("Salon settings not found");
  }

  const config = settings[0];

  if (!config.vippsEnabled) {
    throw new Error("Vipps is not enabled in settings");
  }

  if (!config.vippsClientId || !config.vippsClientSecret || 
      !config.vippsMerchantSerialNumber || !config.vippsSubscriptionKey) {
    throw new Error("Vipps credentials are not configured. Please update settings.");
  }

  return {
    clientId: config.vippsClientId,
    clientSecret: config.vippsClientSecret,
    merchantSerialNumber: config.vippsMerchantSerialNumber,
    subscriptionKey: config.vippsSubscriptionKey,
  };
}

/**
 * Get OAuth access token from Vipps
 * Tokens are cached and reused until they expire
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  const config = await getVippsConfig();

  const authString = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");

  const response = await fetch(`${VIPPS_API_BASE_URL}/accesstoken/get`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Merchant-Serial-Number": config.merchantSerialNumber,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get Vipps access token: ${response.status} ${errorText}`);
  }

  const data: VippsAccessTokenResponse = await response.json();

  // Cache token with 5-minute buffer before expiry
  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

  return data.access_token;
}

/**
 * Initiate a Vipps payment
 * 
 * @param params Payment parameters
 * @returns Vipps payment response with redirect URL
 */
export async function initiatePayment(params: {
  amount: number; // Amount in NOK (will be converted to øre)
  customerPhone?: string;
  reference: string; // Unique reference (e.g., appointment ID)
  description: string;
  returnUrl: string;
}): Promise<VippsPaymentResponse> {
  const config = await getVippsConfig();
  const accessToken = await getAccessToken();

  // Convert NOK to øre (minor units)
  const amountInOre = Math.round(params.amount * 100);

  const paymentRequest: VippsPaymentRequest = {
    amount: {
      currency: "NOK",
      value: amountInOre,
    },
    paymentMethod: {
      type: "WALLET",
    },
    customer: {
      phoneNumber: params.customerPhone,
    },
    returnUrl: params.returnUrl,
    userFlow: "WEB_REDIRECT",
    paymentDescription: params.description,
    reference: params.reference,
  };

  const response = await fetch(`${VIPPS_API_BASE_URL}/epayment/v1/payments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Merchant-Serial-Number": config.merchantSerialNumber,
      "Content-Type": "application/json",
      "Idempotency-Key": params.reference, // Prevent duplicate payments
    },
    body: JSON.stringify(paymentRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to initiate Vipps payment: ${response.status} ${errorText}`);
  }

  const data: VippsPaymentResponse = await response.json();
  return data;
}

/**
 * Get payment status from Vipps
 * 
 * @param reference Payment reference (unique identifier)
 * @returns Payment details including state and amounts
 */
export async function getPaymentStatus(reference: string): Promise<VippsPaymentDetails> {
  const config = await getVippsConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(`${VIPPS_API_BASE_URL}/epayment/v1/payments/${reference}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Merchant-Serial-Number": config.merchantSerialNumber,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get Vipps payment status: ${response.status} ${errorText}`);
  }

  const data: VippsPaymentDetails = await response.json();
  return data;
}

/**
 * Capture a payment (finalize the transaction)
 * This should be called after the payment is authorized
 * 
 * @param reference Payment reference
 * @param amount Amount to capture in NOK (optional, defaults to full authorized amount)
 */
export async function capturePayment(reference: string, amount?: number): Promise<void> {
  const config = await getVippsConfig();
  const accessToken = await getAccessToken();

  const body: any = {};
  if (amount !== undefined) {
    body.modificationAmount = {
      currency: "NOK",
      value: Math.round(amount * 100), // Convert to øre
    };
  }

  const response = await fetch(`${VIPPS_API_BASE_URL}/epayment/v1/payments/${reference}/capture`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Merchant-Serial-Number": config.merchantSerialNumber,
      "Content-Type": "application/json",
      "Idempotency-Key": `capture-${reference}-${Date.now()}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to capture Vipps payment: ${response.status} ${errorText}`);
  }
}

/**
 * Cancel/abort a payment
 * Can only be done before the payment is authorized
 * 
 * @param reference Payment reference
 */
export async function cancelPayment(reference: string): Promise<void> {
  const config = await getVippsConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(`${VIPPS_API_BASE_URL}/epayment/v1/payments/${reference}/cancel`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Merchant-Serial-Number": config.merchantSerialNumber,
      "Content-Type": "application/json",
      "Idempotency-Key": `cancel-${reference}-${Date.now()}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to cancel Vipps payment: ${response.status} ${errorText}`);
  }
}

/**
 * Refund a captured payment
 * 
 * @param reference Payment reference
 * @param amount Amount to refund in NOK
 * @param reason Reason for refund
 */
export async function refundPayment(
  reference: string,
  amount: number,
  reason: string
): Promise<void> {
  const config = await getVippsConfig();
  const accessToken = await getAccessToken();

  const body = {
    modificationAmount: {
      currency: "NOK",
      value: Math.round(amount * 100), // Convert to øre
    },
    description: reason,
  };

  const response = await fetch(`${VIPPS_API_BASE_URL}/epayment/v1/payments/${reference}/refund`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Merchant-Serial-Number": config.merchantSerialNumber,
      "Content-Type": "application/json",
      "Idempotency-Key": `refund-${reference}-${Date.now()}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refund Vipps payment: ${response.status} ${errorText}`);
  }
}

// Export types for use in other modules
export type { VippsPaymentResponse, VippsPaymentDetails, VippsConfig };
