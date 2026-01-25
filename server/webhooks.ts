/**
 * Webhook Handlers for Payment Providers
 * Handles callbacks from Vipps and Stripe
 */

import { Request, Response } from "express";
import * as db from "./db";
import * as vipps from "./vipps";

/**
 * Vipps Payment Callback Handler
 * Called by Vipps when payment status changes
 */
export async function handleVippsCallback(req: Request, res: Response) {
  try {
    const payload = req.body;
    
    console.log("[Vipps Webhook] Received callback:", JSON.stringify(payload, null, 2));
    
    // ePayment API v1 format
    // Extract reference (format: APT-123 or ORD-456)
    const reference = payload.reference || payload.orderId; // Support both formats
    const state = payload.state; // CREATED, AUTHORIZED, TERMINATED, ABORTED, EXPIRED
    
    if (!reference || !state) {
      console.error("[Vipps Webhook] Missing reference or state");
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Determine if this is an appointment or order payment
    if (reference.startsWith("APT-")) {
      await handleAppointmentPayment(reference, state, payload);
    } else if (reference.startsWith("ORD-")) {
      await handleOrderPayment(reference, state, payload);
    } else {
      console.warn(`[Vipps Webhook] Unknown reference format: ${reference}`);
    }
    
    // Always respond with 200 OK to Vipps
    res.status(200).json({ message: "Webhook received" });
    
  } catch (error: any) {
    console.error("[Vipps Webhook] Error processing callback:", error);
    // Still return 200 to prevent Vipps from retrying
    res.status(200).json({ message: "Error logged" });
  }
}

/**
 * Handle Appointment Payment Callback
 */
async function handleAppointmentPayment(
  reference: string,
  state: string,
  payload: any
) {
  // Extract appointment ID from reference (APT-123 → 123)
  const appointmentId = parseInt(reference.replace("APT-", ""));
  
  if (isNaN(appointmentId)) {
    console.error(`[Vipps Webhook] Invalid appointment ID in reference: ${reference}`);
    return;
  }
  
  const appointment = await db.getAppointmentById(appointmentId);
  if (!appointment) {
    console.error(`[Vipps Webhook] Appointment not found: ${appointmentId}`);
    return;
  }
  
  console.log(`[Vipps Webhook] Processing appointment ${appointmentId}, state: ${state}`);
  
  // Update payment status in payments table
  await db.updatePaymentStatus(reference, mapVippsStateToPaymentStatus(state), new Date());
  
  switch (state) {
    case "AUTHORIZED":
      // Payment authorized - confirm appointment and capture payment
      await db.updateAppointment(appointmentId, {
        paymentStatus: "paid",
        status: "confirmed",
        paidAt: new Date(),
      });
      
      console.log(`[Vipps Webhook] Appointment ${appointmentId} confirmed after payment`);
      
      // Auto-capture the payment
      try {
        await vipps.capturePayment(reference, payload.aggregate?.authorizedAmount?.value || 0);
        console.log(`[Vipps Webhook] Payment captured for appointment ${appointmentId}`);
      } catch (error: any) {
        console.error(`[Vipps Webhook] Failed to capture payment:`, error);
      }
      
      // TODO: Send confirmation email/SMS to customer
      
      break;
      
    case "ABORTED":
    case "EXPIRED":
    case "TERMINATED":
      // Payment failed or cancelled - mark appointment
      await db.updateAppointment(appointmentId, {
        paymentStatus: "failed",
        // Keep status as pending, allow customer to retry payment
      });
      
      console.log(`[Vipps Webhook] Appointment ${appointmentId} payment failed (${state})`);
      
      break;
      
    case "CREATED":
      // Payment initiated but not completed yet
      console.log(`[Vipps Webhook] Appointment ${appointmentId} payment initiated`);
      break;
      
    default:
      console.warn(`[Vipps Webhook] Unknown state: ${state}`);
  }
}

/**
 * Map Vipps ePayment API state to payment status
 */
function mapVippsStateToPaymentStatus(state: string): "pending" | "initiated" | "authorized" | "captured" | "refunded" | "failed" | "cancelled" | "expired" {
  switch (state) {
    case "CREATED":
      return "initiated";
    case "AUTHORIZED":
      return "authorized";
    case "ABORTED":
      return "cancelled";
    case "EXPIRED":
      return "expired";
    case "TERMINATED":
      return "failed";
    default:
      return "failed";
  }
}

/**
 * Handle Order Payment Callback (POS/Online Orders)
 */
async function handleOrderPayment(
  reference: string,
  state: string,
  payload: any
) {
  // Extract order ID from reference (ORD-123 → 123)
  const orderIdNum = parseInt(reference.replace("ORD-", ""));
  
  if (isNaN(orderIdNum)) {
    console.error(`[Vipps Webhook] Invalid order ID in reference: ${reference}`);
    return;
  }
  
  const order = await db.getOrderById(orderIdNum);
  if (!order) {
    console.error(`[Vipps Webhook] Order not found: ${orderIdNum}`);
    return;
  }
  
  console.log(`[Vipps Webhook] Processing order ${orderIdNum}, state: ${state}`);
  
  // Update payment status in payments table
  await db.updatePaymentStatus(reference, mapVippsStateToPaymentStatus(state), new Date());
  
  switch (state) {
    case "AUTHORIZED":
      // Payment authorized
      console.log(`[Vipps Webhook] Order ${orderIdNum} payment authorized`);
      
      // Auto-capture the payment
      try {
        await vipps.capturePayment(reference, payload.aggregate?.authorizedAmount?.value || 0);
        console.log(`[Vipps Webhook] Payment captured for order ${orderIdNum}`);
      } catch (error: any) {
        console.error(`[Vipps Webhook] Failed to capture payment:`, error);
      }
      
      // TODO: Update order status when updateOrder function is available
      break;
      
    case "ABORTED":
    case "EXPIRED":
    case "TERMINATED":
      // Payment failed
      console.log(`[Vipps Webhook] Order ${orderIdNum} payment failed (${state})`);
      // TODO: Update order status when updateOrder function is available
      break;
      
    case "CREATED":
      // Payment initiated
      console.log(`[Vipps Webhook] Order ${orderIdNum} payment initiated`);
      break;
      
    default:
      console.warn(`[Vipps Webhook] Unknown state: ${state}`);
  }
}

/**
 * Stripe Webhook Handler (for future use)
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  try {
    // TODO: Implement Stripe webhook handling
    console.log("[Stripe Webhook] Received callback");
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Error:", error);
    res.status(400).json({ error: error.message });
  }
}
