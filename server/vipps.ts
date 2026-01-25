import axios from "axios";

// Vipps API Configuration
const VIPPS_BASE_URL = process.env.VIPPS_TEST_MODE === "true" 
  ? "https://apitest.vipps.no" 
  : "https://api.vipps.no";

const VIPPS_CLIENT_ID = process.env.VIPPS_CLIENT_ID || "";
const VIPPS_CLIENT_SECRET = process.env.VIPPS_CLIENT_SECRET || "";
const VIPPS_SUBSCRIPTION_KEY = process.env.VIPPS_SUBSCRIPTION_KEY || "";
const VIPPS_MERCHANT_SERIAL_NUMBER = process.env.VIPPS_MERCHANT_SERIAL_NUMBER || "";
const VIPPS_CALLBACK_PREFIX = process.env.VIPPS_CALLBACK_PREFIX || "";
const VIPPS_FALLBACK_URL = process.env.VIPPS_FALLBACK_URL || "";

interface VippsAccessToken {
  token_type: string;
  expires_in: string;
  access_token: string;
}

interface VippsPaymentInitiation {
  customerInfo?: {
    mobileNumber?: string;
  };
  merchantInfo: {
    merchantSerialNumber: string;
    callbackPrefix: string;
    fallBack: string;
    isApp: boolean;
  };
  transaction: {
    orderId: string;
    amount: number;
    transactionText: string;
    timeStamp: string;
  };
}

interface VippsPaymentResponse {
  orderId: string;
  url: string;
}

interface VippsPaymentDetails {
  orderId: string;
  transactionSummary: {
    capturedAmount: number;
    remainingAmountToCapture: number;
    refundedAmount: number;
    remainingAmountToRefund: number;
  };
  transactionLogHistory: Array<{
    amount: number;
    transactionText: string;
    transactionId: string;
    timeStamp: string;
    operation: string;
    requestId: string;
    operationSuccess: boolean;
  }>;
}

interface VippsCallbackPayload {
  merchantSerialNumber: string;
  orderId: string;
  transactionInfo: {
    amount: number;
    status: "RESERVED" | "SALE" | "CANCELLED" | "REJECTED";
    timeStamp: string;
    transactionId: string;
  };
}

let cachedAccessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get Vipps Access Token
 */
export async function getVippsAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && Date.now() < tokenExpiry) {
    return cachedAccessToken;
  }

  try {
    const response = await axios.post<VippsAccessToken>(
      `${VIPPS_BASE_URL}/accesstoken/get`,
      {},
      {
        headers: {
          "client_id": VIPPS_CLIENT_ID,
          "client_secret": VIPPS_CLIENT_SECRET,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
        },
      }
    );

    cachedAccessToken = response.data.access_token;
    // Set expiry to 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (parseInt(response.data.expires_in) - 300) * 1000;

    return cachedAccessToken;
  } catch (error: any) {
    console.error("Failed to get Vipps access token:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Vipps");
  }
}

/**
 * Initiate Vipps Payment
 * @param orderId Unique order ID
 * @param amountNOK Amount in NOK (will be converted to øre)
 * @param transactionText Description of the transaction
 * @param mobileNumber Optional customer mobile number
 */
export async function initiateVippsPayment(
  orderId: string,
  amountNOK: number,
  transactionText: string,
  mobileNumber?: string
): Promise<VippsPaymentResponse> {
  // Convert NOK to øre (multiply by 100)
  const amount = Math.round(amountNOK * 100);
  const accessToken = await getVippsAccessToken();

  const payload: VippsPaymentInitiation = {
    merchantInfo: {
      merchantSerialNumber: VIPPS_MERCHANT_SERIAL_NUMBER,
      callbackPrefix: VIPPS_CALLBACK_PREFIX,
      fallBack: VIPPS_FALLBACK_URL,
      isApp: false,
    },
    transaction: {
      orderId,
      amount, // Amount in øre
      transactionText,
      timeStamp: new Date().toISOString(),
    },
  };

  if (mobileNumber) {
    payload.customerInfo = { mobileNumber };
  }

  try {
    const response = await axios.post<VippsPaymentResponse>(
      `${VIPPS_BASE_URL}/ecomm/v2/payments`,
      payload,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Failed to initiate Vipps payment:", error.response?.data || error.message);
    throw new Error("Failed to initiate payment with Vipps");
  }
}

/**
 * Capture Vipps Payment
 */
export async function captureVippsPayment(
  orderId: string,
  amount: number,
  transactionText: string
): Promise<void> {
  const accessToken = await getVippsAccessToken();

  try {
    await axios.post(
      `${VIPPS_BASE_URL}/ecomm/v2/payments/${orderId}/capture`,
      {
        merchantInfo: {
          merchantSerialNumber: VIPPS_MERCHANT_SERIAL_NUMBER,
        },
        transaction: {
          amount,
          transactionText,
        },
      },
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to capture Vipps payment:", error.response?.data || error.message);
    throw new Error("Failed to capture payment");
  }
}

/**
 * Cancel Vipps Payment
 */
export async function cancelVippsPayment(
  orderId: string,
  transactionText: string
): Promise<void> {
  const accessToken = await getVippsAccessToken();

  try {
    await axios.put(
      `${VIPPS_BASE_URL}/ecomm/v2/payments/${orderId}/cancel`,
      {
        merchantInfo: {
          merchantSerialNumber: VIPPS_MERCHANT_SERIAL_NUMBER,
        },
        transaction: {
          transactionText,
        },
      },
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to cancel Vipps payment:", error.response?.data || error.message);
    throw new Error("Failed to cancel payment");
  }
}

/**
 * Refund Vipps Payment
 */
export async function refundVippsPayment(
  orderId: string,
  amount: number,
  transactionText: string
): Promise<void> {
  const accessToken = await getVippsAccessToken();

  try {
    await axios.post(
      `${VIPPS_BASE_URL}/ecomm/v2/payments/${orderId}/refund`,
      {
        merchantInfo: {
          merchantSerialNumber: VIPPS_MERCHANT_SERIAL_NUMBER,
        },
        transaction: {
          amount,
          transactionText,
        },
      },
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to refund Vipps payment:", error.response?.data || error.message);
    throw new Error("Failed to refund payment");
  }
}

/**
 * Get Vipps Payment Details
 */
export async function getVippsPaymentDetails(orderId: string): Promise<VippsPaymentDetails> {
  const accessToken = await getVippsAccessToken();

  try {
    const response = await axios.get<VippsPaymentDetails>(
      `${VIPPS_BASE_URL}/ecomm/v2/payments/${orderId}/details`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Failed to get Vipps payment details:", error.response?.data || error.message);
    throw new Error("Failed to get payment details");
  }
}

/**
 * Verify Vipps Callback (optional - for added security)
 */
export function verifyVippsCallback(payload: VippsCallbackPayload): boolean {
  // Verify merchant serial number matches
  return payload.merchantSerialNumber === VIPPS_MERCHANT_SERIAL_NUMBER;
}

export type { VippsCallbackPayload, VippsPaymentDetails, VippsPaymentResponse };
