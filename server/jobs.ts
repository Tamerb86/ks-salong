import cron from "node-cron";
import { getDb } from "./db";
import { timeEntries, salonSettings } from "../drizzle/schema";
import { isNull, eq } from "drizzle-orm";

/**
 * Auto Clock-Out Job
 * Runs every minute to check if it's time to automatically clock out employees
 */
export function startAutoClockOutJob() {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const db = await getDb();
      if (!db) return;
      
      // Get settings to check autoLogoutTime
      const settings = await db.select().from(salonSettings).limit(1);
      if (!settings || settings.length === 0) {
        return;
      }
      
      const autoLogoutTime = settings[0].autoLogoutTime || "22:00";
      const [hours, minutes] = autoLogoutTime.split(":").map(Number);
      
      // Get current time in Oslo timezone
      const now = new Date();
      const osloTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Oslo" }));
      const currentHours = osloTime.getHours();
      const currentMinutes = osloTime.getMinutes();
      
      // Check if current time matches auto logout time
      if (currentHours === hours && currentMinutes === minutes) {
        // Get all employees who are currently clocked in
        const activeSessions = await db
          .select()
          .from(timeEntries)
          .where(isNull(timeEntries.clockOut));
        
        if (activeSessions.length > 0) {
          console.log(`[Auto-ClockOut] Found ${activeSessions.length} active session(s) at ${autoLogoutTime}`);
          
          // Clock out all active employees
          const clockOutTime = new Date();
          for (const session of activeSessions) {
            const clockInTime = new Date(session.clockIn);
            const totalMinutes = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60));
            const totalWorkMinutes = totalMinutes - (session.totalBreakMinutes || 0);
            
            if (db) {
              await db
                .update(timeEntries)
                .set({
                  clockOut: clockOutTime,
                  totalWorkMinutes,
                  notes: session.notes 
                    ? `${session.notes} | Auto-clocked out at ${autoLogoutTime}`
                    : `Auto-clocked out at ${autoLogoutTime}`,
                })
                .where(eq(timeEntries.id, session.id));
            }
            
            console.log(`[Auto-ClockOut] Clocked out staff ID: ${session.staffId} (${totalWorkMinutes} work minutes)`);
          }
          
          console.log(`[Auto-ClockOut] Successfully clocked out ${activeSessions.length} employee(s)`);
        }
      }
    } catch (error) {
      console.error("[Auto-ClockOut] Error:", error);
    }
  });
  
  console.log("[Auto-ClockOut] Job started - checking every minute");
}

/**
 * Start all scheduled jobs
 */
export function startAllJobs() {
  startAutoClockOutJob();
}
