import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function createRemainingTables() {
  console.log('Creating remaining database tables...');
  
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS server_members (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        role TEXT NOT NULL DEFAULT 'moderator',
        permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        invited_by VARCHAR REFERENCES users(id),
        joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(server_id, user_id)
      )
    `);
    console.log('✓ Created server_members table');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT NOT NULL UNIQUE,
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        created_by VARCHAR NOT NULL REFERENCES users(id),
        role TEXT NOT NULL DEFAULT 'moderator',
        permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        max_uses INTEGER,
        current_uses INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created invite_codes table');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS player_risk_scores (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        roblox_user_id VARCHAR NOT NULL,
        roblox_username TEXT NOT NULL,
        risk_score INTEGER NOT NULL DEFAULT 0,
        report_count INTEGER NOT NULL DEFAULT 0,
        ban_count INTEGER NOT NULL DEFAULT 0,
        metadata JSON,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(server_id, roblox_user_id)
      )
    `);
    console.log('✓ Created player_risk_scores table');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS moderator_notes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        roblox_user_id VARCHAR NOT NULL,
        author_id VARCHAR NOT NULL REFERENCES users(id),
        note TEXT NOT NULL,
        is_important BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created moderator_notes table');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS auto_actions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        name TEXT NOT NULL,
        trigger TEXT NOT NULL,
        conditions JSON NOT NULL,
        action TEXT NOT NULL,
        action_params JSON,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created auto_actions table');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS evidence_files (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        ban_id VARCHAR REFERENCES bans(id),
        uploaded_by VARCHAR NOT NULL REFERENCES users(id),
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created evidence_files table');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS discord_bots (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        bot_token_encrypted TEXT NOT NULL,
        bot_id VARCHAR NOT NULL UNIQUE,
        bot_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'inactive',
        features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        last_online TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created discord_bots table');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS roblox_api_keys (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        server_id VARCHAR NOT NULL REFERENCES servers(id),
        name TEXT NOT NULL,
        api_key_encrypted TEXT NOT NULL,
        universe_id VARCHAR,
        scopes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
        last_used_at TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✓ Created roblox_api_keys table');

    console.log('\n✅ All remaining tables created successfully!');
  } catch (error: any) {
    console.error('✗ Error creating tables:', error.message);
    process.exit(1);
  }
}

createRemainingTables();
