import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log("🌱 Seeding database...");

// Clear existing data
console.log("Clearing existing data...");
await db.delete(schema.orderItems);
await db.delete(schema.orders);
await db.delete(schema.payments);
await db.delete(schema.appointments);
await db.delete(schema.dropInQueue);
await db.delete(schema.timeEntries);
await db.delete(schema.serviceStaff);
await db.delete(schema.products);
await db.delete(schema.services);
await db.delete(schema.customers);
await db.delete(schema.businessHours);
await db.delete(schema.salonSettings);
await db.delete(schema.permissions);
await db.delete(schema.users);

// Insert salon settings
console.log("Creating salon settings...");
await db.insert(schema.salonSettings).values({
  salonName: "K.S Salong",
  salonEmail: "contact@kssalong.no",
  salonPhone: "+47 123 45 678",
  salonAddress: "Storgata 1, 0155 Oslo, Norway",
  defaultMvaTax: "25.00",
  currency: "NOK",
  timezone: "Europe/Oslo",
  bookingSlotInterval: 15,
  bufferTimeBetweenAppointments: 5,
  cancellationPolicyHours: 24,
  lateCancellationFeePercent: "50.00",
  noShowFeePercent: "100.00",
  noShowThresholdForPrepayment: 3,
  reminder24hEnabled: true,
  reminder2hEnabled: true,
});

// Insert business hours
console.log("Creating business hours...");
const businessHoursData = [
  { dayOfWeek: 0, isOpen: false, openTime: "00:00", closeTime: "00:00" }, // Sunday
  { dayOfWeek: 1, isOpen: true, openTime: "09:00", closeTime: "18:00" },  // Monday
  { dayOfWeek: 2, isOpen: true, openTime: "09:00", closeTime: "18:00" },  // Tuesday
  { dayOfWeek: 3, isOpen: true, openTime: "09:00", closeTime: "18:00" },  // Wednesday
  { dayOfWeek: 4, isOpen: true, openTime: "09:00", closeTime: "20:00" },  // Thursday
  { dayOfWeek: 5, isOpen: true, openTime: "09:00", closeTime: "18:00" },  // Friday
  { dayOfWeek: 6, isOpen: true, openTime: "10:00", closeTime: "16:00" },  // Saturday
];
await db.insert(schema.businessHours).values(businessHoursData);

// Insert staff users
console.log("Creating staff users...");
const staffUsers = await db.insert(schema.users).values([
  {
    openId: "owner-001",
    name: "Khalid Saeed",
    email: "khalid@kssalong.no",
    phone: "+47 900 00 001",
    role: "owner",
    pin: "123456",
    isActive: true,
  },
  {
    openId: "manager-001",
    name: "Sara Hansen",
    email: "sara@kssalong.no",
    phone: "+47 900 00 002",
    role: "manager",
    pin: "234567",
    isActive: true,
  },
  {
    openId: "barber-001",
    name: "Mohammed Ali",
    email: "mohammed@kssalong.no",
    phone: "+47 900 00 003",
    role: "barber",
    pin: "345678",
    isActive: true,
  },
  {
    openId: "barber-002",
    name: "Lars Olsen",
    email: "lars@kssalong.no",
    phone: "+47 900 00 004",
    role: "barber",
    pin: "456789",
    isActive: true,
  },
  {
    openId: "cashier-001",
    name: "Nina Berg",
    email: "nina@kssalong.no",
    phone: "+47 900 00 005",
    role: "cashier",
    pin: "567890",
    isActive: true,
  },
]);

console.log("Staff users created:", staffUsers);

// Insert services
console.log("Creating services...");
const servicesData = [
  { name: "Herreklipp", description: "Men's haircut", duration: 30, price: "350.00", mvaTax: "25.00", category: "Haircut" },
  { name: "Dameklipp", description: "Women's haircut", duration: 45, price: "450.00", mvaTax: "25.00", category: "Haircut" },
  { name: "Barneklipp", description: "Children's haircut", duration: 20, price: "250.00", mvaTax: "25.00", category: "Haircut" },
  { name: "Skjegg trim", description: "Beard trim", duration: 20, price: "200.00", mvaTax: "25.00", category: "Grooming" },
  { name: "Skjegg og hår", description: "Beard and hair combo", duration: 45, price: "500.00", mvaTax: "25.00", category: "Combo" },
  { name: "Farge", description: "Hair coloring", duration: 90, price: "800.00", mvaTax: "25.00", category: "Coloring" },
  { name: "Permanent", description: "Hair perm", duration: 120, price: "1200.00", mvaTax: "25.00", category: "Treatment" },
  { name: "Vask og føn", description: "Wash and blow dry", duration: 30, price: "300.00", mvaTax: "25.00", category: "Styling" },
  { name: "Ansiktsbehandling", description: "Facial treatment", duration: 60, price: "600.00", mvaTax: "25.00", category: "Treatment" },
  { name: "Voksing", description: "Waxing", duration: 30, price: "400.00", mvaTax: "25.00", category: "Grooming" },
];
await db.insert(schema.services).values(servicesData);

// Insert products
console.log("Creating products...");
const productsData = [
  { name: "Shampoo Premium", description: "Professional shampoo 500ml", sku: "SHP-001", price: "250.00", cost: "100.00", stock: 50, mvaTax: "25.00", category: "Hair Care" },
  { name: "Conditioner Premium", description: "Professional conditioner 500ml", sku: "CND-001", price: "280.00", cost: "110.00", stock: 45, mvaTax: "25.00", category: "Hair Care" },
  { name: "Hair Wax", description: "Styling wax 100ml", sku: "WAX-001", price: "180.00", cost: "70.00", stock: 60, mvaTax: "25.00", category: "Styling" },
  { name: "Hair Gel", description: "Strong hold gel 150ml", sku: "GEL-001", price: "150.00", cost: "60.00", stock: 55, mvaTax: "25.00", category: "Styling" },
  { name: "Beard Oil", description: "Nourishing beard oil 50ml", sku: "BOL-001", price: "220.00", cost: "90.00", stock: 40, mvaTax: "25.00", category: "Beard Care" },
  { name: "Hair Spray", description: "Flexible hold spray 300ml", sku: "SPR-001", price: "200.00", cost: "80.00", stock: 50, mvaTax: "25.00", category: "Styling" },
  { name: "Hair Serum", description: "Repair serum 100ml", sku: "SER-001", price: "350.00", cost: "140.00", stock: 30, mvaTax: "25.00", category: "Treatment" },
  { name: "Shaving Cream", description: "Premium shaving cream 200ml", sku: "SHV-001", price: "180.00", cost: "70.00", stock: 45, mvaTax: "25.00", category: "Grooming" },
  { name: "Aftershave Balm", description: "Soothing balm 100ml", sku: "AFT-001", price: "200.00", cost: "80.00", stock: 40, mvaTax: "25.00", category: "Grooming" },
  { name: "Hair Mask", description: "Deep conditioning mask 250ml", sku: "MSK-001", price: "320.00", cost: "130.00", stock: 35, mvaTax: "25.00", category: "Treatment" },
];
await db.insert(schema.products).values(productsData);

// Insert customers
console.log("Creating customers...");
const customersData = [
  { firstName: "Ole", lastName: "Andersen", phone: "+47 400 00 001", email: "ole.andersen@email.no", totalVisits: 12, totalSpent: "4200.00", lastVisit: new Date("2026-01-20"), tags: ["Regular", "VIP"] },
  { firstName: "Kari", lastName: "Johansen", phone: "+47 400 00 002", email: "kari.j@email.no", totalVisits: 8, totalSpent: "3600.00", lastVisit: new Date("2026-01-22"), tags: ["Regular"] },
  { firstName: "Per", lastName: "Hansen", phone: "+47 400 00 003", email: "per.hansen@email.no", totalVisits: 5, totalSpent: "1750.00", lastVisit: new Date("2026-01-18"), tags: ["Regular"] },
  { firstName: "Lise", lastName: "Berg", phone: "+47 400 00 004", email: "lise.berg@email.no", totalVisits: 15, totalSpent: "6750.00", lastVisit: new Date("2026-01-23"), tags: ["VIP", "Regular"] },
  { firstName: "Erik", lastName: "Nilsen", phone: "+47 400 00 005", email: "erik.n@email.no", totalVisits: 3, totalSpent: "1050.00", lastVisit: new Date("2026-01-15"), tags: ["New"] },
  { firstName: "Anna", lastName: "Larsen", phone: "+47 400 00 006", email: "anna.l@email.no", totalVisits: 10, totalSpent: "4500.00", lastVisit: new Date("2026-01-21"), tags: ["Regular"] },
  { firstName: "Thomas", lastName: "Pedersen", phone: "+47 400 00 007", email: "thomas.p@email.no", totalVisits: 7, totalSpent: "2450.00", lastVisit: new Date("2026-01-19"), tags: ["Regular"] },
  { firstName: "Maria", lastName: "Kristiansen", phone: "+47 400 00 008", email: "maria.k@email.no", totalVisits: 20, totalSpent: "9000.00", lastVisit: new Date("2026-01-24"), tags: ["VIP", "Regular"] },
  { firstName: "Jonas", lastName: "Olsen", phone: "+47 400 00 009", email: "jonas.o@email.no", totalVisits: 4, totalSpent: "1400.00", lastVisit: new Date("2026-01-17"), tags: ["New"] },
  { firstName: "Ingrid", lastName: "Svendsen", phone: "+47 400 00 010", email: "ingrid.s@email.no", totalVisits: 9, totalSpent: "4050.00", lastVisit: new Date("2026-01-22"), tags: ["Regular"] },
  { firstName: "Martin", lastName: "Haugen", phone: "+47 400 00 011", email: "martin.h@email.no", totalVisits: 6, totalSpent: "2100.00", lastVisit: new Date("2026-01-20"), tags: ["Regular"] },
  { firstName: "Sofie", lastName: "Moen", phone: "+47 400 00 012", email: "sofie.m@email.no", totalVisits: 11, totalSpent: "4950.00", lastVisit: new Date("2026-01-23"), tags: ["Regular"] },
  { firstName: "Henrik", lastName: "Dahl", phone: "+47 400 00 013", email: "henrik.d@email.no", totalVisits: 2, totalSpent: "700.00", lastVisit: new Date("2026-01-16"), tags: ["New"] },
  { firstName: "Emma", lastName: "Bakke", phone: "+47 400 00 014", email: "emma.b@email.no", totalVisits: 13, totalSpent: "5850.00", lastVisit: new Date("2026-01-24"), tags: ["VIP", "Regular"] },
  { firstName: "Andreas", lastName: "Lund", phone: "+47 400 00 015", email: "andreas.l@email.no", totalVisits: 5, totalSpent: "1750.00", lastVisit: new Date("2026-01-18"), tags: ["Regular"] },
  { firstName: "Nora", lastName: "Vik", phone: "+47 400 00 016", email: "nora.v@email.no", totalVisits: 8, totalSpent: "3600.00", lastVisit: new Date("2026-01-21"), tags: ["Regular"] },
  { firstName: "Magnus", lastName: "Strand", phone: "+47 400 00 017", email: "magnus.s@email.no", totalVisits: 4, totalSpent: "1400.00", lastVisit: new Date("2026-01-19"), tags: ["New"] },
  { firstName: "Julie", lastName: "Eide", phone: "+47 400 00 018", email: "julie.e@email.no", totalVisits: 16, totalSpent: "7200.00", lastVisit: new Date("2026-01-24"), tags: ["VIP", "Regular"] },
  { firstName: "Tobias", lastName: "Moe", phone: "+47 400 00 019", email: "tobias.m@email.no", totalVisits: 7, totalSpent: "2450.00", lastVisit: new Date("2026-01-22"), tags: ["Regular"] },
  { firstName: "Emilie", lastName: "Holm", phone: "+47 400 00 020", email: "emilie.h@email.no", totalVisits: 9, totalSpent: "4050.00", lastVisit: new Date("2026-01-23"), tags: ["Regular"] },
];
await db.insert(schema.customers).values(customersData);

// Insert some appointments for today
console.log("Creating appointments...");
const today = new Date();
today.setHours(0, 0, 0, 0);

const appointmentsData = [
  { customerId: 1, staffId: 3, serviceId: 1, appointmentDate: today, startTime: "09:00", endTime: "09:30", status: "completed" },
  { customerId: 2, staffId: 4, serviceId: 2, appointmentDate: today, startTime: "09:00", endTime: "09:45", status: "completed" },
  { customerId: 3, staffId: 3, serviceId: 5, appointmentDate: today, startTime: "10:00", endTime: "10:45", status: "completed" },
  { customerId: 4, staffId: 4, serviceId: 6, appointmentDate: today, startTime: "10:00", endTime: "11:30", status: "checked_in" },
  { customerId: 5, staffId: 3, serviceId: 1, appointmentDate: today, startTime: "11:00", endTime: "11:30", status: "confirmed" },
  { customerId: 6, staffId: 4, serviceId: 2, appointmentDate: today, startTime: "12:00", endTime: "12:45", status: "confirmed" },
  { customerId: 7, staffId: 3, serviceId: 4, appointmentDate: today, startTime: "13:00", endTime: "13:20", status: "confirmed" },
  { customerId: 8, staffId: 4, serviceId: 8, appointmentDate: today, startTime: "13:00", endTime: "13:30", status: "confirmed" },
  { customerId: 9, staffId: 3, serviceId: 1, appointmentDate: today, startTime: "14:00", endTime: "14:30", status: "pending" },
  { customerId: 10, staffId: 4, serviceId: 2, appointmentDate: today, startTime: "14:00", endTime: "14:45", status: "pending" },
  { customerId: 11, staffId: 3, serviceId: 5, appointmentDate: today, startTime: "15:00", endTime: "15:45", status: "pending" },
  { customerId: 12, staffId: 4, serviceId: 1, appointmentDate: today, startTime: "15:00", endTime: "15:30", status: "pending" },
];
await db.insert(schema.appointments).values(appointmentsData);

// Insert some orders
console.log("Creating sample orders...");
const order1 = await db.insert(schema.orders).values({
  orderNumber: "ORD-20260124-001",
  customerId: 1,
  staffId: 3,
  subtotal: "350.00",
  taxAmount: "87.50",
  discountAmount: "0.00",
  tipAmount: "50.00",
  total: "487.50",
  status: "completed",
});

await db.insert(schema.orderItems).values({
  orderId: Number(order1[0].insertId),
  itemType: "service",
  itemId: 1,
  itemName: "Herreklipp",
  quantity: 1,
  unitPrice: "350.00",
  taxRate: "25.00",
  total: "350.00",
});

await db.insert(schema.payments).values({
  orderId: Number(order1[0].insertId),
  customerId: 1,
  amount: "487.50",
  method: "vipps",
  status: "captured",
  provider: "vipps",
});

console.log("✅ Database seeded successfully!");
console.log("\n📊 Summary:");
console.log("- 5 staff members");
console.log("- 10 services");
console.log("- 10 products");
console.log("- 20 customers");
console.log("- 12 appointments for today");
console.log("- 1 sample order");
console.log("\n🔑 Staff PINs:");
console.log("- Owner (Khalid): 123456");
console.log("- Manager (Sara): 234567");
console.log("- Barber (Mohammed): 345678");
console.log("- Barber (Lars): 456789");
console.log("- Cashier (Nina): 567890");

await connection.end();
