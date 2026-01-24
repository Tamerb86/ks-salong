import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    
    loginWithPin: publicProcedure
      .input(z.object({ pin: z.string().length(6) }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByPin(input.pin);
        if (!user) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid PIN" });
        }
        return { user };
      }),
  }),

  staff: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllStaff();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserById(input.id);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.enum(["owner", "manager", "barber", "cashier"]).optional(),
        pin: z.string().length(6).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateUser(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteUser(input.id);
        return { success: true };
      }),
  }),

  services: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllServices();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getServiceById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        duration: z.number(),
        price: z.string(),
        mvaTax: z.string().optional(),
        category: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createService(input);
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        duration: z.number().optional(),
        price: z.string().optional(),
        mvaTax: z.string().optional(),
        category: z.string().optional(),
        notes: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateService(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteService(input.id);
        return { success: true };
      }),
  }),

  products: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        sku: z.string().optional(),
        price: z.string(),
        cost: z.string().optional(),
        stock: z.number().optional(),
        lowStockThreshold: z.number().optional(),
        mvaTax: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createProduct(input);
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        sku: z.string().optional(),
        price: z.string().optional(),
        cost: z.string().optional(),
        stock: z.number().optional(),
        lowStockThreshold: z.number().optional(),
        mvaTax: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
  }),

  appointments: router({
    listByDate: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ input }) => {
        return await db.getAppointmentsByDate(input.date);
      }),
    
    listByDateRange: protectedProcedure
      .input(z.object({ 
        startDate: z.string(),
        endDate: z.string()
      }))
      .query(async ({ input }) => {
        return await db.getAppointmentsByDateRange(input.startDate, input.endDate);
      }),
    
    listByStaffAndDate: protectedProcedure
      .input(z.object({ staffId: z.number(), date: z.date() }))
      .query(async ({ input }) => {
        return await db.getAppointmentsByStaffAndDate(input.staffId, input.date);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAppointmentById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        staffId: z.number(),
        serviceId: z.number(),
        appointmentDate: z.date(),
        startTime: z.string(),
        endTime: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Check for conflicts
        const existingAppointments = await db.getAppointmentsByStaffAndDate(
          input.staffId,
          input.appointmentDate
        );
        
        const hasConflict = existingAppointments.some(apt => {
          return (
            (input.startTime >= apt.startTime && input.startTime < apt.endTime) ||
            (input.endTime > apt.startTime && input.endTime <= apt.endTime) ||
            (input.startTime <= apt.startTime && input.endTime >= apt.endTime)
          );
        });
        
        if (hasConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This time slot is already booked"
          });
        }
        
        const id = await db.createAppointment({
          ...input,
          status: "pending"
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "checked_in", "no_show", "cancelled", "completed"]).optional(),
        notes: z.string().optional(),
        cancellationReason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        
        if (data.status === "cancelled") {
          await db.updateAppointment(id, {
            ...data,
            cancelledAt: new Date(),
            cancelledBy: ctx.user!.id
          });
        } else {
          await db.updateAppointment(id, data);
        }
        
        return { success: true };
      }),
  }),

  queue: router({
    list: protectedProcedure.query(async () => {
      return await db.getActiveQueue();
    }),
    
    add: protectedProcedure
      .input(z.object({
        customerName: z.string(),
        customerPhone: z.string().optional(),
        serviceId: z.number(),
        preferredStaffId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const service = await db.getServiceById(input.serviceId);
        const estimatedWaitTime = service?.duration || 30;
        
        const id = await db.addToQueue({
          ...input,
          estimatedWaitTime,
          status: "waiting",
          position: 0 // Will be set by addToQueue function
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["waiting", "in_service", "completed", "cancelled"]).optional(),
        convertedToAppointmentId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateQueueItem(id, data);
        return { success: true };
      }),
    
    reorder: protectedProcedure
      .input(z.array(z.object({ id: z.number(), position: z.number() })))
      .mutation(async ({ input }) => {
        await db.reorderQueue(input);
        return { success: true };
      }),
  }),

  customers: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllCustomers();
    }),
    
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchCustomers(input.query);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string(),
        email: z.string().email().optional(),
        dateOfBirth: z.date().optional(),
        address: z.string().optional(),
        preferredStaffId: z.number().optional(),
        preferences: z.string().optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
        marketingEmailConsent: z.boolean().optional(),
        marketingSmsConsent: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createCustomer(input);
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        dateOfBirth: z.date().optional(),
        address: z.string().optional(),
        preferredStaffId: z.number().optional(),
        preferences: z.string().optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
        marketingEmailConsent: z.boolean().optional(),
        marketingSmsConsent: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCustomer(id, data);
        return { success: true };
      }),
    
    getBookingHistory: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerBookingHistory(input.customerId);
      }),
    
    getStatistics: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerStatistics(input.customerId);
      }),
  }),

  orders: router({
    create: protectedProcedure
      .input(z.object({
        customerId: z.number().optional(),
        items: z.array(z.object({
          itemType: z.enum(["service", "product"]),
          itemId: z.number(),
          itemName: z.string(),
          quantity: z.number(),
          unitPrice: z.string(),
          taxRate: z.string(),
          total: z.string(),
        })),
        subtotal: z.string(),
        taxAmount: z.string(),
        discountAmount: z.string().optional(),
        tipAmount: z.string().optional(),
        total: z.string(),
        notes: z.string().optional(),
        employeeId: z.number().optional(),
        employeeName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const orderNumber = `ORD-${Date.now()}`;
        
        const orderId = await db.createOrder({
          orderNumber,
          customerId: input.customerId,
          staffId: input.employeeId || ctx.user!.id, // Use logged-in employee or fallback to current user
          subtotal: input.subtotal,
          taxAmount: input.taxAmount,
          discountAmount: input.discountAmount || "0.00",
          tipAmount: input.tipAmount || "0.00",
          total: input.total,
          status: "pending",
          notes: input.notes,
        }, input.items.map(item => ({ ...item, orderId: 0 })));
        
        // Update product stock for product items
        for (const item of input.items) {
          if (item.itemType === "product") {
            await db.updateProductStock(item.itemId, -item.quantity);
          }
        }
        
        return { orderId, orderNumber };
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) return null;
        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),
  }),

  payments: router({
    create: protectedProcedure
      .input(z.object({
        orderId: z.number().optional(),
        appointmentId: z.number().optional(),
        customerId: z.number().optional(),
        amount: z.string(),
        method: z.enum(["vipps", "stripe", "cash", "gift_card"]),
        providerTransactionId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createPayment({
          ...input,
          status: input.method === "cash" ? "captured" : "initiated",
          provider: input.method === "vipps" || input.method === "stripe" ? input.method : null,
        });
        return { id };
      }),
  }),

  oldTimeTracking: router({
    getEntriesByStaffAndDate: protectedProcedure
      .input(z.object({ staffId: z.number(), date: z.date() }))
      .query(async ({ input }) => {
        return await db.getTimeEntriesByStaffAndDate(input.staffId, input.date);
      }),
    
    updateEntry: adminProcedure
      .input(z.object({
        id: z.number(),
        clockInTime: z.date().optional(),
        clockOutTime: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTimeEntry(id, data);
        return { success: true };
      }),
  }),

  dashboard: router({
    getStats: protectedProcedure.query(async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const appointments = await db.getAppointmentsByDate(today);
      const staff = await db.getAllStaff();
      
      return {
        todayAppointments: appointments.length,
        todayRevenue: 4850, // Mock data
        queueLength: 3, // Mock data
        staffOnDuty: staff.filter((s: any) => s.isActive).length,
        revenueChange: 15,
      };
    }),
  }),

  settings: router({
    get: protectedProcedure.query(async () => {
      return await db.getSalonSettings();
    }),
    
    update: adminProcedure
      .input(z.object({
        salonName: z.string().optional(),
        salonEmail: z.string().email().optional(),
        salonPhone: z.string().optional(),
        salonAddress: z.string().optional(),
        defaultMvaTax: z.string().optional(),
        bookingSlotInterval: z.number().optional(),
        bufferTimeBetweenAppointments: z.number().optional(),
        cancellationPolicyHours: z.number().optional(),
        reminder24hEnabled: z.boolean().optional(),
        reminder2hEnabled: z.boolean().optional(),
        vippsEnabled: z.boolean().optional(),
        requirePaymentForBooking: z.boolean().optional(),
        autoLogoutTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(), // HH:MM format
      }))
      .mutation(async ({ input }) => {
        await db.updateSalonSettings(input);
        return { success: true };
      }),
    
    getBusinessHours: protectedProcedure.query(async () => {
      return await db.getBusinessHours();
    }),
    
    updateBusinessHours: adminProcedure
      .input(z.object({
        dayOfWeek: z.number(),
        isOpen: z.boolean(),
        openTime: z.string(),
        closeTime: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { dayOfWeek, ...data } = input;
        await db.updateBusinessHours(dayOfWeek, data);
        return { success: true };
      }),
  }),

  timeTracking: router({    
    // Verify PIN and clock in
    clockIn: publicProcedure
      .input(z.object({ pin: z.string().length(4).or(z.string().length(6)) }))
      .mutation(async ({ input }) => {
        const employee = await db.verifyEmployeePin(input.pin);
        if (!employee) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Ugyldig PIN" });
        }
        
        const result = await db.clockInEmployee(employee.id);
        if (result?.error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
        }
        
        return { success: true, employee: { id: employee.id, name: employee.name, role: employee.role } };
      }),
    
    // Clock out
    clockOut: publicProcedure
      .input(z.object({ pin: z.string().length(4).or(z.string().length(6)) }))
      .mutation(async ({ input }) => {
        const employee = await db.verifyEmployeePin(input.pin);
        if (!employee) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Ugyldig PIN" });
        }
        
        const result = await db.clockOutEmployee(employee.id);
        if (result?.error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
        }
        
        return { success: true, ...result };
      }),
    
    // Get currently clocked in employees
    getClockedIn: protectedProcedure.query(async () => {
      return await db.getClockedInEmployees();
    }),
    
    // Get time entries for date range
    getEntries: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
        staffId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTimeEntries(input.startDate, input.endDate, input.staffId);
      }),
    
    // Get employee work summary
    getSummary: protectedProcedure
      .input(z.object({
        staffId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getEmployeeWorkSummary(input.staffId, input.startDate, input.endDate);
      }),
    
    // Get time report for date range
    getTimeReport: protectedProcedure
      .input(z.object({
        from: z.string(),
        to: z.string(),
        employeeId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const startDate = new Date(input.from + "T00:00:00");
        const endDate = new Date(input.to + "T23:59:59");
        return await db.getTimeEntries(startDate, endDate, input.employeeId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
