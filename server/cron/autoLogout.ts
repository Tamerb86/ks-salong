import { CronJob } from "cron";
import * as db from "../db";

/**
 * Auto-logout cron job
 * Runs every minute to check if any employees should be automatically logged out
 * based on the configured autoLogoutTime in settings
 */
export function startAutoLogoutCron() {
  const job = new CronJob(
    "0 * * * * *", // Every minute
    async () => {
      try {
        const settings = await db.getSalonSettings();
        if (!settings?.autoLogoutTime) {
          return; // No auto-logout time configured
        }

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        // Check if current time matches the configured logout time
        if (currentTime === settings.autoLogoutTime) {
          console.log(`[Auto-Logout] Running at ${currentTime}`);
          
          // Get all currently clocked-in employees
          const clockedInEmployees = await db.getClockedInEmployees();
          
          for (const employee of clockedInEmployees) {
            try {
              const result = await db.clockOutEmployee(employee.id);
              if (result && !result.error) {
                console.log(`[Auto-Logout] Logged out employee: ${employee.name} (ID: ${employee.id})`);
              }
            } catch (error) {
              console.error(`[Auto-Logout] Failed to logout employee ${employee.id}:`, error);
            }
          }
          
          if (clockedInEmployees.length > 0) {
            console.log(`[Auto-Logout] Completed. Logged out ${clockedInEmployees.length} employee(s)`);
          }
        }
      } catch (error) {
        console.error("[Auto-Logout] Cron job error:", error);
      }
    },
    null, // onComplete
    true, // start immediately
    "Europe/Oslo" // timezone
  );

  console.log("[Auto-Logout] Cron job started");
  return job;
}
