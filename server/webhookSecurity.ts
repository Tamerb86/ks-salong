/**
 * Webhook Security Utilities
 * Provides signature verification and validation for webhook requests
 */

import crypto from "crypto";
import { Request } from "express";

/**
 * Webhook request log entry
 */
interface WebhookLog {
  id: number;
  provider: string;
  endpoint: string;
  method: string;
  headers: string;
  body: string;
  ip: string;
  timestamp: Date;
  signatureValid: boolean;
  processed: boolean;
  error?: string;
}

/**
 * Verify Vipps webhook signature
 * Vipps uses HMAC-SHA256 signature in Authorization header
 */
export function verifyVippsSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Vipps sends signature as: "Bearer <signature>"
    const receivedSignature = signature.replace("Bearer ", "");
    
    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    
    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("[Webhook Security] Error verifying Vipps signature:", error);
    return false;
  }
}

/**
 * Verify Stripe webhook signature
 * Stripe uses Stripe-Signature header with timestamp and signature
 */
export function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string,
  tolerance: number = 300 // 5 minutes
): boolean {
  try {
    // Parse Stripe signature header: t=timestamp,v1=signature
    const elements = signature.split(",");
    const timestamp = elements.find((el) => el.startsWith("t="))?.split("=")[1];
    const sig = elements.find((el) => el.startsWith("v1="))?.split("=")[1];
    
    if (!timestamp || !sig) {
      console.error("[Webhook Security] Invalid Stripe signature format");
      return false;
    }
    
    // Check timestamp tolerance (prevent replay attacks)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - parseInt(timestamp) > tolerance) {
      console.error("[Webhook Security] Stripe signature timestamp too old");
      return false;
    }
    
    // Calculate expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(sig),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("[Webhook Security] Error verifying Stripe signature:", error);
    return false;
  }
}

/**
 * Validate webhook request
 * Checks for required headers and payload structure
 */
export function validateWebhookRequest(
  req: Request,
  provider: "vipps" | "stripe"
): { valid: boolean; error?: string } {
  // Check Content-Type
  const contentType = req.headers["content-type"];
  if (!contentType?.includes("application/json")) {
    return {
      valid: false,
      error: "Invalid Content-Type, expected application/json",
    };
  }
  
  // Check for signature header
  if (provider === "vipps") {
    const auth = req.headers["authorization"];
    if (!auth || !auth.startsWith("Bearer ")) {
      return {
        valid: false,
        error: "Missing or invalid Authorization header",
      };
    }
  } else if (provider === "stripe") {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return {
        valid: false,
        error: "Missing Stripe-Signature header",
      };
    }
  }
  
  // Check payload exists
  if (!req.body || Object.keys(req.body).length === 0) {
    return {
      valid: false,
      error: "Empty request body",
    };
  }
  
  return { valid: true };
}

/**
 * Rate limiter for webhook endpoints
 * Simple in-memory rate limiting (use Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `webhook:${ip}`;
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  // Reset if window expired
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Increment count
  entry.count++;
  
  // Check if limit exceeded
  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Clean up expired rate limit entries
 * Should be called periodically
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetAt) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * Log webhook request for audit trail
 * In production, this should write to database
 */
export async function logWebhookRequest(
  provider: string,
  endpoint: string,
  req: Request,
  signatureValid: boolean,
  processed: boolean,
  error?: string
): Promise<void> {
  const log = {
    provider,
    endpoint,
    method: req.method,
    headers: JSON.stringify(req.headers),
    body: JSON.stringify(req.body),
    ip: req.ip || req.socket.remoteAddress || "unknown",
    timestamp: new Date(),
    signatureValid,
    processed,
    error,
  };
  
  // TODO: Save to database for audit trail
  console.log("[Webhook Audit]", JSON.stringify(log, null, 2));
}
