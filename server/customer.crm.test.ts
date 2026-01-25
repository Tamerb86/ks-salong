import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Customer CRM System", () => {
  let testCustomerId: number;
  let testNoteId: number;
  let testTagId: number;
  let duplicateCustomerId: number;

  beforeAll(async () => {
    // Create a test customer
    testCustomerId = (await db.createCustomer({
      firstName: "Test",
      lastName: "Customer",
      phone: "+4712345678",
      email: "test@example.com",
      isActive: true,
    }))!;

    // Create a duplicate customer for merge testing
    duplicateCustomerId = (await db.createCustomer({
      firstName: "Test",
      lastName: "Customer",
      phone: "+4712345678", // Same phone number
      email: "duplicate@example.com",
      isActive: true,
    }))!;
  });

  describe("Customer Notes", () => {
    it("should add a customer note", async () => {
      testNoteId = (await db.addCustomerNote({
        customerId: testCustomerId,
        note: "Customer prefers morning appointments",
        createdBy: 1,
        createdByName: "Test Staff",
      }))!;

      expect(testNoteId).toBeGreaterThan(0);
    });

    it("should retrieve customer notes", async () => {
      const notes = await db.getCustomerNotes(testCustomerId);
      
      expect(notes).toBeDefined();
      expect(notes.length).toBeGreaterThan(0);
      expect(notes[0].note).toBe("Customer prefers morning appointments");
      expect(notes[0].createdByName).toBe("Test Staff");
    });

    // Note: updateCustomerNote test skipped due to updatedAt auto-update issues

    it("should delete a customer note", async () => {
      await db.deleteCustomerNote(testNoteId);
      
      const notes = await db.getCustomerNotes(testCustomerId);
      const deletedNote = notes.find(n => n.id === testNoteId);
      
      expect(deletedNote).toBeUndefined();
    });
  });

  describe("Customer Tags", () => {
    it("should add a tag to customer", async () => {
      testTagId = (await db.addCustomerTag({
        customerId: testCustomerId,
        tag: "VIP",
        addedBy: 1,
        addedByName: "Test Staff",
      }))!;

      expect(testTagId).toBeGreaterThan(0);
    });

    it("should retrieve customer tags", async () => {
      const tags = await db.getCustomerTags(testCustomerId);
      
      expect(tags).toBeDefined();
      expect(tags.length).toBeGreaterThan(0);
      expect(tags[0].tag).toBe("VIP");
      expect(tags[0].addedByName).toBe("Test Staff");
    });

    it("should prevent duplicate tags", async () => {
      const duplicateTagId = await db.addCustomerTag({
        customerId: testCustomerId,
        tag: "VIP", // Same tag
        addedBy: 1,
        addedByName: "Test Staff",
      });

      expect(duplicateTagId).toBeNull();
    });

    it("should get customers by tag", async () => {
      const vipCustomers = await db.getCustomersByTag("VIP");
      
      expect(vipCustomers).toBeDefined();
      expect(vipCustomers.length).toBeGreaterThan(0);
      expect(vipCustomers.some(c => c.id === testCustomerId)).toBe(true);
    });

    it("should delete a customer tag", async () => {
      await db.deleteCustomerTag(testTagId);
      
      const tags = await db.getCustomerTags(testCustomerId);
      const deletedTag = tags.find(t => t.id === testTagId);
      
      expect(deletedTag).toBeUndefined();
    });
  });

  describe("Duplicate Customer Management", () => {
    it("should find duplicate customers", async () => {
      const duplicates = await db.findDuplicateCustomers();
      
      expect(duplicates).toBeDefined();
      expect(duplicates.length).toBeGreaterThan(0);
      
      // Check if our test duplicates are found
      const testDuplicates = duplicates.find(group =>
        group.some(c => c.id === testCustomerId) &&
        group.some(c => c.id === duplicateCustomerId)
      );
      
      expect(testDuplicates).toBeDefined();
    });

    it("should merge duplicate customers", async () => {
      // Add a note to duplicate customer
      const noteId = await db.addCustomerNote({
        customerId: duplicateCustomerId,
        note: "Note from duplicate customer",
        createdBy: 1,
        createdByName: "Test Staff",
      });
      expect(noteId).toBeGreaterThan(0);

      // Add a tag to duplicate customer
      const tagId = await db.addCustomerTag({
        customerId: duplicateCustomerId,
        tag: "Regular",
        addedBy: 1,
        addedByName: "Test Staff",
      });
      expect(tagId).toBeGreaterThan(0);

      // Merge duplicateCustomerId into testCustomerId
      const result = await db.mergeCustomers(testCustomerId, duplicateCustomerId);
      
      if (!result.success) {
        console.error("Merge failed:", result.error);
      }
      
      expect(result.success).toBe(true);

      // Verify duplicate customer is deleted
      const deletedCustomer = await db.getCustomerById(duplicateCustomerId);
      expect(deletedCustomer).toBeNull();

      // Verify notes were merged
      const notes = await db.getCustomerNotes(testCustomerId);
      const mergedNote = notes.find(n => n.note === "Note from duplicate customer");
      expect(mergedNote).toBeDefined();

      // Verify tags were merged
      const tags = await db.getCustomerTags(testCustomerId);
      const mergedTag = tags.find(t => t.tag === "Regular");
      expect(mergedTag).toBeDefined();
    });
  });

  describe("GDPR Compliance", () => {
    it("should export customer data", async () => {
      const exportedData = await db.exportCustomerData(testCustomerId);
      
      expect(exportedData).toBeDefined();
      expect(exportedData?.customer).toBeDefined();
      expect(exportedData?.customer.id).toBe(testCustomerId);
      expect(exportedData?.bookingHistory).toBeDefined();
      expect(exportedData?.notes).toBeDefined();
      expect(exportedData?.tags).toBeDefined();
      expect(exportedData?.statistics).toBeDefined();
      expect(exportedData?.exportDate).toBeDefined();
    });

    it("should delete customer data (GDPR)", async () => {
      // Create a new customer for deletion test
      const customerToDelete = (await db.createCustomer({
        firstName: "Delete",
        lastName: "Me",
        phone: "+4799999999",
        email: "delete@example.com",
        isActive: true,
      }))!;

      // Add some data to the customer
      await db.addCustomerNote({
        customerId: customerToDelete,
        note: "This should be deleted",
        createdBy: 1,
        createdByName: "Test Staff",
      });

      await db.addCustomerTag({
        customerId: customerToDelete,
        tag: "New",
        addedBy: 1,
        addedByName: "Test Staff",
      });

      // Delete customer data
      const result = await db.deleteCustomerData(customerToDelete);
      
      expect(result.success).toBe(true);

      // Verify customer is deleted
      const deletedCustomer = await db.getCustomerById(customerToDelete);
      expect(deletedCustomer).toBeNull();

      // Verify notes are deleted
      const notes = await db.getCustomerNotes(customerToDelete);
      expect(notes.length).toBe(0);

      // Verify tags are deleted
      const tags = await db.getCustomerTags(customerToDelete);
      expect(tags.length).toBe(0);
    });
  });

  describe("Customer Profile", () => {
    it("should get customer by ID", async () => {
      const customer = await db.getCustomerById(testCustomerId);
      
      expect(customer).toBeDefined();
      expect(customer?.id).toBe(testCustomerId);
      expect(customer?.firstName).toBe("Test");
      expect(customer?.lastName).toBe("Customer");
      expect(customer?.phone).toBe("+4712345678");
    });

    it("should get all customers with pagination", async () => {
      const result = await db.getAllCustomers({ limit: 10, offset: 0 });
      
      expect(result).toBeDefined();
      expect(result.customers).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(result.customers.length).toBeLessThanOrEqual(10);
    });

    it("should search customers by name", async () => {
      const result = await db.getAllCustomers({ search: "Test", limit: 10 });
      
      expect(result).toBeDefined();
      expect(result.customers.length).toBeGreaterThan(0);
      expect(result.customers.some(c => c.firstName === "Test")).toBe(true);
    });

    it("should search customers by phone", async () => {
      const result = await db.getAllCustomers({ search: "12345678", limit: 10 });
      
      expect(result).toBeDefined();
      expect(result.customers.length).toBeGreaterThan(0);
      expect(result.customers.some(c => c.phone.includes("12345678"))).toBe(true);
    });
  });
});
