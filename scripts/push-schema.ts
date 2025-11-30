import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function pushSchema() {
  console.log('Checking database connection...');
  
  try {
    // Test connection
    await db.execute(sql`SELECT 1 as test`);
    console.log('✓ Database connection successful');
    
    // Check existing tables
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`Found ${tables.rows.length} existing tables`);
    
    if (tables.rows.length > 0) {
      console.log('Tables:', tables.rows.map((r: any) => r.table_name).join(', '));
      console.log('✓ Database already initialized');
    } else {
      console.log('No tables found. Schema will be created on first app run.');
    }
    
    console.log('\nDatabase is ready!');
  } catch (error: any) {
    console.error('✗ Database error:', error.message);
    process.exit(1);
  }
}

pushSchema();
