import { drizzle } from "drizzle-orm/mysql2";
import { services } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);
const allServices = await db.select().from(services).limit(5);

console.log("Services from database:");
allServices.forEach(s => {
  console.log(`- ${s.name}: price="${s.price}" (type: ${typeof s.price})`);
});

process.exit(0);
