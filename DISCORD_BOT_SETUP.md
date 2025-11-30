# Discord Bot Setup Instructions for RoModerate

## Prerequisites

You need to have a Discord bot application created in the Discord Developer Portal. If you haven't created one yet, follow these steps:

## Step 1: Enable Required Intents

The RoModerate bot requires specific privileged intents to function properly. These must be enabled in the Discord Developer Portal:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (Bot Client ID: from your `.env` file)
3. Navigate to the **"Bot"** tab in the left sidebar
4. Scroll down to **"Privileged Gateway Intents"** section
5. Enable the following intents:
   - ✅ **Presence Intent**
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent**
6. Click **"Save Changes"**

## Step 2: Configure Environment Variables

Make sure your `.env` file contains the following:

```env
# RoModerate Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_BOT_CLIENT_ID=your_bot_client_id_here
DISCORD_BOT_CLIENT_SECRET=your_bot_client_secret_here
```

## Step 3: Install the Bot to Your Server

Use the Guild Install OAuth2 URL to add the bot to your Discord server:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268815446&integration_type=0&scope=bot+applications.commands
```

Replace `YOUR_CLIENT_ID` with your bot's client ID from the `.env` file.

### Required Permissions (268815446)

The bot needs these permissions to function:
- View Channels
- Send Messages
- Manage Messages
- Embed Links
- Attach Files
- Read Message History
- Add Reactions
- Manage Roles
- Use Slash Commands

## Step 4: Verify Bot is Online

After enabling the intents and restarting your application, check the console logs for:

```
[Discord Bot] ✓ RoModerate#1234 is now ONLINE
[Discord Bot] ✓ Bot is in X servers
```

If you see this error instead:
```
[Discord Bot] ❌ Failed to start centralized bot: Used disallowed intents
```

This means the intents are not enabled in the Discord Developer Portal. Go back to Step 1 and enable all three required intents.

## Troubleshooting

### Bot Shows as Offline
- Verify `DISCORD_BOT_TOKEN` is correct in `.env`
- Check that all three privileged intents are enabled
- Restart the application after making changes

### "Server not found" Error During Onboarding
- Make sure you've installed the bot to your Discord server using the OAuth2 URL
- Verify the bot has the required permissions
- Check that the bot is online (green status in Discord)

### Channels Not Loading
- Ensure the bot has been installed to the server
- Verify the bot has "View Channels" permission
- Make sure the bot is online and connected

## Support

If you continue to experience issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure the bot token hasn't been regenerated (old tokens become invalid)
4. Make sure you saved changes in the Discord Developer Portal after enabling intents
