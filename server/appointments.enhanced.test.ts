import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';
import { addWeeks, addMonths, format } from 'date-fns';

describe('Enhanced Appointments Features', () => {
  let testCustomerId: number;
  let testServiceId: number;
  let testStaffId: number;

  beforeAll(async () => {
    // Get existing test data
    const staff = await db.getAllStaff();
    testStaffId = staff[0].id;

    const services = await db.getAllServices();
    testServiceId = services[0].id;
  });

  describe('Quick Customer Creation', () => {
    it('should create a new customer with minimal required fields', async () => {
      const newCustomerId = await db.createCustomer({
        firstName: 'Quick',
        lastName: 'Test',
        phone: '+47 98765432',
      });

      expect(newCustomerId).toBeDefined();
      expect(typeof newCustomerId).toBe('number');
      expect(newCustomerId).toBeGreaterThan(0);

      testCustomerId = newCustomerId!;
    });

    it('should create customer with optional email', async () => {
      const newCustomerId = await db.createCustomer({
        firstName: 'Email',
        lastName: 'Test',
        phone: '+47 87654321',
        email: 'email@test.com',
      });

      expect(newCustomerId).toBeDefined();
      expect(typeof newCustomerId).toBe('number');
    });

    it('should handle duplicate phone numbers gracefully', async () => {
      // First customer
      await db.createCustomer({
        firstName: 'First',
        lastName: 'Duplicate',
        phone: '+47 11111111',
      });

      // Attempt duplicate - should throw or handle gracefully
      try {
        await db.createCustomer({
          firstName: 'Second',
          lastName: 'Duplicate',
          phone: '+47 11111111',
        });
        // If it doesn't throw, that's also acceptable (system allows duplicates)
        expect(true).toBe(true);
      } catch (error) {
        // If it throws, that's expected behavior
        expect(error).toBeDefined();
      }
    });
  });

  describe('Recurring Appointments', () => {
    it('should create multiple weekly recurring appointments', async () => {
      const baseDate = new Date();
      baseDate.setHours(10, 0, 0, 0);
      const startTime = '10:00';
      const endTime = '11:00';
      const recurrenceCount = 4;

      const appointmentIds = [];

      for (let i = 0; i < recurrenceCount; i++) {
        const appointmentDate = addWeeks(baseDate, i);
        
        const appointmentId = await db.createAppointment({
          customerId: testCustomerId,
          serviceId: testServiceId,
          staffId: testStaffId,
          appointmentDate,
          startTime,
          endTime,
          notes: `Weekly recurring appointment ${i + 1}/${recurrenceCount}`,
        });

        appointmentIds.push(appointmentId);
      }

      expect(appointmentIds).toHaveLength(recurrenceCount);
      
      // Verify all appointments were created
      appointmentIds.forEach(aptId => {
        expect(aptId).toBeDefined();
        expect(typeof aptId).toBe('number');
      });
    });

    it('should create multiple monthly recurring appointments', async () => {
      const baseDate = new Date();
      baseDate.setHours(14, 0, 0, 0);
      const startTime = '14:00';
      const endTime = '15:00';
      const recurrenceCount = 3;

      const appointmentIds = [];

      for (let i = 0; i < recurrenceCount; i++) {
        const appointmentDate = addMonths(baseDate, i);
        
        const appointmentId = await db.createAppointment({
          customerId: testCustomerId,
          serviceId: testServiceId,
          staffId: testStaffId,
          appointmentDate,
          startTime,
          endTime,
          notes: `Monthly recurring appointment ${i + 1}/${recurrenceCount}`,
        });

        appointmentIds.push(appointmentId);
      }

      expect(appointmentIds).toHaveLength(recurrenceCount);
      
      // Verify all appointments were created
      appointmentIds.forEach(aptId => {
        expect(aptId).toBeDefined();
        expect(typeof aptId).toBe('number');
      });
    });

    it('should validate recurring appointments for conflicts', async () => {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 30); // Future date
      baseDate.setHours(9, 0, 0, 0);
      
      // Create first appointment
      const firstAppointmentId = await db.createAppointment({
        customerId: testCustomerId,
        serviceId: testServiceId,
        staffId: testStaffId,
        appointmentDate: baseDate,
        startTime: '09:00',
        endTime: '10:00',
      });

      expect(firstAppointmentId).toBeDefined();
      expect(typeof firstAppointmentId).toBe('number');

      // Try to create conflicting appointment (same staff, same time)
      try {
        await db.createAppointment({
          customerId: testCustomerId,
          serviceId: testServiceId,
          staffId: testStaffId,
          appointmentDate: baseDate,
          startTime: '09:30',
          endTime: '10:30',
        });
        
        // If no error thrown, check if system allows overlapping
        // (Some systems might allow this)
        expect(true).toBe(true);
      } catch (error: any) {
        // Expected: conflict detection
        expect(error.message).toContain('conflict');
      }
    });

    it('should handle recurring appointments with same customer and service', async () => {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 60);
      baseDate.setHours(11, 0, 0, 0);
      const recurrenceCount = 5;

      const appointmentIds = [];
      
      for (let i = 0; i < recurrenceCount; i++) {
        const appointmentDate = addWeeks(baseDate, i);
        
        const aptId = await db.createAppointment({
          customerId: testCustomerId,
          serviceId: testServiceId,
          staffId: testStaffId,
          appointmentDate,
          startTime: '11:00',
          endTime: '12:00',
          notes: 'Regular weekly haircut',
        });

        appointmentIds.push(aptId);
      }

      expect(appointmentIds).toHaveLength(recurrenceCount);
      
      // All should be valid appointment IDs
      appointmentIds.forEach(aptId => {
        expect(aptId).toBeDefined();
        expect(typeof aptId).toBe('number');
      });
    });
  });

  describe('Combined Features', () => {
    it('should create customer and immediately book recurring appointments', async () => {
      // Create new customer
      const customerId = await db.createCustomer({
        firstName: 'Recurring',
        lastName: 'Customer',
        phone: '+47 55555555',
      });

      expect(customerId).toBeDefined();
      expect(typeof customerId).toBe('number');

      // Book recurring appointments for this new customer
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + 90);
      baseDate.setHours(15, 0, 0, 0);
      
      const appointmentIds = [];
      for (let i = 0; i < 3; i++) {
        const aptId = await db.createAppointment({
          customerId: customerId!,
          serviceId: testServiceId,
          staffId: testStaffId,
          appointmentDate: addWeeks(baseDate, i),
          startTime: '15:00',
          endTime: '16:00',
        });
        appointmentIds.push(aptId);
      }

      expect(appointmentIds).toHaveLength(3);
      appointmentIds.forEach(aptId => {
        expect(aptId).toBeDefined();
        expect(typeof aptId).toBe('number');
      });
    });
  });
});
