import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function createTables() {
  console.log('Creating database tables...');
  
  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        discord_id VARCHAR NOT NULL UNIQUE,
        username TEXT NOT NULL,
        discriminator TEXT,
        avatar TEXT,
        email TEXT,
        access_token TEXT,
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created users table');

    // Create servers table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS servers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        discord_server_id VARCHAR NOT NULL UNIQUE,
        name TEXT NOT NULL,
        icon TEXT,
        owner_id VARCHAR NOT NULL REFERENCES users(id),
        settings JSON DEFAULT '{}'::json,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created servers table');

    // Create bot_registrations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bot_registrations (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        bot_id VARCHAR NOT NULL UNIQUE,
        bot_name TEXT NOT NULL,
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        owner_user_id VARCHAR NOT NULL REFERENCES users(id),
        webhook_url TEXT,
        secret_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created bot_registrations table');

    // Create api_keys table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS api_keys (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        name TEXT NOT NULL,
        key_hash TEXT NOT NULL UNIQUE,
        key_preview TEXT NOT NULL,
        scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        last_used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created api_keys table');

    // Create bans table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bans (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        roblox_user_id VARCHAR NOT NULL,
        roblox_username TEXT NOT NULL,
        discord_user_id VARCHAR,
        reason TEXT NOT NULL,
        banned_by VARCHAR NOT NULL REFERENCES users(id),
        expires_at TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT true,
        metadata JSON,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created bans table');

    // Create appeals table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS appeals (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        ban_id VARCHAR NOT NULL REFERENCES bans(id),
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        discord_user_id VARCHAR,
        appeal_text TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_by VARCHAR REFERENCES users(id),
        review_note TEXT,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created appeals table');

    // Create tickets table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        discord_user_id VARCHAR NOT NULL,
        discord_username TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        status TEXT NOT NULL DEFAULT 'open',
        priority TEXT NOT NULL DEFAULT 'medium',
        assigned_to VARCHAR REFERENCES users(id),
        closed_by VARCHAR REFERENCES users(id),
        closed_at TIMESTAMP,
        metadata JSON,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created tickets table');

    console.log('\n✅ All tables created successfully!');
  } catch (error: any) {
    console.error('✗ Error creating tables:', error.message);
    process.exit(1);
  }
}

createTables();
