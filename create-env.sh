#!/bin/bash
cat > .env << ENVFILE
# Discord OAuth Configuration
DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
REDIRECT_URI=http://localhost:5000/api/auth/callback/discord

# Database Configuration
DATABASE_URL=${DATABASE_URL}

# Session Secret
SESSION_SECRET=${SESSION_SECRET}

# Encryption Key (exactly 32 characters)
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# API Keys
BLOXLINK_API_KEY=${BLOXLINK_API_KEY:-}

# Client-side Environment Variables (must be prefixed with VITE_)
VITE_DISCORD_CLIENT_ID=${VITE_DISCORD_CLIENT_ID}
ENVFILE

echo ".env file created successfully!"
