import { Request, Response } from "express";
import { getSalonSettings } from "./db";

/**
 * Handle custom booking URL redirects
 * This middleware checks if the incoming request matches a custom booking URL
 * and redirects to the actual booking page
 */
export async function handleCustomBookingRedirect(
  req: Request,
  res: Response,
  next: Function
) {
  try {
    // Get the full URL from the request
    const requestHost = req.get("host") || "";
    const requestPath = req.path;
    
    // Skip if this is already the booking page or an API route
    if (requestPath === "/book-online" || requestPath.startsWith("/api/")) {
      return next();
    }
    
    // Get salon settings to check for custom booking URL
    const settings = await getSalonSettings();
    
    if (!settings || !settings.customBookingUrl) {
      return next();
    }
    
    const customUrl = settings.customBookingUrl;
    
    // Extract domain/subdomain from custom URL
    let customDomain = "";
    if (customUrl.startsWith("http://") || customUrl.startsWith("https://")) {
      // Full URL: extract domain
      try {
        const url = new URL(customUrl);
        customDomain = url.host;
      } catch (e) {
        return next();
      }
    } else {
      // Just subdomain
      customDomain = customUrl;
    }
    
    // Check if the current request matches the custom domain
    if (requestHost === customDomain) {
      // Redirect to the booking page
      return res.redirect(301, "/book-online");
    }
    
    next();
  } catch (error) {
    console.error("[Redirect Handler] Error:", error);
    next();
  }
}
