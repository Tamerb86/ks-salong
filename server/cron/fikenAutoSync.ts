import { CronJob } from "cron";
import * as db from "../db";
import { syncDailySalesToFiken } from "../fiken";

/**
 * Cron job to automatically sync today's sales to Fiken
 * Runs daily at 23:00 (11 PM) Norway time.
 */
export function startFikenAutoSyncCron() {
  const job = new CronJob(
    "0 0 23 * * *", // Every day at 23:00 (11 PM)
    async () => {
      try {
        console.log("[Fiken-AutoSync] Starting daily sync at 23:00...");
        
        // Get salon settings to check if Fiken is enabled
        const settings = await db.getSalonSettings();
        
        if (!settings) {
          console.log("[Fiken-AutoSync] No salon settings found, skipping sync");
          return;
        }

        if (!settings.fikenEnabled) {
          console.log("[Fiken-AutoSync] Fiken integration is disabled, skipping sync");
          return;
        }

        if (!settings.fikenAutoSync) {
          console.log("[Fiken-AutoSync] Auto-sync is disabled in settings, skipping sync");
          return;
        }

        if (!settings.fikenApiToken || !settings.fikenCompanySlug) {
          console.error("[Fiken-AutoSync] Fiken credentials missing, skipping sync");
          return;
        }

        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        console.log(
          `[Fiken-AutoSync] Syncing sales from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`
        );

        // Sync today's sales
        const result = await syncDailySalesToFiken(
          settings.fikenApiToken,
          settings.fikenCompanySlug,
          startOfDay,
          endOfDay
        );

        if (result.success) {
          // Update last sync date
          await db.updateSalonSettings({
            fikenLastSyncDate: new Date(),
          });

          console.log(
            `[Fiken-AutoSync] Successfully synced ${result.salesCount} sale(s) to Fiken. ` +
            `Total amount: ${result.totalAmount} kr`
          );
        } else {
          console.error(`[Fiken-AutoSync] Sync failed: ${result.error}`);
        }
      } catch (error) {
        console.error("[Fiken-AutoSync] Cron job error:", error);
      }
    },
    null, // onComplete
    true, // start immediately
    "Europe/Oslo" // timezone
  );

  console.log("[Fiken-AutoSync] Cron job started (runs daily at 23:00)");
  return job;
}
