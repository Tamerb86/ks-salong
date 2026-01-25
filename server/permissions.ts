/**
 * Role-Based Access Control (RBAC) System
 * Defines permissions for each role and provides middleware for checking access
 */

import { TRPCError } from "@trpc/server";
import * as db from "./db";

/**
 * User roles in the system
 */
export type UserRole = "owner" | "manager" | "barber" | "cashier" | "customer";

/**
 * Permission types
 */
export type Permission =
  // Reports & Analytics
  | "view_reports"
  | "view_financial_reports"
  | "export_reports"
  
  // User Management
  | "manage_users"
  | "view_all_users"
  | "edit_user_roles"
  | "delete_users"
  
  // Staff Management
  | "manage_staff"
  | "view_all_staff"
  | "edit_staff_schedule"
  | "manage_staff_leaves"
  
  // Appointments
  | "view_all_appointments"
  | "view_own_appointments"
  | "create_appointments"
  | "edit_appointments"
  | "cancel_appointments"
  | "confirm_appointments"
  
  // Services
  | "manage_services"
  | "view_services"
  | "edit_service_prices"
  
  // Products
  | "manage_products"
  | "view_products"
  | "edit_product_prices"
  
  // POS & Sales
  | "access_pos"
  | "process_sales"
  | "process_refunds"
  | "view_sales_history"
  
  // Queue Management
  | "manage_queue"
  | "view_queue"
  
  // Time Tracking
  | "clock_in_out"
  | "view_own_time_entries"
  | "view_all_time_entries"
  | "edit_time_entries"
  
  // Settings
  | "edit_business_settings"
  | "edit_payment_settings"
  | "edit_notification_settings"
  | "manage_business_hours"
  
  // Customers
  | "view_customers"
  | "edit_customers"
  | "delete_customers"
  | "export_customer_data";

/**
 * Role-based permissions matrix
 * Defines what each role can do
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    // Full access to everything
    "view_reports",
    "view_financial_reports",
    "export_reports",
    "manage_users",
    "view_all_users",
    "edit_user_roles",
    "delete_users",
    "manage_staff",
    "view_all_staff",
    "edit_staff_schedule",
    "manage_staff_leaves",
    "view_all_appointments",
    "create_appointments",
    "edit_appointments",
    "cancel_appointments",
    "confirm_appointments",
    "manage_services",
    "view_services",
    "edit_service_prices",
    "manage_products",
    "view_products",
    "edit_product_prices",
    "access_pos",
    "process_sales",
    "process_refunds",
    "view_sales_history",
    "manage_queue",
    "view_queue",
    "clock_in_out",
    "view_own_time_entries",
    "view_all_time_entries",
    "edit_time_entries",
    "edit_business_settings",
    "edit_payment_settings",
    "edit_notification_settings",
    "manage_business_hours",
    "view_customers",
    "edit_customers",
    "delete_customers",
    "export_customer_data",
  ],
  
  manager: [
    // Can manage operations but not financial settings
    "view_reports",
    "export_reports",
    "view_all_users",
    "manage_staff",
    "view_all_staff",
    "edit_staff_schedule",
    "manage_staff_leaves",
    "view_all_appointments",
    "create_appointments",
    "edit_appointments",
    "cancel_appointments",
    "confirm_appointments",
    "manage_services",
    "view_services",
    "manage_products",
    "view_products",
    "access_pos",
    "process_sales",
    "view_sales_history",
    "manage_queue",
    "view_queue",
    "clock_in_out",
    "view_own_time_entries",
    "view_all_time_entries",
    "manage_business_hours",
    "view_customers",
    "edit_customers",
    "export_customer_data",
  ],
  
  barber: [
    // Can manage own schedule and appointments
    "view_own_appointments",
    "create_appointments",
    "edit_appointments",
    "confirm_appointments",
    "view_services",
    "view_products",
    "access_pos",
    "process_sales",
    "view_queue",
    "clock_in_out",
    "view_own_time_entries",
    "view_customers",
  ],
  
  cashier: [
    // Can handle POS and customer service
    "view_services",
    "view_products",
    "access_pos",
    "process_sales",
    "view_sales_history",
    "view_queue",
    "clock_in_out",
    "view_own_time_entries",
    "view_customers",
    "edit_customers",
  ],
  
  customer: [
    // Minimal permissions for online booking
    "view_services",
    "create_appointments",
    "view_own_appointments",
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole];
}

/**
 * Middleware factory for tRPC procedures
 * Throws FORBIDDEN error if user doesn't have required permission
 */
export function requirePermission(permission: Permission) {
  return (opts: { ctx: { user?: { role: UserRole } } }) => {
    const { ctx } = opts;
    
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Du må være innlogget for å få tilgang til denne funksjonen",
      });
    }
    
    if (!hasPermission(ctx.user.role, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Du har ikke tillatelse til å utføre denne handlingen. Påkrevd tillatelse: ${permission}`,
      });
    }
    
    return opts;
  };
}

/**
 * Middleware factory for requiring multiple permissions (all required)
 */
export function requireAllPermissions(permissions: Permission[]) {
  return (opts: { ctx: { user?: { role: UserRole } } }) => {
    const { ctx } = opts;
    
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Du må være innlogget for å få tilgang til denne funksjonen",
      });
    }
    
    if (!hasAllPermissions(ctx.user.role, permissions)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Du har ikke alle nødvendige tillatelser for å utføre denne handlingen",
      });
    }
    
    return opts;
  };
}

/**
 * Middleware factory for requiring any of the permissions
 */
export function requireAnyPermission(permissions: Permission[]) {
  return (opts: { ctx: { user?: { role: UserRole } } }) => {
    const { ctx } = opts;
    
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Du må være innlogget for å få tilgang til denne funksjonen",
      });
    }
    
    if (!hasAnyPermission(ctx.user.role, permissions)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Du har ikke noen av de nødvendige tillatelsene for å utføre denne handlingen",
      });
    }
    
    return opts;
  };
}

/**
 * Check if user is owner
 */
export function requireOwner(opts: { ctx: { user?: { role: UserRole } } }) {
  const { ctx } = opts;
  
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "يجب تسجيل الدخول للوصول إلى هذه الميزة",
    });
  }
  
  if (ctx.user.role !== "owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Denne funksjonen er kun tilgjengelig for salongeieren",
    });
  }
  
  return opts;
}

/**
 * Check if user is owner or manager
 */
export function requireOwnerOrManager(opts: { ctx: { user?: { role: UserRole } } }) {
  const { ctx } = opts;
  
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "يجب تسجيل الدخول للوصول إلى هذه الميزة",
    });
  }
  
  if (ctx.user.role !== "owner" && ctx.user.role !== "manager") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Denne funksjonen er kun tilgjengelig for eier eller leder",
    });
  }
  
  return opts;
}
