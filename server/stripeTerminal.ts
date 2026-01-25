/**
 * Stripe Terminal API Service
 * Handles WisePOS E reader registration, connection, and payment processing
 */

interface StripeTerminalConfig {
  secretKey: string;
}

const STRIPE_API_BASE = "https://api.stripe.com/v1";

/**
 * Make authenticated request to Stripe API
 */
async function makeStripeRequest(
  endpoint: string,
  config: StripeTerminalConfig,
  options: RequestInit = {}
): Promise<any> {
  const url = `${STRIPE_API_BASE}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${config.secretKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Stripe API error (${response.status}): ${data.error?.message || JSON.stringify(data)}`
    );
  }

  return data;
}

/**
 * Convert object to URL-encoded form data
 */
function toFormData(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }
  return params.toString();
}

/**
 * Test Stripe API connection
 */
export async function testStripeConnection(secretKey: string): Promise<{
  success: boolean;
  message: string;
  accountId?: string;
}> {
  try {
    const data = await makeStripeRequest("/account", { secretKey });
    return {
      success: true,
      message: "Successfully connected to Stripe",
      accountId: data.id,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to connect to Stripe",
    };
  }
}

/**
 * Create a Terminal Location
 */
export async function createTerminalLocation(
  secretKey: string,
  params: {
    displayName: string;
    address: {
      line1: string;
      city: string;
      country: string;
      postalCode: string;
    };
  }
): Promise<{
  success: boolean;
  locationId?: string;
  error?: string;
}> {
  try {
    const formData = toFormData({
      display_name: params.displayName,
      "address[line1]": params.address.line1,
      "address[city]": params.address.city,
      "address[country]": params.address.country,
      "address[postal_code]": params.address.postalCode,
    });

    const data = await makeStripeRequest("/terminal/locations", { secretKey }, {
      method: "POST",
      body: formData,
    });

    return {
      success: true,
      locationId: data.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * List all Terminal Locations
 */
export async function listTerminalLocations(secretKey: string): Promise<any[]> {
  try {
    const data = await makeStripeRequest("/terminal/locations", { secretKey });
    return data.data || [];
  } catch (error) {
    console.error("Failed to list Terminal locations:", error);
    return [];
  }
}

/**
 * Register a new Terminal Reader
 */
export async function registerTerminalReader(
  secretKey: string,
  params: {
    registrationCode: string;
    label: string;
    locationId: string;
  }
): Promise<{
  success: boolean;
  reader?: any;
  error?: string;
}> {
  try {
    const formData = toFormData({
      registration_code: params.registrationCode,
      label: params.label,
      location: params.locationId,
    });

    const data = await makeStripeRequest("/terminal/readers", { secretKey }, {
      method: "POST",
      body: formData,
    });

    return {
      success: true,
      reader: data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * List all Terminal Readers
 */
export async function listTerminalReaders(
  secretKey: string,
  locationId?: string
): Promise<any[]> {
  try {
    const endpoint = locationId
      ? `/terminal/readers?location=${locationId}`
      : "/terminal/readers";
    const data = await makeStripeRequest(endpoint, { secretKey });
    return data.data || [];
  } catch (error) {
    console.error("Failed to list Terminal readers:", error);
    return [];
  }
}

/**
 * Get a specific Terminal Reader
 */
export async function getTerminalReader(
  secretKey: string,
  readerId: string
): Promise<any | null> {
  try {
    const data = await makeStripeRequest(`/terminal/readers/${readerId}`, { secretKey });
    return data;
  } catch (error) {
    console.error("Failed to get Terminal reader:", error);
    return null;
  }
}

/**
 * Delete a Terminal Reader
 */
export async function deleteTerminalReader(
  secretKey: string,
  readerId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await makeStripeRequest(`/terminal/readers/${readerId}`, { secretKey }, {
      method: "DELETE",
    });
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create a Payment Intent for Terminal
 */
export async function createTerminalPaymentIntent(
  secretKey: string,
  params: {
    amount: number; // in smallest currency unit (øre for NOK)
    currency: string;
    metadata?: Record<string, string>;
  }
): Promise<{
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
}> {
  try {
    const formData = toFormData({
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      "payment_method_types[]": "card_present",
      capture_method: "automatic",
      ...Object.entries(params.metadata || {}).reduce((acc, [key, value]) => {
        acc[`metadata[${key}]`] = value;
        return acc;
      }, {} as Record<string, string>),
    });

    const data = await makeStripeRequest("/payment_intents", { secretKey }, {
      method: "POST",
      body: formData,
    });

    return {
      success: true,
      paymentIntentId: data.id,
      clientSecret: data.client_secret,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Process Payment on Terminal Reader
 */
export async function processPaymentOnReader(
  secretKey: string,
  readerId: string,
  paymentIntentId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const formData = toFormData({
      payment_intent: paymentIntentId,
    });

    await makeStripeRequest(
      `/terminal/readers/${readerId}/process_payment_intent`,
      { secretKey },
      {
        method: "POST",
        body: formData,
      }
    );

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Cancel Reader Action (e.g., cancel ongoing payment)
 */
export async function cancelReaderAction(
  secretKey: string,
  readerId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await makeStripeRequest(
      `/terminal/readers/${readerId}/cancel_action`,
      { secretKey },
      {
        method: "POST",
        body: "",
      }
    );

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get Payment Intent details
 */
export async function getPaymentIntent(
  secretKey: string,
  paymentIntentId: string
): Promise<any | null> {
  try {
    const data = await makeStripeRequest(`/payment_intents/${paymentIntentId}`, { secretKey });
    return data;
  } catch (error) {
    console.error("Failed to get Payment Intent:", error);
    return null;
  }
}

/**
 * Create a simulated reader for testing (Test mode only)
 */
export async function createSimulatedReader(
  secretKey: string,
  locationId: string
): Promise<{
  success: boolean;
  reader?: any;
  error?: string;
}> {
  try {
    const formData = toFormData({
      registration_code: "simulated-wpe",
      location: locationId,
    });

    const data = await makeStripeRequest(
      "/test_helpers/terminal/readers",
      { secretKey },
      {
        method: "POST",
        body: formData,
      }
    );

    return {
      success: true,
      reader: data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
