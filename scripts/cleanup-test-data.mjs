#!/usr/bin/env node
/**
 * Cleanup Test Data Script
 * 
 * This script deletes ALL test/demo data from the database before production launch.
 * 
 * WARNING: This action is IRREVERSIBLE! Make sure you have a backup before running.
 * 
 * Usage: node scripts/cleanup-test-data.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.js';
import { sql } from 'drizzle-orm';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function cleanupTestData() {
  console.log('🧹 Starting database cleanup...\n');
  
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    // Disable foreign key checks temporarily
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);

    console.log('📊 Deleting test data...\n');

    // Delete in order to respect foreign key constraints
    
    // 1. Delete order items first
    console.log('  ↳ Deleting order items...');
    const orderItemsResult = await db.delete(schema.orderItems);
    console.log(`    ✓ Deleted ${orderItemsResult.rowsAffected || 0} order items`);

    // 2. Delete orders
    console.log('  ↳ Deleting orders/sales...');
    const ordersResult = await db.delete(schema.orders);
    console.log(`    ✓ Deleted ${ordersResult.rowsAffected || 0} orders`);

    // 3. Delete payments
    console.log('  ↳ Deleting payments...');
    const paymentsResult = await db.delete(schema.payments);
    console.log(`    ✓ Deleted ${paymentsResult.rowsAffected || 0} payments`);

    // 4. Delete appointments
    console.log('  ↳ Deleting appointments...');
    const appointmentsResult = await db.delete(schema.appointments);
    console.log(`    ✓ Deleted ${appointmentsResult.rowsAffected || 0} appointments`);

    // 5. Delete queue entries
    console.log('  ↳ Deleting queue entries...');
    const queueResult = await db.delete(schema.queue);
    console.log(`    ✓ Deleted ${queueResult.rowsAffected || 0} queue entries`);

    // 6. Delete time entries
    console.log('  ↳ Deleting time entries...');
    const timeEntriesResult = await db.delete(schema.timeEntries);
    console.log(`    ✓ Deleted ${timeEntriesResult.rowsAffected || 0} time entries`);

    // 7. Delete customers
    console.log('  ↳ Deleting customers...');
    const customersResult = await db.delete(schema.customers);
    console.log(`    ✓ Deleted ${customersResult.rowsAffected || 0} customers`);

    // 8. Delete products (optional - uncomment if you want to delete products too)
    // console.log('  ↳ Deleting products...');
    // const productsResult = await db.delete(schema.products);
    // console.log(`    ✓ Deleted ${productsResult.rowsAffected || 0} products`);

    // 9. Delete services (optional - uncomment if you want to delete services too)
    // console.log('  ↳ Deleting services...');
    // const servicesResult = await db.delete(schema.services);
    // console.log(`    ✓ Deleted ${servicesResult.rowsAffected || 0} services`);

    // 10. Delete staff (optional - keep staff as they might be real employees)
    // console.log('  ↳ Deleting staff...');
    // const staffResult = await db.delete(schema.staff);
    // console.log(`    ✓ Deleted ${staffResult.rowsAffected || 0} staff members`);

    // Re-enable foreign key checks
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   • Orders: ${ordersResult.rowsAffected || 0} deleted`);
    console.log(`   • Order Items: ${orderItemsResult.rowsAffected || 0} deleted`);
    console.log(`   • Payments: ${paymentsResult.rowsAffected || 0} deleted`);
    console.log(`   • Appointments: ${appointmentsResult.rowsAffected || 0} deleted`);
    console.log(`   • Queue: ${queueResult.rowsAffected || 0} deleted`);
    console.log(`   • Time Entries: ${timeEntriesResult.rowsAffected || 0} deleted`);
    console.log(`   • Customers: ${customersResult.rowsAffected || 0} deleted`);
    console.log('\n🎉 Your database is now clean and ready for production!');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the cleanup
cleanupTestData();
