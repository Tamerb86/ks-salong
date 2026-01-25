import { CronJob } from "cron";
import * as db from "../db";

/**
 * Cron job to automatically cancel appointments with pending payment
 * that are older than 30 minutes.
 * Runs every 5 minutes.
 */
export function startCancelUnpaidAppointmentsCron() {
  const job = new CronJob(
    "*/5 * * * *", // Every 5 minutes
    async () => {
      try {
        console.log("[Cancel-Unpaid] Checking for expired unpaid appointments...");
        
        // Get all appointments with PENDING payment status
        const pendingAppointments = await db.getPendingPaymentAppointments();
        
        if (pendingAppointments.length === 0) {
          return;
        }

        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        
        let cancelledCount = 0;

        for (const appointment of pendingAppointments) {
          const createdAt = new Date(appointment.createdAt);
          
          // Check if appointment is older than 30 minutes
          if (createdAt < thirtyMinutesAgo) {
            try {
              await db.cancelAppointment(
                appointment.id,
                "Automatisk kansellert - betaling ikke mottatt innen 30 minutter"
              );
              
              console.log(
                `[Cancel-Unpaid] Cancelled appointment ID: ${appointment.id} ` +
                `(Customer: ${appointment.customer?.firstName} ${appointment.customer?.lastName}, ` +
                `Created: ${createdAt.toISOString()})`
              );
              
              cancelledCount++;
            } catch (error) {
              console.error(`[Cancel-Unpaid] Failed to cancel appointment ${appointment.id}:`, error);
            }
          }
        }

        if (cancelledCount > 0) {
          console.log(`[Cancel-Unpaid] Completed. Cancelled ${cancelledCount} appointment(s)`);
        }
      } catch (error) {
        console.error("[Cancel-Unpaid] Cron job error:", error);
      }
    },
    null, // onComplete
    true, // start immediately
    "Europe/Oslo" // timezone
  );

  console.log("[Cancel-Unpaid] Cron job started (runs every 5 minutes)");
  return job;
}
