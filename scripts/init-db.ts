import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from '../shared/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function initDatabase() {
  console.log('Initializing database...');
  
  try {
    // Create tables from schema
    console.log('Creating tables...');
    
    // Check if tables exist
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Existing tables:', result.map(r => r.table_name));
    
    if (result.length === 0) {
      console.log('No tables found, creating schema...');
      // Use drizzle-kit push command instead
      console.log('Please run: npm run db:push');
    } else {
      console.log('Database already initialized with', result.length, 'tables');
    }
    
    console.log('Database check complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
