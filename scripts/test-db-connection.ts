import "../server/env.js";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";
import { sql } from 'drizzle-orm';

neonConfig.webSocketConstructor = ws;

async function testConnection() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("DATABASE_URL not found");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle({ client: pool, schema });

  try {
    await db.execute(sql`SELECT 1 as test`);
    console.log("✓ Database connection successful!");
    
    // Check if tables exist
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log("\nExisting tables:", result.rows.length);
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error("Database error:", error);
  }

  await pool.end();
}

testConnection();
