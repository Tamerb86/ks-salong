import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [columns] = await connection.query("SHOW COLUMNS FROM salonSettings");
console.log("Columns in salonSettings:");
columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
await connection.end();
