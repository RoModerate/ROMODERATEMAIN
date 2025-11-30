import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle({ client: pool });

  console.log('Running migrations...');
  
  await migrate(db, { migrationsFolder: './migrations' });
  
  console.log('Migrations complete!');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
