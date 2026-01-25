/**
 * Webhook Handlers for Payment Providers
 * Handles callbacks from Vipps and Stripe
 */

import { Request, Response } from "express";
import * as db from "./db";
import * as vipps from "./vipps";
import {
  verifyVippsSignature,
  verifyStripeSignature,
  validateWebhookRequest,
  checkRateLimit,
  logWebhookRequest,
} from "./webhookSecurity";

/**
 * Vipps Payment Callback Handler
 * Called by Vipps when payment status changes
 */
export async function handleVippsCallback(req: Request, res: Response) {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  
  try {
    // Rate limiting
    const rateLimit = checkRateLimit(clientIp, 100, 60000);
    if (!rateLimit.allowed) {
      console.warn(`[Vipps Webhook] Rate limit exceeded for IP: ${clientIp}`);
      await logWebhookRequest("vipps", "/api/webhooks/vipps", req, false, false, "Rate limit exceeded");
      return res.status(429).json({ error: "Too many requests" });
    }
    
    // Validate request structure
    const validation = validateWebhookRequest(req, "vipps");
    if (!validation.valid) {
      console.error(`[Vipps Webhook] Validation failed: ${validation.error}`);
      await logWebhookRequest("vipps", "/api/webhooks/vipps", req, false, false, validation.error);
      return res.status(400).json({ error: validation.error });
    }
    
    // Verify signature (if secret is configured)
    const vippsWebhookSecret = process.env.VIPPS_WEBHOOK_SECRET;
    if (vippsWebhookSecret) {
      const signature = req.headers["authorization"] as string;
      const payload = JSON.stringify(req.body);
      
      const isValid = verifyVippsSignature(payload, signature, vippsWebhookSecret);
      if (!isValid) {
        console.error("[Vipps Webhook] Invalid signature");
        await logWebhookRequest("vipps", "/api/webhooks/vipps", req, false, false, "Invalid signature");
        return res.status(401).json({ error: "Invalid signature" });
      }
    } else {
      console.warn("[Vipps Webhook] VIPPS_WEBHOOK_SECRET not configured, skipping signature verification");
    }
    
    const payload = req.body;
    
    console.log("[Vipps Webhook] Received callback:", JSON.stringify(payload, null, 2));
    
    // Extract order ID (format: APT-123 or ORD-456)
    const orderId = payload.orderId;
    const status = payload.transactionInfo?.status;
    
    if (!orderId || !status) {
      console.error("[Vipps Webhook] Missing orderId or status");
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Determine if this is an appointment or order payment
    if (orderId.startsWith("APT-")) {
      await handleAppointmentPayment(orderId, status, payload);
    } else if (orderId.startsWith("ORD-")) {
      await handleOrderPayment(orderId, status, payload);
    } else {
      console.warn(`[Vipps Webhook] Unknown order ID format: ${orderId}`);
    }
    
    // Log successful processing
    await logWebhookRequest("vipps", "/api/webhooks/vipps", req, true, true);
    
    // Always respond with 200 OK to Vipps
    res.status(200).json({ message: "Webhook received" });
    
  } catch (error: any) {
    console.error("[Vipps Webhook] Error processing callback:", error);
    await logWebhookRequest("vipps", "/api/webhooks/vipps", req, false, false, error.message);
    // Still return 200 to prevent Vipps from retrying
    res.status(200).json({ message: "Error logged" });
  }
}

/**
 * Handle Appointment Payment Callback
 */
async function handleAppointmentPayment(
  orderId: string,
  status: string,
  payload: any
) {
  // Extract appointment ID from order ID (APT-123 → 123)
  const appointmentId = parseInt(orderId.replace("APT-", ""));
  
  if (isNaN(appointmentId)) {
    console.error(`[Vipps Webhook] Invalid appointment ID in orderId: ${orderId}`);
    return;
  }
  
  const appointment = await db.getAppointmentById(appointmentId);
  if (!appointment) {
    console.error(`[Vipps Webhook] Appointment not found: ${appointmentId}`);
    return;
  }
  
  console.log(`[Vipps Webhook] Processing appointment ${appointmentId}, status: ${status}`);
  
  switch (status) {
    case "RESERVED":
    case "SALE":
      // Payment successful - confirm appointment
      await db.updateAppointment(appointmentId, {
        paymentStatus: "paid",
        status: "confirmed",
        paidAt: new Date(),
      });
      
      console.log(`[Vipps Webhook] Appointment ${appointmentId} confirmed after payment`);
      
      // TODO: Send confirmation email/SMS to customer
      
      break;
      
    case "CANCELLED":
    case "REJECTED":
      // Payment failed or cancelled - mark appointment
      await db.updateAppointment(appointmentId, {
        paymentStatus: "failed",
        // Keep status as pending, allow customer to retry payment
      });
      
      console.log(`[Vipps Webhook] Appointment ${appointmentId} payment failed`);
      
      break;
      
    default:
      console.warn(`[Vipps Webhook] Unknown status: ${status}`);
  }
}

/**
 * Handle Order Payment Callback (POS/Online Orders)
 */
async function handleOrderPayment(
  orderId: string,
  status: string,
  payload: any
) {
  // Extract order ID from order ID (ORD-123 → 123)
  const orderIdNum = parseInt(orderId.replace("ORD-", ""));
  
  if (isNaN(orderIdNum)) {
    console.error(`[Vipps Webhook] Invalid order ID in orderId: ${orderId}`);
    return;
  }
  
  const order = await db.getOrderById(orderIdNum);
  if (!order) {
    console.error(`[Vipps Webhook] Order not found: ${orderIdNum}`);
    return;
  }
  
  console.log(`[Vipps Webhook] Processing order ${orderIdNum}, status: ${status}`);
  
  switch (status) {
    case "RESERVED":
    case "SALE":
      // Payment successful
      console.log(`[Vipps Webhook] Order ${orderIdNum} payment successful`);
      // TODO: Update order status when updateOrder function is available
      break;
      
    case "CANCELLED":
    case "REJECTED":
      // Payment failed
      console.log(`[Vipps Webhook] Order ${orderIdNum} payment failed`);
      // TODO: Update order status when updateOrder function is available
      break;
      
    default:
      console.warn(`[Vipps Webhook] Unknown status: ${status}`);
  }
}

/**
 * Stripe Webhook Handler (for future use)
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  
  try {
    // Rate limiting
    const rateLimit = checkRateLimit(clientIp, 100, 60000);
    if (!rateLimit.allowed) {
      console.warn(`[Stripe Webhook] Rate limit exceeded for IP: ${clientIp}`);
      await logWebhookRequest("stripe", "/api/webhooks/stripe", req, false, false, "Rate limit exceeded");
      return res.status(429).json({ error: "Too many requests" });
    }
    
    // Validate request structure
    const validation = validateWebhookRequest(req, "stripe");
    if (!validation.valid) {
      console.error(`[Stripe Webhook] Validation failed: ${validation.error}`);
      await logWebhookRequest("stripe", "/api/webhooks/stripe", req, false, false, validation.error);
      return res.status(400).json({ error: validation.error });
    }
    
    // Verify signature (if secret is configured)
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (stripeWebhookSecret) {
      const signature = req.headers["stripe-signature"] as string;
      const payload = JSON.stringify(req.body);
      
      const isValid = verifyStripeSignature(payload, signature, stripeWebhookSecret);
      if (!isValid) {
        console.error("[Stripe Webhook] Invalid signature");
        await logWebhookRequest("stripe", "/api/webhooks/stripe", req, false, false, "Invalid signature");
        return res.status(401).json({ error: "Invalid signature" });
      }
    } else {
      console.warn("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured, skipping signature verification");
    }
    
    // TODO: Implement Stripe webhook handling
    console.log("[Stripe Webhook] Received callback");
    
    await logWebhookRequest("stripe", "/api/webhooks/stripe", req, true, true);
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Error:", error);
    await logWebhookRequest("stripe", "/api/webhooks/stripe", req, false, false, error.message);
    res.status(400).json({ error: error.message });
  }
}
