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
  try {
    // TODO: Implement Stripe webhook handling
    console.log("[Stripe Webhook] Received callback");
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Error:", error);
    res.status(400).json({ error: error.message });
  }
}
