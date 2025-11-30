// Script to create database tables directly
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const createTablesSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  discriminator VARCHAR(10),
  avatar VARCHAR(255),
  email VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Servers table
CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_server_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(255),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bot registrations table
CREATE TABLE IF NOT EXISTS bot_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bot_id VARCHAR(255) NOT NULL UNIQUE,
  secret_hash TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  webhook_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash TEXT NOT NULL UNIQUE,
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  scopes JSONB DEFAULT '[]'::jsonb,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bans table
CREATE TABLE IF NOT EXISTS bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  roblox_user_id VARCHAR(255) NOT NULL,
  roblox_username VARCHAR(255),
  discord_user_id VARCHAR(255),
  ban_type VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  evidence JSONB DEFAULT '[]'::jsonb,
  banned_by_id UUID NOT NULL REFERENCES users(id),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(server_id, roblox_user_id)
);

-- Appeals table
CREATE TABLE IF NOT EXISTS appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ban_id UUID NOT NULL REFERENCES bans(id) ON DELETE CASCADE,
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by_id UUID REFERENCES users(id),
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_servers_owner_id ON servers(owner_id);
CREATE INDEX IF NOT EXISTS idx_bans_server_id ON bans(server_id);
CREATE INDEX IF NOT EXISTS idx_bans_roblox_user_id ON bans(roblox_user_id);
CREATE INDEX IF NOT EXISTS idx_appeals_ban_id ON appeals(ban_id);
CREATE INDEX IF NOT EXISTS idx_appeals_server_id ON appeals(server_id);
CREATE INDEX IF NOT EXISTS idx_tickets_server_id ON tickets(server_id);
CREATE INDEX IF NOT EXISTS idx_bot_registrations_server_id ON bot_registrations(server_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_server_id ON api_keys(server_id);
`;

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    console.log('Creating database tables...');
    await pool.query(createTablesSQL);
    console.log('✓ Database tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
