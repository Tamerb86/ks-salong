import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as fiken from "./fiken";
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
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByPin(input.pin);
        if (!user) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid PIN" });
        }
        
        // Log dashboard access
        await db.logDashboardAccess({
          userId: user.id,
          userName: user.name || "Unknown",
          userRole: user.role,
          ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress,
          userAgent: ctx.req.headers["user-agent"],
        });
        
        return { user };
      }),
  }),

  staff: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllStaff();
    }),
    
    listActive: publicProcedure.query(async () => {
      const allStaff = await db.getAllStaff();
      return allStaff.filter(staff => staff.isActive);
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
        skillLevel: z.enum(["beginner", "intermediate", "expert"]).optional(),
        durationMultiplier: z.string().optional(),
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
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
    
    updateStock: adminProcedure
      .input(z.object({
        id: z.number(),
        stock: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateProduct(input.id, { stock: input.stock });
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
        appointmentDate: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        status: z.enum(["pending", "confirmed", "checked_in", "no_show", "cancelled", "completed"]).optional(),
        paymentStatus: z.enum(["pending", "paid", "refunded"]).optional(),
        notes: z.string().optional(),
        cancellationReason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, appointmentDate, ...rest } = input;
        
        // Convert string date to Date object if provided
        const updateData: any = { ...rest };
        if (appointmentDate) {
          updateData.appointmentDate = new Date(appointmentDate);
        }
        
        if (rest.status === "cancelled") {
          await db.updateAppointment(id, {
            ...updateData,
            cancelledAt: new Date(),
            cancelledBy: ctx.user!.id
          });
        } else {
          await db.updateAppointment(id, updateData);
        }
        
        return { success: true };
      }),
    
    // Create booking with Vipps payment
    createWithPayment: publicProcedure
      .input(z.object({
        customerId: z.number(),
        staffId: z.number(),
        serviceId: z.number(),
        appointmentDate: z.date(),
        startTime: z.string(),
        endTime: z.string(),
        notes: z.string().optional(),
        requirePayment: z.boolean(),
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
        
        // Get service price
        const service = await db.getServiceById(input.serviceId);
        if (!service) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Service not found" });
        }
        
        // Create appointment
        const appointmentId = await db.createAppointment({
          customerId: input.customerId,
          staffId: input.staffId,
          serviceId: input.serviceId,
          appointmentDate: input.appointmentDate,
          startTime: input.startTime,
          endTime: input.endTime,
          notes: input.notes,
          status: input.requirePayment ? "pending" : "confirmed",
          paymentStatus: input.requirePayment ? "pending" : undefined,
          paymentAmount: input.requirePayment ? service.price : undefined,
        });
        
        // If payment required, initiate Vipps payment
        if (input.requirePayment) {
          const settings = await db.getSalonSettings();
          if (!settings?.vippsEnabled || !settings?.vippsClientId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Vipps not configured" });
          }
          
          const vipps = await import("./vipps");
          const customer = await db.getCustomerById(input.customerId);
          
          const paymentResult = await vipps.initiatePayment({
            amount: Number(service.price),
            customerPhone: customer?.phone,
            reference: `APT-${appointmentId}`,
            description: `Booking: ${service.name}`,
            returnUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/payment-callback`,
          });
          
          if (paymentResult.orderId && appointmentId) {
            await db.updateAppointment(appointmentId, {
              vippsOrderId: paymentResult.orderId,
            });
            
            return {
              appointmentId,
              requiresPayment: true,
              vippsUrl: paymentResult.redirectUrl,
              orderId: paymentResult.orderId,
            };
          } else {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to initiate payment" });
          }
        }
        
        return {
          appointmentId,
          requiresPayment: false,
        };
      }),
    
    // List all appointments
    list: protectedProcedure
      .query(async () => {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setMonth(endDate.getMonth() + 3); // Next 3 months
        
        return await db.getAppointmentsByDateRange(
          today.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
      }),
    
    // Cancel appointment
    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.updateAppointment(input.id, {
          status: "cancelled",
          cancelledAt: new Date(),
          cancelledBy: ctx.user!.id
        });
        return { success: true };
      }),
    
    // Check payment status
    checkPaymentStatus: publicProcedure
      .input(z.object({
        appointmentId: z.number(),
      }))
      .query(async ({ input }) => {
        const appointment = await db.getAppointmentById(input.appointmentId);
        if (!appointment) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Appointment not found" });
        }
        
        return {
          paymentStatus: (appointment as any).paymentStatus || "pending",
          status: appointment.status,
        };
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
    list: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        tag: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllCustomers(input || {});
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
        email: z.string().email().optional().or(z.literal('')),
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

    // Customer Notes
    addNote: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        note: z.string(),
        appointmentId: z.number().optional(),
        visitDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.addCustomerNote({
          ...input,
          createdBy: ctx.user.id,
          createdByName: ctx.user.name || 'Unknown',
        });
        return { id };
      }),

    getNotes: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerNotes(input.customerId);
      }),

    updateNote: protectedProcedure
      .input(z.object({ id: z.number(), note: z.string() }))
      .mutation(async ({ input }) => {
        await db.updateCustomerNote(input.id, input.note);
        return { success: true };
      }),

    deleteNote: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCustomerNote(input.id);
        return { success: true };
      }),

    // Customer Tags
    addTag: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        tag: z.enum(["VIP", "Regular", "New", "Inactive", "Loyal", "HighValue", "AtRisk"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.addCustomerTag({
          ...input,
          addedBy: ctx.user.id,
          addedByName: ctx.user.name || 'Unknown',
        });
        return { id };
      }),

    getTags: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerTags(input.customerId);
      }),

    deleteTag: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCustomerTag(input.id);
        return { success: true };
      }),

    getByTag: protectedProcedure
      .input(z.object({ tag: z.string() }))
      .query(async ({ input }) => {
        return await db.getCustomersByTag(input.tag);
      }),

    // Duplicate Management
    findDuplicates: protectedProcedure
      .query(async () => {
        return await db.findDuplicateCustomers();
      }),

    merge: protectedProcedure
      .input(z.object({ keepId: z.number(), deleteId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.mergeCustomers(input.keepId, input.deleteId);
      }),

    // GDPR
    exportData: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.exportCustomerData(input.customerId);
      }),

    deleteData: protectedProcedure
      .input(z.object({ customerId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteCustomerData(input.customerId);
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
          costPrice: z.string().optional(),
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
        // Generate invoice number: INV-YYYYMMDD-XXX
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderNumber = `INV-${dateStr}-${randomSuffix}`;
        
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
    
    list: protectedProcedure
      .input(z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        staffId: z.number().optional(),
        paymentMethod: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getOrdersByFilters(input);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) return null;
        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),
    
    getProfitability: protectedProcedure
      .input(z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        staffId: z.number().optional(),
        paymentMethod: z.string().optional(),
      }))
      .query(async ({ input }) => {
        // Get all orders
        const orders = await db.getOrdersByFilters(input);
        
        // Calculate profit for each order
        let totalRevenue = 0;
        let totalCost = 0;
        let totalProfit = 0;
        const orderProfits = [];
        
        for (const order of orders) {
          const items = await db.getOrderItems(order.id);
          
          let orderRevenue = parseFloat(order.total);
          let orderCost = 0;
          
          // Calculate cost from items
          for (const item of items) {
            const itemCost = parseFloat(item.costPrice || "0");
            orderCost += itemCost * item.quantity;
          }
          
          const orderProfit = orderRevenue - orderCost;
          
          totalRevenue += orderRevenue;
          totalCost += orderCost;
          totalProfit += orderProfit;
          
          orderProfits.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            revenue: orderRevenue,
            cost: orderCost,
            profit: orderProfit,
            profitMargin: orderRevenue > 0 ? (orderProfit / orderRevenue) * 100 : 0,
            createdAt: order.createdAt,
          });
        }
        
        return {
          totalRevenue,
          totalCost,
          totalProfit,
          profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
          orderProfits,
        };
      }),
    
    refund: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Get order items to restore stock
        const items = await db.getOrderItems(input.orderId);
        
        // Restore product stock
        for (const item of items) {
          if (item.itemType === "product") {
            await db.updateProductStock(item.itemId, item.quantity);
          }
        }
        
        // Update order status
        await db.updateOrderStatus(input.orderId, "refunded", input.reason);
        
        return { success: true };
      }),
    
    // Fiken Integration
    syncToFiken: protectedProcedure
      .input(z.object({
        orderId: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Get settings
        const settings = await db.getSalonSettings();
        
        if (!settings || !settings.fikenEnabled || !settings.fikenApiToken || !settings.fikenCompanySlug) {
          throw new TRPCError({ 
            code: "PRECONDITION_FAILED", 
            message: "Fiken integration is not configured" 
          });
        }
        
        // Get order details
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }
        
        const items = await db.getOrderItems(input.orderId);
        
        // Sync to Fiken
        const result = await fiken.syncOrderToFiken(
          settings.fikenApiToken,
          settings.fikenCompanySlug,
          {
            orderNumber: order.orderNumber,
            createdAt: new Date(order.createdAt),
            orderItems: items,
            customerId: order.customerId || undefined,
          }
        );
        
        if (!result.success) {
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: result.error || "Failed to sync to Fiken" 
          });
        }
        
        return { success: true, saleId: result.saleId };
      }),
    
    syncDailyToFiken: protectedProcedure
      .input(z.object({
        date: z.string(), // YYYY-MM-DD
      }))
      .mutation(async ({ input }) => {
        // Get settings
        const settings = await db.getSalonSettings();
        
        if (!settings || !settings.fikenEnabled || !settings.fikenApiToken || !settings.fikenCompanySlug) {
          throw new TRPCError({ 
            code: "PRECONDITION_FAILED", 
            message: "Fiken integration is not configured" 
          });
        }
        
        // Get all completed orders for the date
        const orders = await db.getOrdersByFilters({
          dateFrom: input.date,
          dateTo: input.date,
        });
        
        const completedOrders = orders.filter(o => o.status === "completed");
        
        let synced = 0;
        let failed = 0;
        const errors: string[] = [];
        
        for (const order of completedOrders) {
          const items = await db.getOrderItems(order.id);
          
          const result = await fiken.syncOrderToFiken(
            settings.fikenApiToken,
            settings.fikenCompanySlug,
            {
              orderNumber: order.orderNumber,
              createdAt: new Date(order.createdAt),
              orderItems: items,
              customerId: order.customerId || undefined,
            }
          );
          
          if (result.success) {
            synced++;
          } else {
            failed++;
            errors.push(`${order.orderNumber}: ${result.error}`);
          }
        }
        
        // Update last sync date
        await db.updateSalonSettings({ fikenLastSyncDate: new Date() });
        
        return { 
          success: true, 
          synced, 
          failed, 
          total: completedOrders.length,
          errors 
        };
      }),
    
    syncTodaySalesToFiken: protectedProcedure
      .mutation(async () => {
        // Get settings
        const settings = await db.getSalonSettings();
        
        if (!settings || !settings.fikenEnabled || !settings.fikenApiToken || !settings.fikenCompanySlug) {
          throw new TRPCError({ 
            code: "PRECONDITION_FAILED", 
            message: "Fiken integration is not configured" 
          });
        }
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Get all completed orders for today
        const orders = await db.getOrdersByFilters({
          dateFrom: today,
          dateTo: today,
        });
        
        const completedOrders = orders.filter(o => o.status === "completed");
        
        let synced = 0;
        let failed = 0;
        const errors: string[] = [];
        let totalAmount = 0;
        
        for (const order of completedOrders) {
          const items = await db.getOrderItems(order.id);
          
          const result = await fiken.syncOrderToFiken(
            settings.fikenApiToken,
            settings.fikenCompanySlug,
            {
              orderNumber: order.orderNumber,
              createdAt: new Date(order.createdAt),
              orderItems: items,
              customerId: order.customerId || undefined,
            }
          );
          
          if (result.success) {
            synced++;
            totalAmount += parseFloat(order.total);
          } else {
            failed++;
            errors.push(`${order.orderNumber}: ${result.error}`);
          }
        }
        
        // Log the sync operation
        await db.createFikenSyncLog({
          syncDate: today,
          startTime: new Date(),
          endTime: new Date(),
          status: failed === 0 ? "success" : "failure",
          salesCount: synced,
          totalAmount: totalAmount.toString(),
          errorMessage: errors.length > 0 ? errors.join("; ") : null,
        });
        
        // Update last sync date
        await db.updateSalonSettings({ fikenLastSyncDate: new Date() });
        
        return { 
          success: true, 
          synced, 
          failed, 
          total: completedOrders.length,
          totalAmount,
          errors 
        };
      }),
    
    verifyFikenTotals: protectedProcedure
      .input(z.object({
        dateFrom: z.string(), // YYYY-MM-DD
        dateTo: z.string(), // YYYY-MM-DD
      }))
      .query(async ({ input }) => {
        // Get settings
        const settings = await db.getSalonSettings();
        
        if (!settings || !settings.fikenEnabled || !settings.fikenApiToken || !settings.fikenCompanySlug) {
          throw new TRPCError({ 
            code: "PRECONDITION_FAILED", 
            message: "Fiken integration is not configured" 
          });
        }
        
        // Get K.S Salong total
        const orders = await db.getOrdersByFilters({
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
        });
        
        const completedOrders = orders.filter(o => o.status === "completed");
        const ksSalongTotal = completedOrders.reduce(
          (sum, order) => sum + parseFloat(order.total),
          0
        );
        
        // Verify with Fiken
        const verification = await fiken.verifyTotals(
          settings.fikenApiToken,
          settings.fikenCompanySlug,
          input.dateFrom,
          input.dateTo,
          ksSalongTotal
        );
        
        return verification;
      }),
  }),

  payments: router({
    list: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.enum(["pending", "initiated", "authorized", "captured", "refunded", "failed", "cancelled", "expired"]).optional(),
        method: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getPayments(input);
      }),
    
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
        vippsClientId: z.string().optional(),
        vippsClientSecret: z.string().optional(),
        vippsMerchantSerialNumber: z.string().optional(),
        vippsSubscriptionKey: z.string().optional(),
        requirePaymentForBooking: z.boolean().optional(),
        autoLogoutTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(), // HH:MM format
        universalPin: z.string().length(4).or(z.string().length(6)).optional(),
        fikenEnabled: z.boolean().optional(),
        fikenApiToken: z.string().optional(),
        fikenCompanySlug: z.string().optional(),
        fikenAutoSync: z.boolean().optional(),
        stripeTerminalEnabled: z.boolean().optional(),
        stripeTerminalLocationId: z.string().optional(),
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
    
    // Fiken Integration
    testFikenConnection: adminProcedure
      .input(z.object({
        apiToken: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await fiken.testFikenConnection(input.apiToken);
      }),
    
    getFikenCompanies: adminProcedure
      .input(z.object({
        apiToken: z.string(),
      }))
      .query(async ({ input }) => {
        const result = await fiken.testFikenConnection(input.apiToken);
        return result.companies || [];
      }),
    
    getFikenSyncLogs: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const logs = await db.getFikenSyncLogs(input?.limit || 100);
        return logs;
      }),
  }),

  terminal: router({
    // Test Stripe connection
    testConnection: adminProcedure
      .input(z.object({
        secretKey: z.string(),
      }))
      .mutation(async ({ input }) => {
        const terminal = await import("./stripeTerminal");
        return await terminal.testStripeConnection(input.secretKey);
      }),
    
    // Create Terminal Location
    createLocation: adminProcedure
      .input(z.object({
        displayName: z.string(),
        address: z.object({
          line1: z.string(),
          city: z.string(),
          country: z.string(),
          postalCode: z.string(),
        }),
      }))
      .mutation(async ({ input }) => {
        const settings = await db.getSalonSettings();
        if (!settings?.stripeSecretKey) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Stripe Secret Key not configured" });
        }
        const terminal = await import("./stripeTerminal");
        return await terminal.createTerminalLocation(settings.stripeSecretKey, input);
      }),
    
    // List Terminal Locations
    listLocations: adminProcedure.query(async () => {
      const settings = await db.getSalonSettings();
      if (!settings?.stripeSecretKey) {
        return [];
      }
      const terminal = await import("./stripeTerminal");
      return await terminal.listTerminalLocations(settings.stripeSecretKey);
    }),
    
    // Register Terminal Reader
    registerReader: adminProcedure
      .input(z.object({
        registrationCode: z.string(),
        label: z.string(),
      }))
      .mutation(async ({ input }) => {
        const settings = await db.getSalonSettings();
        if (!settings?.stripeSecretKey || !settings?.stripeTerminalLocationId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Stripe Terminal not configured" });
        }
        const terminal = await import("./stripeTerminal");
        const result = await terminal.registerTerminalReader(settings.stripeSecretKey, {
          ...input,
          locationId: settings.stripeTerminalLocationId,
        });
        
        if (result.success && result.reader) {
          // Save reader to database
          await db.saveTerminalReader({
            id: result.reader.id,
            label: result.reader.label,
            locationId: result.reader.location,
            serialNumber: result.reader.serial_number,
            deviceType: result.reader.device_type,
            status: result.reader.status,
            ipAddress: result.reader.ip_address,
          });
        }
        
        return result;
      }),
    
    // List Terminal Readers
    listReaders: protectedProcedure.query(async () => {
      return await db.getTerminalReaders();
    }),
    
    // Get Reader Status
    getReaderStatus: protectedProcedure
      .input(z.object({
        readerId: z.string(),
      }))
      .query(async ({ input }) => {
        const settings = await db.getSalonSettings();
        if (!settings?.stripeSecretKey) {
          return null;
        }
        const terminal = await import("./stripeTerminal");
        return await terminal.getTerminalReader(settings.stripeSecretKey, input.readerId);
      }),
    
    // Delete Terminal Reader
    deleteReader: adminProcedure
      .input(z.object({
        readerId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const settings = await db.getSalonSettings();
        if (!settings?.stripeSecretKey) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Stripe not configured" });
        }
        const terminal = await import("./stripeTerminal");
        const result = await terminal.deleteTerminalReader(settings.stripeSecretKey, input.readerId);
        
        if (result.success) {
          await db.deleteTerminalReader(input.readerId);
        }
        
        return result;
      }),
    
    // Create Payment Intent for Terminal
    createPaymentIntent: protectedProcedure
      .input(z.object({
        amount: z.number(),
        orderId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const settings = await db.getSalonSettings();
        if (!settings?.stripeSecretKey) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Stripe not configured" });
        }
        const terminal = await import("./stripeTerminal");
        return await terminal.createTerminalPaymentIntent(settings.stripeSecretKey, {
          amount: Math.round(input.amount * 100), // Convert to øre
          currency: "NOK",
          metadata: input.orderId ? { orderId: String(input.orderId) } : {},
        });
      }),
    
    // Process Payment on Reader
    processPayment: protectedProcedure
      .input(z.object({
        readerId: z.string(),
        paymentIntentId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const settings = await db.getSalonSettings();
        if (!settings?.stripeSecretKey) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Stripe not configured" });
        }
        const terminal = await import("./stripeTerminal");
        return await terminal.processPaymentOnReader(
          settings.stripeSecretKey,
          input.readerId,
          input.paymentIntentId
        );
      }),
    
    // Cancel Reader Action
    cancelPayment: protectedProcedure
      .input(z.object({
        readerId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const settings = await db.getSalonSettings();
        if (!settings?.stripeSecretKey) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Stripe not configured" });
        }
        const terminal = await import("./stripeTerminal");
        return await terminal.cancelReaderAction(settings.stripeSecretKey, input.readerId);
      }),
    
    // Get Payment Intent Status
    getPaymentStatus: protectedProcedure
      .input(z.object({
        paymentIntentId: z.string(),
      }))
      .query(async ({ input }) => {
        const settings = await db.getSalonSettings();
        if (!settings?.stripeSecretKey) {
          return null;
        }
        const terminal = await import("./stripeTerminal");
        return await terminal.getPaymentIntent(settings.stripeSecretKey, input.paymentIntentId);
      }),
  }),

  timeTracking: router({    
    // Verify PIN and clock in
    clockIn: publicProcedure
      .input(z.object({ 
        pin: z.string().length(4).or(z.string().length(6))
      }))
      .mutation(async ({ input }) => {
        // Find employee by PIN
        const employee = await db.getUserByPin(input.pin);
        if (!employee || !employee.isActive) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Ugyldig PIN" });
        }
        
        const result = await db.clockInEmployee(employee.id);
        if (result?.error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
        }
        
        if (!result || !('entry' in result)) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to clock in" });
        }
        
        return { success: true, employee: { id: employee.id, name: employee.name, role: employee.role }, timeEntry: result.entry };
      }),
    
    // Clock out
    clockOut: publicProcedure
      .input(z.object({ 
        pin: z.string().length(4).or(z.string().length(6))
      }))
      .mutation(async ({ input }) => {
        // Find employee by PIN
        const employee = await db.getUserByPin(input.pin);
        if (!employee || !employee.isActive) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Ugyldig PIN" });
        }
        
        const result = await db.clockOutEmployee(employee.id);
        if (result?.error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
        }
        
        if (!result) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to clock out" });
        }
        
        return { success: true, employee: { id: employee.id, name: employee.name, role: employee.role }, totalMinutes: result.totalMinutes, overtimeMinutes: result.overtimeMinutes };
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

    // Export time report to Excel
    exportTimeReportExcel: protectedProcedure
      .input(z.object({
        from: z.string(),
        to: z.string(),
        employeeId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const startDate = new Date(input.from + "T00:00:00");
        const endDate = new Date(input.to + "T23:59:59");
        const entries = await db.getTimeEntries(startDate, endDate, input.employeeId);
        
        // Generate Excel file
        const ExcelJS = await import("exceljs");
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tidsrapport");
        
        // Add title and filters
        worksheet.mergeCells("A1:F1");
        worksheet.getCell("A1").value = "Tidsrapport";
        worksheet.getCell("A1").font = { size: 16, bold: true };
        worksheet.getCell("A1").alignment = { horizontal: "center" };
        
        worksheet.getCell("A2").value = "Periode:";
        worksheet.getCell("B2").value = `${input.from} til ${input.to}`;
        
        // Add headers
        worksheet.getRow(4).values = ["Ansatt", "Dato", "Inn", "Ut", "Timer", "Overtid"];
        worksheet.getRow(4).font = { bold: true };
        
        // Add data
        let rowIndex = 5;
        let totalMinutes = 0;
        let overtimeMinutes = 0;
        
        entries.forEach((entry: any) => {
          const minutes = entry.totalMinutes || 0;
          totalMinutes += minutes;
          if (entry.isWeekend) overtimeMinutes += minutes;
          
          worksheet.getRow(rowIndex).values = [
            entry.employeeName,
            new Date(entry.clockIn).toLocaleDateString("nb-NO"),
            new Date(entry.clockIn).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }),
            entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }) : "Aktiv",
            (minutes / 60).toFixed(2),
            entry.isWeekend ? "Ja" : "Nei",
          ];
          rowIndex++;
        });
        
        // Add totals
        rowIndex++;
        worksheet.getCell(`A${rowIndex}`).value = "Totalt:";
        worksheet.getCell(`A${rowIndex}`).font = { bold: true };
        worksheet.getCell(`E${rowIndex}`).value = (totalMinutes / 60).toFixed(2);
        worksheet.getCell(`E${rowIndex}`).font = { bold: true };
        
        rowIndex++;
        worksheet.getCell(`A${rowIndex}`).value = "Overtidstimer:";
        worksheet.getCell(`E${rowIndex}`).value = (overtimeMinutes / 60).toFixed(2);
        
        // Auto-fit columns
        worksheet.columns.forEach(column => {
          column.width = 15;
        });
        
        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        
        return {
          data: base64,
          filename: `tidsrapport_${input.from}_${input.to}.xlsx`,
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };
      }),

    // Export time report to PDF
    exportTimeReportPDF: protectedProcedure
      .input(z.object({
        from: z.string(),
        to: z.string(),
        employeeId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const startDate = new Date(input.from + "T00:00:00");
        const endDate = new Date(input.to + "T23:59:59");
        const entries = await db.getTimeEntries(startDate, endDate, input.employeeId);
        
        // Generate PDF file
        const PDFDocument = (await import("pdfkit")).default;
        const doc = new PDFDocument({ margin: 50 });
        
        const chunks: Buffer[] = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        
        // Add title
        doc.fontSize(20).text("Tidsrapport", { align: "center" });
        doc.moveDown();
        
        // Add filters
        doc.fontSize(12).text(`Periode: ${input.from} til ${input.to}`);
        doc.moveDown();
        
        // Add table header
        const tableTop = doc.y;
        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Ansatt", 50, tableTop, { width: 100 });
        doc.text("Dato", 150, tableTop, { width: 80 });
        doc.text("Inn", 230, tableTop, { width: 50 });
        doc.text("Ut", 280, tableTop, { width: 50 });
        doc.text("Timer", 330, tableTop, { width: 50 });
        doc.text("Overtid", 380, tableTop, { width: 50 });
        
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
        doc.moveDown();
        
        // Add data
        doc.font("Helvetica");
        let totalMinutes = 0;
        let overtimeMinutes = 0;
        
        entries.forEach((entry: any) => {
          const minutes = entry.totalMinutes || 0;
          totalMinutes += minutes;
          if (entry.isWeekend) overtimeMinutes += minutes;
          
          const y = doc.y;
          doc.text(entry.employeeName, 50, y, { width: 100 });
          doc.text(new Date(entry.clockIn).toLocaleDateString("nb-NO"), 150, y, { width: 80 });
          doc.text(new Date(entry.clockIn).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }), 230, y, { width: 50 });
          doc.text(entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }) : "Aktiv", 280, y, { width: 50 });
          doc.text((minutes / 60).toFixed(2), 330, y, { width: 50 });
          doc.text(entry.isWeekend ? "Ja" : "Nei", 380, y, { width: 50 });
          doc.moveDown(0.5);
        });
        
        // Add totals
        doc.moveDown();
        doc.font("Helvetica-Bold");
        doc.text(`Totale timer: ${(totalMinutes / 60).toFixed(2)}`);
        doc.text(`Overtidstimer: ${(overtimeMinutes / 60).toFixed(2)}`);
        
        doc.end();
        
        // Wait for PDF generation to complete
        await new Promise<void>((resolve) => {
          doc.on("end", () => resolve());
        });
        
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString("base64");
        
        return {
          data: base64,
          filename: `tidsrapport_${input.from}_${input.to}.pdf`,
          mimeType: "application/pdf",
        };
      }),
  }),

  vipps: router({
    /**
     * Initiate a Vipps payment
     */
    initiatePayment: publicProcedure
      .input(z.object({
        appointmentId: z.number(),
        amount: z.number().positive(),
        customerPhone: z.string().optional(),
        description: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { initiatePayment } = await import("./vipps");
        
        // Generate unique reference
        const reference = `APT-${input.appointmentId}-${Date.now()}`;
        
        // Get return URL (current origin + callback path)
        const returnUrl = `${process.env.VITE_APP_URL || "http://localhost:3000"}/book-online/payment-callback`;
        
        try {
          const response = await initiatePayment({
            amount: input.amount,
            customerPhone: input.customerPhone,
            reference,
            description: input.description,
            returnUrl,
          });
          
          // Store payment record in database
          await db.createPayment({
            appointmentId: input.appointmentId,
            amount: input.amount.toString(),
            currency: "NOK",
            method: "vipps",
            status: "initiated",
            provider: "vipps",
            providerTransactionId: response.orderId,
            providerPaymentIntentId: reference,
          });
          
          return {
            success: true,
            redirectUrl: response.redirectUrl,
            reference,
            orderId: response.orderId,
          };
        } catch (error: any) {
          console.error("Failed to initiate Vipps payment:", error);
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: error.message || "Failed to initiate payment" 
          });
        }
      }),
    
    /**
     * Get payment status
     */
    getPaymentStatus: publicProcedure
      .input(z.object({
        reference: z.string(),
      }))
      .query(async ({ input }) => {
        const { getPaymentStatus } = await import("./vipps");
        
        try {
          const status = await getPaymentStatus(input.reference);
          
          return {
            success: true,
            state: status.state,
            authorizedAmount: status.aggregate.authorizedAmount.value / 100, // Convert øre to NOK
            capturedAmount: status.aggregate.capturedAmount.value / 100,
            refundedAmount: status.aggregate.refundedAmount.value / 100,
          };
        } catch (error: any) {
          console.error("Failed to get Vipps payment status:", error);
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: error.message || "Failed to get payment status" 
          });
        }
      }),
    
    /**
     * Capture payment (finalize transaction)
     */
    capturePayment: protectedProcedure
      .input(z.object({
        reference: z.string(),
        amount: z.number().positive().optional(),
      }))
      .mutation(async ({ input }) => {
        const { capturePayment } = await import("./vipps");
        
        try {
          await capturePayment(input.reference, input.amount);
          
          // Update payment status in database
          await db.updatePaymentStatus(input.reference, "captured");
          
          return { success: true };
        } catch (error: any) {
          console.error("Failed to capture Vipps payment:", error);
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: error.message || "Failed to capture payment" 
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
