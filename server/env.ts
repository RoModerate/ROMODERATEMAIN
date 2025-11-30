import { config } from "dotenv";
import { resolve } from "path";

// Database keys that should come from Replit Secrets
const databaseKeys = ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'];

// Store database-related Replit Secrets BEFORE loading .env
const replitDbSecrets: Record<string, string> = {};

console.log('[ENV] Checking for Replit database secrets...');
databaseKeys.forEach(key => {
  const value = process.env[key];
  if (value !== undefined && value !== '') {
    replitDbSecrets[key] = value;
  }
});

// Check if we have all the PG* secrets to construct a DATABASE_URL
const hasPgSecrets = ['PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'].every(
  key => replitDbSecrets[key]
);

if (hasPgSecrets) {
  console.log('[ENV] Found complete Replit PostgreSQL secrets, constructing DATABASE_URL');
}

// Load .env file to get non-database config values
const result = config({ 
  path: resolve(process.cwd(), '.env'),
  override: true 
});

if (result.error) {
  console.warn('[ENV] Could not load .env file:', result.error.message);
} else {
  console.log('[ENV] Loaded .env file successfully');
}

// AFTER loading .env, restore Replit database secrets (they take precedence over .env)
Object.entries(replitDbSecrets).forEach(([key, value]) => {
  process.env[key] = value;
});

// If we have all PG* secrets, construct and use Replit's DATABASE_URL
if (hasPgSecrets) {
  const pgPort = replitDbSecrets['PGPORT'] || '5432';
  process.env.DATABASE_URL = `postgresql://${replitDbSecrets['PGUSER']}:${replitDbSecrets['PGPASSWORD']}@${replitDbSecrets['PGHOST']}:${pgPort}/${replitDbSecrets['PGDATABASE']}`;
  console.log('[ENV] Using Replit PostgreSQL database');
}

console.log(`[ENV] Database URL configured: ${process.env.DATABASE_URL ? 'yes' : 'no'}`);
if (process.env.DATABASE_URL) {
  const isNeon = process.env.DATABASE_URL.includes('neon.tech');
  const isReplit = process.env.DATABASE_URL.includes('replit') || 
                   process.env.DATABASE_URL.includes('neon.tech') === false;
  console.log(`[ENV] Database: ${isNeon ? 'Neon (external)' : 'Replit PostgreSQL'}`);
}

// Verify critical environment variables
const criticalVars = ['DISCORD_BOT_TOKEN', 'DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET'];
const missing = criticalVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('[ENV] ⚠️  Missing critical environment variables:', missing.join(', '));
}

export {};
