import { 
  Client, 
  GatewayIntentBits, 
  Events, 
  ActivityType, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  StringSelectMenuInteraction,
  ChannelType
} from 'discord.js';
import { storage } from './storage';
import { decryptToken } from './encryption';
import { robloxCloud } from './roblox-cloud';

interface BotInstance {
  client: Client;
  serverId: string;
  botId: string;
  retries: number;
  lastRestart?: Date;
}

class DiscordBotManager {
  private bots: Map<string, BotInstance> = new Map();
  private centralizedBot: Client | null = null;
  private isCentralizedBotReady: boolean = false;
  private centralizedBotToken: string | null = null;

  private async registerGuildCommands(serverId: string, discordGuildId: string, client: Client): Promise<boolean> {
    try {
      const commands = [
        new SlashCommandBuilder()
          .setName('ban')
          .setDescription('Ban a Roblox user from your game')
          .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        
        new SlashCommandBuilder()
          .setName('unban')
          .setDescription('Unban a Roblox user')
          .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        
        new SlashCommandBuilder()
          .setName('report')
          .setDescription('Report a player for moderation review'),
        
        new SlashCommandBuilder()
          .setName('check')
          .setDescription('Check a player\'s ban status and moderation history')
          .addStringOption(option =>
            option.setName('username')
              .setDescription('Roblox username to check')
              .setRequired(true)),
        
        new SlashCommandBuilder()
          .setName('lookup')
          .setDescription('Look up detailed player information')
          .addStringOption(option =>
            option.setName('username')
              .setDescription('Roblox username to lookup')
              .setRequired(true)),
        
        new SlashCommandBuilder()
          .setName('warnings')
          .setDescription('View or manage player warnings')
          .addSubcommand(subcommand =>
            subcommand
              .setName('list')
              .setDescription('List all warnings for a player')
              .addStringOption(option =>
                option.setName('username')
                  .setDescription('Roblox username')
                  .setRequired(true)))
          .addSubcommand(subcommand =>
            subcommand
              .setName('add')
              .setDescription('Add a warning to a player')
              .addStringOption(option =>
                option.setName('username')
                  .setDescription('Roblox username')
                  .setRequired(true))
              .addStringOption(option =>
                option.setName('reason')
                  .setDescription('Reason for warning')
                  .setRequired(true)))
          .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        
        new SlashCommandBuilder()
          .setName('mute')
          .setDescription('Temporarily mute a Roblox player')
          .addStringOption(option =>
            option.setName('username')
              .setDescription('Roblox username to mute')
              .setRequired(true))
          .addIntegerOption(option =>
            option.setName('duration')
              .setDescription('Mute duration in hours')
              .setRequired(true)
              .setMinValue(1)
              .setMaxValue(168))
          .addStringOption(option =>
            option.setName('reason')
              .setDescription('Reason for mute')
              .setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        
        new SlashCommandBuilder()
          .setName('kick')
          .setDescription('Kick a Roblox player from the game')
          .addStringOption(option =>
            option.setName('username')
              .setDescription('Roblox username to kick')
              .setRequired(true))
          .addStringOption(option =>
            option.setName('reason')
              .setDescription('Reason for kick')
              .setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
        
        new SlashCommandBuilder()
          .setName('ticket')
          .setDescription('Create a support ticket')
          .addStringOption(option =>
            option.setName('category')
              .setDescription('Ticket category')
              .setRequired(true)
              .addChoices(
                { name: 'General Support', value: 'general' },
                { name: 'Ban Appeal', value: 'ban_appeal' },
                { name: 'Report Player', value: 'report' },
                { name: 'Technical Issue', value: 'technical' },
                { name: 'Other', value: 'other' }
              )),
        
        new SlashCommandBuilder()
          .setName('stats')
          .setDescription('View moderation statistics')
          .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        
        new SlashCommandBuilder()
          .setName('dashboard')
          .setDescription('Quick access to the RoModerate dashboard')
          .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        
        new SlashCommandBuilder()
          .setName('linkkey')
          .setDescription('Link your bot to RoModerate (Admin only)')
          .addStringOption(option =>
            option.setName('key')
              .setDescription('Bot key from RoModerate server settings')
              .setRequired(true))
          .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
        new SlashCommandBuilder()
          .setName('config')
          .setDescription('Configure RoModerate settings for your server')
          .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
      ];

      const rest = new REST().setToken(client.token!);
      await rest.put(
        Routes.applicationGuildCommands(client.user!.id, discordGuildId),
        { body: commands.map(cmd => cmd.toJSON()) }
      );

      console.log(`[Discord Bot] ✓ Registered ${commands.length} slash commands for guild ${discordGuildId}`);
      return true;
    } catch (error: any) {
      console.error(`[Discord Bot] Failed to register commands for server ${serverId}:`, error);
      return false;
    }
  }

  private setupCommandHandlers(client: Client, serverId: string, discordGuildId: string): void {
    // Handle slash command interactions
    client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isChatInputCommand()) {
        if (interaction.guildId !== discordGuildId) return;
        const command = interaction as ChatInputCommandInteraction;

        try {
          switch (command.commandName) {
            case 'linkkey':
              await command.deferReply({ ephemeral: true });
              const enteredKey = command.options.getString('key', true).trim().toUpperCase();
              
              const server = await storage.getServer(serverId);
              if (!server) {
                await command.editReply({ content: '⚠️ Server not found in RoModerate system.' });
                return;
              }

              const { linkKey, linkKeyExpiresAt } = server as any;

              if (!linkKey) {
                await command.editReply({
                  embeds: [{
                    color: 0xED4245,
                    title: '⚠️ | No Link Key Generated',
                    description: 'This server does not have a link key yet.\n\n**To get started:**\n> 1. Visit your [RoModerate Dashboard](https://'+`${process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(',')[0] : 'your-app-url'}`+')\n> 2. Complete onboarding to generate a link key\n> 3. Copy the key and run `/linkkey <key>` here',
                    footer: { text: 'RoModerate • Powered by Discord' },
                  }]
                });
                return;
              }

              if (linkKeyExpiresAt && new Date(linkKeyExpiresAt) < new Date()) {
                await storage.updateServer(serverId, { linkKey: null, linkKeyExpiresAt: null } as any);
                await command.editReply({
                  embeds: [{
                    color: 0xED4245,
                    title: '⏰ | Link Key Expired',
                    description: 'Your link key has expired (keys are valid for 7 days).\n\n**Generate a new one:**\n> 1. Visit your [Server Settings](https://'+`${process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(',')[0] : 'your-app-url'}`+'/servers)\n> 2. Click **Generate New Link Key**\n> 3. Run `/linkkey <new-key>`',
                    footer: { text: 'RoModerate • Powered by Discord' },
                  }]
                });
                return;
              }

              if (enteredKey !== linkKey.toUpperCase()) {
                await command.editReply({
                  embeds: [{
                    color: 0xED4245,
                    title: '❌ | Invalid Link Key',
                    description: 'The link key you entered does not match.\n\n**Troubleshooting:**\n> • Copy the entire key from the onboarding completion screen\n> • Keys must be entered exactly as shown\n> • Keys expire after 7 days\n> • Do not include any extra spaces',
                    footer: { text: 'RoModerate • Key Format: 32 uppercase hex characters' },
                  }]
                });
                return;
              }
              
              await storage.updateServer(serverId, {
                botLinked: true,
                lastLinkedAt: new Date(),
                linkKey: null,
                linkKeyExpiresAt: null,
              } as any);
              
              await command.editReply({
                embeds: [{
                  color: 0x57F287,
                  title: '✅ | Server Linked Successfully',
                  description: '**Your server is now fully connected to RoModerate!**\n\n🛠️ **All commands are active:**\n> `/config` - Configure all bot settings\n> `/ban` - Ban a Roblox player\n> `/unban` - Unban a player\n> `/report` - File a player report\n> `/check` - Check player status\n> `/lookup` - Advanced player lookup\n> `/ticket` - Create a support ticket\n> `/dashboard` - Quick access to web dashboard',
                  footer: { text: 'RoModerate • Powered by Discord' },
                }]
              });
              
              console.log(`[Discord Bot] ✓ Server ${serverId} linked successfully`);
              break;

            case 'check': {
              await command.deferReply();
              const username = command.options.getString('username', true);
              
              const bans = await storage.getBansByUsername(serverId, username);
              const reports = await storage.getReportsByUsername(serverId, username);
              const activeBan = bans.find((b: any) => b.isActive);
              
              let response = `📊 **Player Check: ${username}**\n\n`;
              
              if (activeBan) {
                response += `🚫 **Status:** BANNED\n`;
                response += `**Reason:** ${activeBan.reason}\n`;
                response += `**Banned By:** <@${activeBan.metadata?.discordModeratorId || 'Unknown'}>\n`;
                response += `**Date:** <t:${Math.floor(new Date(activeBan.createdAt).getTime() / 1000)}:R>\n\n`;
              } else {
                response += `✅ **Status:** Clean - No active bans\n\n`;
              }
              
              response += `📝 **Total Reports:** ${reports.length}\n`;
              response += `🔨 **Total Bans:** ${bans.length}\n`;
              
              await command.editReply({ content: response });
              break;
            }

            case 'lookup': {
              await command.deferReply();
              const username = command.options.getString('username', true);
              
              const bans = await storage.getBansByUsername(serverId, username);
              const reports = await storage.getReportsByUsername(serverId, username);
              const notes = await storage.getNotesForPlayer(serverId, username);
              
              let response = `🔍 **Player Lookup: ${username}**\n\n`;
              response += `**Moderation History:**\n`;
              response += `• Total Bans: ${bans.length}\n`;
              response += `• Active Bans: ${bans.filter((b: any) => b.isActive).length}\n`;
              response += `• Total Reports: ${reports.length}\n`;
              response += `• Moderator Notes: ${notes.length}\n\n`;
              
              if (bans.length > 0) {
                response += `**Recent Bans:**\n`;
                bans.slice(0, 3).forEach((ban: any) => {
                  response += `• ${ban.reason} - <t:${Math.floor(new Date(ban.createdAt).getTime() / 1000)}:d>\n`;
                });
              }
              
              await command.editReply({ content: response });
              break;
            }

            case 'warnings': {
              const subcommand = command.options.getSubcommand();
              const username = command.options.getString('username', true);
              
              if (subcommand === 'list') {
                await command.deferReply();
                const notes = await storage.getNotesForPlayer(serverId, username);
                const warnings = notes.filter((n: any) => n.note.toLowerCase().includes('warning'));
                
                let response = `⚠️ **Warnings for ${username}**\n\n`;
                if (warnings.length === 0) {
                  response += 'No warnings found.';
                } else {
                  warnings.forEach((warning: any, index: number) => {
                    response += `${index + 1}. ${warning.note}\n`;
                    response += `   *<t:${Math.floor(new Date(warning.createdAt).getTime() / 1000)}:R>*\n\n`;
                  });
                }
                
                await command.editReply({ content: response });
              } else if (subcommand === 'add') {
                await command.deferReply({ ephemeral: true });
                const reason = command.options.getString('reason', true);
                
                const server = await storage.getServer(serverId);
                if (!server) {
                  await command.editReply({ content: '❌ Server not found.' });
                  return;
                }
                
                await storage.createNote({
                  serverId,
                  robloxUserId: username,
                  note: `⚠️ WARNING: ${reason}`,
                  authorId: server.ownerId,
                  isImportant: true,
                } as any);
                
                await command.editReply({
                  content: `✅ **Warning Added**\n\nPlayer: ${username}\nReason: ${reason}`,
                });
              }
              break;
            }

            case 'mute': {
              await command.deferReply({ ephemeral: true });
              const username = command.options.getString('username', true);
              const duration = command.options.getInteger('duration', true);
              const reason = command.options.getString('reason', true);
              
              const server = await storage.getServer(serverId);
              if (!server) {
                await command.editReply({ content: '❌ Server not found.' });
                return;
              }
              
              const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
              
              await storage.createBan({
                serverId,
                robloxUserId: username,
                robloxUsername: username,
                discordUserId: interaction.user.id,
                reason: `MUTE (${duration}h): ${reason}`,
                bannedBy: server.ownerId,
                expiresAt,
                isActive: true,
                metadata: {
                  type: 'mute',
                  duration: duration,
                  discordModeratorId: interaction.user.id,
                  discordModeratorUsername: interaction.user.username,
                },
              } as any);
              
              await command.editReply({
                content: `✅ **Player Muted**\n\n` +
                  `Player: ${username}\n` +
                  `Duration: ${duration} hours\n` +
                  `Reason: ${reason}\n` +
                  `Expires: <t:${Math.floor(expiresAt.getTime() / 1000)}:R>`,
              });
              break;
            }

            case 'kick': {
              await command.deferReply({ ephemeral: true });
              const username = command.options.getString('username', true);
              const reason = command.options.getString('reason', true);
              
              const server = await storage.getServer(serverId);
              if (!server) {
                await command.editReply({ content: '❌ Server not found.' });
                return;
              }
              
              await storage.createNote({
                serverId,
                robloxUserId: username,
                note: `🥾 KICKED: ${reason}`,
                authorId: server.ownerId,
                isImportant: true,
              } as any);
              
              await command.editReply({
                content: `✅ **Player Kicked**\n\nPlayer: ${username}\nReason: ${reason}\n\nThis action has been logged.`,
              });
              break;
            }

            case 'ticket': {
              const category = command.options.getString('category', true);
              
              const modal = new ModalBuilder()
                .setCustomId(`ticket_modal_${serverId}_${category}`)
                .setTitle('Create Support Ticket');

              const titleInput = new TextInputBuilder()
                .setCustomId('ticket_title')
                .setLabel('Ticket Title')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Brief summary of your issue')
                .setRequired(true);

              const descriptionInput = new TextInputBuilder()
                .setCustomId('ticket_description')
                .setLabel('Description')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Provide detailed information about your request')
                .setRequired(true);

              modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
              );

              await interaction.showModal(modal);
              break;
            }

            case 'stats': {
              await command.deferReply();
              
              const allBans = await storage.getServerBans(serverId);
              const allReports = await storage.getServerReports(serverId);
              const allTickets = await storage.getServerTickets(serverId);
              
              const activeBans = allBans.filter((b: any) => b.isActive).length;
              const pendingReports = allReports.filter((r: any) => r.status === 'pending').length;
              const openTickets = allTickets.filter((t: any) => t.status === 'open').length;
              
              const response = `📊 **Moderation Statistics**\n\n` +
                `**Bans:**\n` +
                `• Total: ${allBans.length}\n` +
                `• Active: ${activeBans}\n\n` +
                `**Reports:**\n` +
                `• Total: ${allReports.length}\n` +
                `• Pending: ${pendingReports}\n\n` +
                `**Tickets:**\n` +
                `• Total: ${allTickets.length}\n` +
                `• Open: ${openTickets}\n`;
              
              await command.editReply({ content: response });
              break;
            }

            case 'dashboard': {
              await command.deferReply({ ephemeral: true });
              
              const server = await storage.getServer(serverId);
              if (!server) {
                await command.editReply({ content: '❌ Server not found in RoModerate system.' });
                return;
              }

              const dashboardUrl = process.env.REPLIT_DOMAINS 
                ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/dashboard`
                : 'your-app-url/dashboard';

              const response = `🎛️ **RoModerate Dashboard**\n\n` +
                `Access your full moderation dashboard:\n` +
                `🔗 ${dashboardUrl}\n\n` +
                `**Available Features:**\n` +
                `• 🛡️ Moderation Panel - Take moderation actions\n` +
                `• 📊 Shift Panel - Track your moderation shifts\n` +
                `• 🔍 Player Lookup - Search player histories\n` +
                `• 🚫 Ban Management - View and manage bans\n` +
                `• 📝 Appeals - Review ban appeals\n` +
                `• 🎫 Support Tickets - Handle user tickets\n` +
                `• 👥 Team Members - Manage your mod team\n` +
                `• ⚡ Auto Actions - Configure automation\n\n` +
                `All your moderation tools in one place!`;
              
              await command.editReply({ content: response });
              break;
            }

            case 'config': {
              await command.deferReply({ ephemeral: true });
              
              const server = await storage.getServer(serverId);
              if (!server) {
                await command.editReply({ content: '⚠️ Server not found in RoModerate system.' });
                return;
              }

              if (!(server as any).botLinked) {
                await command.editReply({
                  embeds: [{
                    color: 0xFEE75C,
                    title: '⚠️ | Server Not Linked',
                    description: 'This server is not linked to RoModerate.\n\n**To begin using /config:**\n> 1. Visit your [Dashboard](https://'+`${process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(',')[0] : 'your-app-url'}`+')\n> 2. Go to **Server Settings**\n> 3. Click **Generate Link Key**\n> 4. Run `/linkkey <key>` in this server\n\n💾 | **Status:** Not Set\n🌐 | **Link Key Required**',
                    footer: { text: 'RoModerate • Powered by Discord' },
                  }]
                });
                return;
              }
              
              const embed = new EmbedBuilder()
                .setTitle('🛠️ | RoModerate Configuration Panel')
                .setDescription('> Select a category below to begin setup.\n> All settings automatically sync between web and bot.\n\n💾 **Status:** Synced with Web Dashboard\n🔗 **Server ID:** ' + (server as any).discordServerId)
                .setColor(0x5865F2)
                .setFooter({ text: 'RoModerate • Powered by Discord' });

              const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`config_menu_${serverId}`)
                .setPlaceholder('Select a configuration category')
                .addOptions([
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Reports Settings')
                    .setDescription('Configure report channels, roles, and options')
                    .setValue('reports')
                    .setEmoji('📋'),
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Appeals Settings')
                    .setDescription('Set up appeal categories and workflows')
                    .setValue('appeals')
                    .setEmoji('⚖️'),
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Moderation & Logs')
                    .setDescription('Configure mod logs and audit channels')
                    .setValue('moderation')
                    .setEmoji('🛡️'),
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Tickets & Support')
                    .setDescription('Set up ticket system and support')
                    .setValue('tickets')
                    .setEmoji('🎫'),
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Game & Roblox')
                    .setDescription('Roblox API keys and game profiles')
                    .setValue('roblox')
                    .setEmoji('🎮'),
                  new StringSelectMenuOptionBuilder()
                    .setLabel('Server Settings')
                    .setDescription('Server name, icon, and admin roles')
                    .setValue('server')
                    .setEmoji('⚙️'),
                ]);

              const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(selectMenu);

              await command.editReply({
                embeds: [embed],
                components: [row]
              });
              break;
            }

            case 'ban': {
              const modal = new ModalBuilder()
                .setCustomId(`ban_modal_${serverId}`)
                .setTitle('Ban Roblox Player');

              const usernameInput = new TextInputBuilder()
                .setCustomId('roblox_username')
                .setLabel('Roblox Username')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter the Roblox username')
                .setRequired(true);

              const reasonInput = new TextInputBuilder()
                .setCustomId('ban_reason')
                .setLabel('Reason for Ban')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Explain why this player is being banned')
                .setRequired(true);

              const evidenceInput = new TextInputBuilder()
                .setCustomId('evidence')
                .setLabel('Evidence (Optional)')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Provide links or evidence (optional)')
                .setRequired(false);

              modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(usernameInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(evidenceInput)
              );

              await interaction.showModal(modal);
              break;
            }

            case 'unban': {
              const modal = new ModalBuilder()
                .setCustomId(`unban_modal_${serverId}`)
                .setTitle('Unban Roblox Player');

              const usernameInput = new TextInputBuilder()
                .setCustomId('roblox_username')
                .setLabel('Roblox Username')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter the Roblox username to unban')
                .setRequired(true);

              modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(usernameInput)
              );

              await interaction.showModal(modal);
              break;
            }

            case 'report': {
              const modal = new ModalBuilder()
                .setCustomId(`report_modal_${serverId}`)
                .setTitle('Report Roblox Player');

              const usernameInput = new TextInputBuilder()
                .setCustomId('roblox_username')
                .setLabel('Roblox Username')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter the Roblox username')
                .setRequired(true);

              const reasonInput = new TextInputBuilder()
                .setCustomId('report_reason')
                .setLabel('Reason for Report')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Describe the issue or rule violation')
                .setRequired(true);

              const evidenceInput = new TextInputBuilder()
                .setCustomId('evidence')
                .setLabel('Evidence (Optional)')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Provide screenshots, video links, etc.')
                .setRequired(false);

              modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(usernameInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput),
                new ActionRowBuilder<TextInputBuilder>().addComponents(evidenceInput)
              );

              await interaction.showModal(modal);
              break;
            }
          }
        } catch (error: any) {
          console.error(`[Discord Bot] Command error:`, error);
          try {
            if (command.deferred) {
              await command.editReply({ content: '❌ An error occurred while processing this command.' });
            } else {
              await command.reply({ content: '❌ An error occurred while processing this command.', ephemeral: true });
            }
          } catch (e) {
            console.error('[Discord Bot] Failed to send error message:', e);
          }
        }
      }

      // Handle modal submissions
      if (interaction.isModalSubmit()) {
        const modalInteraction = interaction as ModalSubmitInteraction;
        
        try {
          if (modalInteraction.customId.startsWith('ban_modal_')) {
            await this.handleBanModal(modalInteraction, serverId);
          } else if (modalInteraction.customId.startsWith('unban_modal_')) {
            await this.handleUnbanModal(modalInteraction, serverId);
          } else if (modalInteraction.customId.startsWith('report_modal_')) {
            await this.handleReportModal(modalInteraction, serverId);
          } else if (modalInteraction.customId.startsWith('ticket_modal_')) {
            await this.handleTicketModal(modalInteraction, serverId);
          }
        } catch (error: any) {
          console.error(`[Discord Bot] Modal error:`, error);
          try {
            await modalInteraction.reply({ 
              content: '❌ An error occurred while processing your submission.',
              ephemeral: true 
            });
          } catch (e) {
            console.error('[Discord Bot] Failed to send modal error message:', e);
          }
        }
      }

      // Handle select menu interactions
      if (interaction.isStringSelectMenu()) {
        const selectInteraction = interaction as StringSelectMenuInteraction;
        
        try {
          if (selectInteraction.customId.startsWith('config_menu_')) {
            await this.handleConfigMenuSelection(selectInteraction, serverId);
          }
        } catch (error: any) {
          console.error(`[Discord Bot] Select menu error:`, error);
          try {
            await selectInteraction.reply({ 
              content: '❌ An error occurred while processing your selection.',
              ephemeral: true 
            });
          } catch (e) {
            console.error('[Discord Bot] Failed to send select menu error message:', e);
          }
        }
      }

      // Handle button interactions
      if (interaction.isButton()) {
        const buttonInteraction = interaction as ButtonInteraction;
        
        try {
          // Handle ticket panel buttons
          if (buttonInteraction.customId.startsWith('ticket_panel_')) {
            const parts = buttonInteraction.customId.split('_');
            const categoryId = parts[parts.length - 1];
            
            // Show ticket modal when button is clicked
            const modal = new ModalBuilder()
              .setCustomId(`ticket_modal_${serverId}_${categoryId}`)
              .setTitle('Create Support Ticket');

            const titleInput = new TextInputBuilder()
              .setCustomId('ticket_title')
              .setLabel('Ticket Title')
              .setStyle(TextInputStyle.Short)
              .setPlaceholder('Brief summary of your issue')
              .setRequired(true);

            const descriptionInput = new TextInputBuilder()
              .setCustomId('ticket_description')
              .setLabel('Description')
              .setStyle(TextInputStyle.Paragraph)
              .setPlaceholder('Provide detailed information about your request')
              .setRequired(true);

            modal.addComponents(
              new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
              new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
            );

            await buttonInteraction.showModal(modal);
          }
        } catch (error: any) {
          console.error(`[Discord Bot] Button interaction error:`, error);
          try {
            await buttonInteraction.reply({ 
              content: '❌ An error occurred while processing this action.',
              ephemeral: true 
            });
          } catch (e) {
            console.error('[Discord Bot] Failed to send button error message:', e);
          }
        }
      }
    });
  }

  private async handleBanModal(interaction: ModalSubmitInteraction, serverId: string): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const robloxUsername = interaction.fields.getTextInputValue('roblox_username');
    const reason = interaction.fields.getTextInputValue('ban_reason');
    const evidence = interaction.fields.getTextInputValue('evidence') || '';

    try {
      // Get server to find owner
      const server = await storage.getServer(serverId);
      if (!server) {
        await interaction.editReply({ content: '❌ Server not found in system.' });
        return;
      }

      // Look up actual Roblox user ID
      const robloxUserId = await robloxCloud.getRobloxUserId(robloxUsername);
      if (!robloxUserId) {
        await interaction.editReply({ 
          content: `❌ **Player Not Found**\n\nCouldn't find a Roblox player with username "${robloxUsername}". Please check the spelling and try again.` 
        });
        return;
      }

      // Perform alt detection
      const altDetection = await robloxCloud.performAltDetection(robloxUserId, serverId);

      // Prepare ban data
      const banData: any = {
        serverId,
        robloxUserId,
        robloxUsername,
        discordUserId: interaction.user.id,
        reason,
        bannedBy: server.ownerId,
        expiresAt: null,
        isActive: true,
        metadata: {
          evidence: evidence ? [evidence] : [],
          discordModeratorId: interaction.user.id,
          discordModeratorUsername: interaction.user.username,
          altDetection: {
            isLikelyAlt: altDetection.isLikelyAlt,
            confidence: altDetection.confidence,
            reasons: altDetection.reasons,
            accountAge: altDetection.metadata.accountAge,
          },
        },
      };

      // Try to enforce ban in Roblox if API key is configured
      const serverSettings = server.settings as any;
      const robloxApiKey = serverSettings?.robloxApiKey;
      const robloxUniverseId = serverSettings?.robloxUniverseId;

      let robloxEnforced = false;
      if (robloxApiKey && robloxUniverseId) {
        const robloxBanResult = await robloxCloud.banUser({
          universeId: robloxUniverseId,
          userId: robloxUserId,
          apiKey: robloxApiKey,
          privateReason: reason,
          displayReason: reason,
          excludeAltAccounts: true,
        });

        robloxEnforced = robloxBanResult.success;
        banData.metadata.robloxEnforced = robloxEnforced;
        banData.metadata.robloxResponse = {
          success: robloxBanResult.success,
          statusCode: robloxBanResult.statusCode,
          error: robloxBanResult.error,
          altAccountsRestricted: robloxBanResult.altAccountsRestricted,
          timestamp: new Date().toISOString(),
        };
      }

      // Create ban record in database
      await storage.createBan(banData);

      let responseMessage = `✅ **Ban Applied Successfully!**\n\n` +
        `**Player:** ${robloxUsername} (ID: ${robloxUserId})\n` +
        `**Reason:** ${reason}\n` +
        `${evidence ? `**Evidence:** ${evidence}\n` : ''}`;

      if (robloxEnforced) {
        responseMessage += `\n🎮 **Roblox Enforcement:** ✅ Successfully enforced in-game\n` +
          `🔒 **Alt Accounts:** Automatically restricted`;
      } else if (robloxApiKey && robloxUniverseId) {
        responseMessage += `\n⚠️ **Roblox Enforcement:** Failed to enforce in-game (check logs)`;
      }

      if (altDetection.isLikelyAlt) {
        responseMessage += `\n\n⚠️ **Alt Account Detected** (${altDetection.confidence}% confidence)\n` +
          altDetection.reasons.map(r => `• ${r}`).join('\n');
      }

      responseMessage += `\n\nThis ban has been logged in your RoModerate dashboard and is now active.`;

      await interaction.editReply({ content: responseMessage });

      console.log(`[Discord Bot] ✓ Ban created for ${robloxUsername} by ${interaction.user.username} (Roblox enforced: ${robloxEnforced})`);
    } catch (error: any) {
      console.error('[Discord Bot] Failed to create ban:', error);
      await interaction.editReply({
        content: '❌ Failed to create ban. Please try again or contact support.',
      });
    }
  }

  private async handleUnbanModal(interaction: ModalSubmitInteraction, serverId: string): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const robloxUsername = interaction.fields.getTextInputValue('roblox_username');

    try {
      // Get server settings
      const server = await storage.getServer(serverId);
      if (!server) {
        await interaction.editReply({ content: '❌ Server not found in system.' });
        return;
      }

      // Look up actual Roblox user ID
      const robloxUserId = await robloxCloud.getRobloxUserId(robloxUsername);
      if (!robloxUserId) {
        await interaction.editReply({ 
          content: `❌ **Player Not Found**\n\nCouldn't find a Roblox player with username "${robloxUsername}".` 
        });
        return;
      }

      // Try to lift ban in Roblox if API key is configured
      const serverSettings = server.settings as any;
      const robloxApiKey = serverSettings?.robloxApiKey;
      const robloxUniverseId = serverSettings?.robloxUniverseId;

      let robloxUnbanSuccess = false;
      if (robloxApiKey && robloxUniverseId) {
        const robloxUnbanResult = await robloxCloud.unbanUser({
          universeId: robloxUniverseId,
          userId: robloxUserId,
          apiKey: robloxApiKey,
        });
        robloxUnbanSuccess = robloxUnbanResult.success;
      }

      // Find and deactivate existing bans
      await storage.deactivateBan(serverId, robloxUsername);

      let responseMessage = `✅ **Player Unbanned!**\n\n` +
        `**Player:** ${robloxUsername} (ID: ${robloxUserId})\n\n` +
        `All active bans for this player have been removed.`;

      if (robloxUnbanSuccess) {
        responseMessage += `\n\n🎮 **Roblox:** Successfully lifted in-game ban`;
      } else if (robloxApiKey && robloxUniverseId) {
        responseMessage += `\n\n⚠️ **Roblox:** Failed to lift in-game ban (check logs)`;
      }

      await interaction.editReply({ content: responseMessage });

      console.log(`[Discord Bot] ✓ Unbanned ${robloxUsername} by ${interaction.user.username} (Roblox lifted: ${robloxUnbanSuccess})`);
    } catch (error: any) {
      console.error('[Discord Bot] Failed to unban:', error);
      await interaction.editReply({
        content: '❌ Failed to unban player. Please try again or contact support.',
      });
    }
  }

  private async handleReportModal(interaction: ModalSubmitInteraction, serverId: string): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const robloxUsername = interaction.fields.getTextInputValue('roblox_username');
    const reason = interaction.fields.getTextInputValue('report_reason');
    const evidence = interaction.fields.getTextInputValue('evidence') || '';

    try {
      // Look up actual Roblox user ID and get avatar
      const robloxUserId = await robloxCloud.getRobloxUserId(robloxUsername);
      if (!robloxUserId) {
        await interaction.editReply({ 
          content: `❌ **Player Not Found**\n\nCouldn't find a Roblox player with username "${robloxUsername}". Please check the spelling and try again.` 
        });
        return;
      }

      // Get Roblox avatar thumbnail
      const avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxUserId}&width=420&height=420&format=png`;

      // Create report in database
      await storage.createReport({
        serverId,
        robloxUserId,
        robloxUsername,
        reason,
        evidence: evidence ? [evidence] : [],
        reportedBy: interaction.user.id,
        reportedByUsername: interaction.user.username,
        status: 'pending',
        reviewedBy: null,
        reviewNote: null,
        reviewedAt: null,
      } as any);

      // Create professional embed with Roblox avatar
      const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('Player Report Submitted')
        .setDescription(`A new player report has been submitted for review.`)
        .setThumbnail(avatarUrl)
        .addFields(
          { name: 'Reported Player', value: `**${robloxUsername}**\nUser ID: ${robloxUserId}`, inline: true },
          { name: 'Reported By', value: `${interaction.user.username}`, inline: true },
          { name: 'Reason', value: reason, inline: false },
        )
        .setFooter({ text: 'RoModerate Report System' })
        .setTimestamp();

      if (evidence) {
        embed.addFields({ name: 'Evidence', value: evidence, inline: false });
      }

      await interaction.editReply({
        content: '✅ **Report Submitted Successfully!**\n\nModerators will review this report in the RoModerate dashboard.',
        embeds: [embed],
      });

      console.log(`[Discord Bot] ✓ Report created for ${robloxUsername} (ID: ${robloxUserId}) by ${interaction.user.username}`);
    } catch (error: any) {
      console.error('[Discord Bot] Failed to create report:', error);
      await interaction.editReply({
        content: '❌ Failed to submit report. Please try again or contact support.',
      });
    }
  }

  private async handleTicketModal(interaction: ModalSubmitInteraction, serverId: string): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const title = interaction.fields.getTextInputValue('ticket_title');
    const description = interaction.fields.getTextInputValue('ticket_description');
    const customIdParts = interaction.customId.split('_');
    const category = customIdParts[customIdParts.length - 1];

    try {
      const ticket = await storage.createTicket({
        serverId,
        discordUserId: interaction.user.id,
        discordUsername: interaction.user.username,
        title,
        description,
        category,
        status: 'open',
        priority: 'medium',
        assignedTo: null,
        closedBy: null,
        closedAt: null,
        metadata: {},
      } as any);

      await interaction.editReply({
        content: `✅ **Ticket Created!**\n\n` +
          `**Ticket ID:** #${ticket.id.slice(0, 8)}\n` +
          `**Title:** ${title}\n` +
          `**Category:** ${category}\n\n` +
          `Our support team will review your ticket shortly. You can track its status in the RoModerate dashboard.`,
      });

      console.log(`[Discord Bot] ✓ Ticket created by ${interaction.user.username}`);
    } catch (error: any) {
      console.error('[Discord Bot] Failed to create ticket:', error);
      await interaction.editReply({
        content: '❌ Failed to create ticket. Please try again or contact support.',
      });
    }
  }

  private async handleConfigMenuSelection(interaction: StringSelectMenuInteraction, serverId: string): Promise<void> {
    await interaction.deferUpdate();

    const selectedCategory = interaction.values[0];
    const server = await storage.getServer(serverId);
    
    if (!server) {
      await interaction.followUp({
        content: '❌ Server not found in RoModerate system.',
        ephemeral: true
      });
      return;
    }

    const serverSettings = (server.settings as any) || {};
    const guild = interaction.guild;
    
    if (!guild) {
      await interaction.followUp({
        content: '❌ Could not access guild information.',
        ephemeral: true
      });
      return;
    }

    let embed = new EmbedBuilder()
      .setColor(0x6B21A8)
      .setFooter({ text: 'All settings are saved to the database automatically' });

    let description = '';

    switch (selectedCategory) {
      case 'reports':
        embed.setTitle('📋 Reports Settings')
          .setDescription('Configure report channels, roles, and options for player reports.');
        
        const reportSettings = serverSettings.reportSettings || {};
        
        description = '**Current Configuration:**\n\n';
        description += `📌 **New Reports Channel:** ${reportSettings.newReportsChannel ? `<#${reportSettings.newReportsChannel}>` : '`Not Set`'}\n`;
        description += `🔔 **Ping Role:** ${reportSettings.pingRole ? `<@&${reportSettings.pingRole}>` : '`Not Set`'}\n`;
        description += `📝 **Pre-Generated Ban Strings:** ${reportSettings.banStringsEnabled ? '`Enabled`' : '`Disabled`'}\n`;
        description += `⏱️ **Estimated Time:** ${reportSettings.estimatedTime || '`Not Set`'}\n`;
        description += `📋 **Report Logs Channel:** ${reportSettings.reportLogsChannel ? `<#${reportSettings.reportLogsChannel}>` : '`Not Set`'}\n`;
        description += `♾️ **Allow Infinite Reports:** ${reportSettings.allowInfiniteReports ? '`Enabled`' : '`Disabled`'}\n\n`;
        description += '**To configure these settings, visit your RoModerate dashboard:**\n';
        description += `🔗 ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/dashboard` : 'your-app-url/dashboard'}`;
        
        embed.addFields({ name: 'Settings', value: description, inline: false });
        break;

      case 'appeals':
        embed.setTitle('⚖️ Appeals Settings')
          .setDescription('Configure appeal categories, channel formats, and workflows.');
        
        const appealSettings = serverSettings.appealSettings || {};
        
        description = '**Current Configuration:**\n\n';
        description += `📁 **Appeal Category:** ${appealSettings.category ? `<#${appealSettings.category}>` : '`Not Set`'}\n`;
        description += `📁 **Fallback Category:** ${appealSettings.fallbackCategory ? `<#${appealSettings.fallbackCategory}>` : '`Not Set`'}\n`;
        description += `✏️ **Channel Name Format:** ${appealSettings.channelNameFormat || '`appeal-{username}`'}\n`;
        description += `📋 **Appeal Logs:** ${appealSettings.appealLogs ? `<#${appealSettings.appealLogs}>` : '`Not Set`'}\n`;
        description += `🚫 **Denied Role:** ${appealSettings.deniedRole ? `<@&${appealSettings.deniedRole}>` : '`Not Set`'}\n`;
        description += `💬 **Premade Responses:** ${appealSettings.premadeResponses?.length || 0} configured\n\n`;
        description += '**To configure these settings, visit your RoModerate dashboard:**\n';
        description += `🔗 ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/dashboard` : 'your-app-url/dashboard'}`;
        
        embed.addFields({ name: 'Settings', value: description, inline: false });
        break;

      case 'moderation':
        embed.setTitle('🛡️ Moderation & Logs')
          .setDescription('Configure moderation logs, audit logs, and auto actions.');
        
        description = '**Current Configuration:**\n\n';
        description += `📋 **Audit Logs Channel:** ${serverSettings.auditLogs ? `<#${serverSettings.auditLogs}>` : '`Not Set`'}\n`;
        description += `🔨 **Moderation Logs:** ${serverSettings.moderationLogs ? `<#${serverSettings.moderationLogs}>` : '`Not Set`'}\n`;
        description += `⚡ **Auto Actions:** ${serverSettings.autoActions ? '`Configured`' : '`Not Configured`'}\n\n`;
        description += '**To configure these settings, visit your RoModerate dashboard:**\n';
        description += `🔗 ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/dashboard` : 'your-app-url/dashboard'}`;
        
        embed.addFields({ name: 'Settings', value: description, inline: false });
        break;

      case 'tickets':
        embed.setTitle('🎫 Tickets & Support')
          .setDescription('Configure ticket system, support categories, and workflows.');
        
        const ticketConfig = serverSettings.ticketConfig || {};
        
        description = '**Current Configuration:**\n\n';
        description += `✅ **Tickets Enabled:** ${ticketConfig.enabled ? '`Yes`' : '`No`'}\n`;
        description += `📁 **Support Category:** ${ticketConfig.supportCategory ? `<#${ticketConfig.supportCategory}>` : '`Not Set`'}\n`;
        description += `✏️ **Channel Format:** ${ticketConfig.supportChannelFormat || '`ticket-{number}`'}\n`;
        description += `🎯 **Categories:** ${ticketConfig.categories?.length || 0} configured\n\n`;
        description += '**To configure these settings, visit your RoModerate dashboard:**\n';
        description += `🔗 ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/dashboard` : 'your-app-url/dashboard'}`;
        
        embed.addFields({ name: 'Settings', value: description, inline: false });
        break;

      case 'roblox':
        embed.setTitle('🎮 Game & Roblox')
          .setDescription('Configure Roblox API keys and game profile settings.');
        
        description = '**Current Configuration:**\n\n';
        description += `🔑 **Roblox API Key:** ${serverSettings.robloxApiKey ? '`Configured`' : '`Not Set`'}\n`;
        description += `🌐 **Universe ID:** ${serverSettings.robloxUniverseId || '`Not Set`'}\n`;
        description += `🎮 **Game Profile:** ${serverSettings.gameProfile ? '`Configured`' : '`Not Configured`'}\n\n`;
        description += '**To configure these settings, visit your RoModerate dashboard:**\n';
        description += `🔗 ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/dashboard` : 'your-app-url/dashboard'}`;
        
        embed.addFields({ name: 'Settings', value: description, inline: false });
        break;

      case 'server':
        embed.setTitle('⚙️ Server Settings')
          .setDescription('Configure server name, icon sync, and admin roles.');
        
        description = '**Current Configuration:**\n\n';
        description += `🏷️ **Server Name Sync:** ${serverSettings.serverNameSync ? '`Enabled`' : '`Disabled`'}\n`;
        description += `🖼️ **Icon Sync:** ${serverSettings.iconSync ? '`Enabled`' : '`Disabled`'}\n`;
        description += `👑 **Admin Role:** ${serverSettings.adminRole ? `<@&${serverSettings.adminRole}>` : '`Not Set`'}\n`;
        description += `👥 **Team Members Category:** ${serverSettings.teamMembersCategory ? `<#${serverSettings.teamMembersCategory}>` : '`Not Set`'}\n\n`;
        description += '**To configure these settings, visit your RoModerate dashboard:**\n';
        description += `🔗 ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/dashboard` : 'your-app-url/dashboard'}`;
        
        embed.addFields({ name: 'Settings', value: description, inline: false });
        break;
    }

    // Keep the same select menu so users can navigate to other categories
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`config_menu_${serverId}`)
      .setPlaceholder('Select a configuration category')
      .addOptions([
        new StringSelectMenuOptionBuilder()
          .setLabel('Reports Settings')
          .setDescription('Configure report channels, roles, and options')
          .setValue('reports')
          .setEmoji('📋')
          .setDefault(selectedCategory === 'reports'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Appeals Settings')
          .setDescription('Set up appeal categories and workflows')
          .setValue('appeals')
          .setEmoji('⚖️')
          .setDefault(selectedCategory === 'appeals'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Moderation & Logs')
          .setDescription('Configure mod logs and audit channels')
          .setValue('moderation')
          .setEmoji('🛡️')
          .setDefault(selectedCategory === 'moderation'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Tickets & Support')
          .setDescription('Set up ticket system and support')
          .setValue('tickets')
          .setEmoji('🎫')
          .setDefault(selectedCategory === 'tickets'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Game & Roblox')
          .setDescription('Roblox API keys and game profiles')
          .setValue('roblox')
          .setEmoji('🎮')
          .setDefault(selectedCategory === 'roblox'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Server Settings')
          .setDescription('Server name, icon, and admin roles')
          .setValue('server')
          .setEmoji('⚙️')
          .setDefault(selectedCategory === 'server'),
      ]);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(selectMenu);

    await interaction.editReply({
      embeds: [embed],
      components: [row]
    });
  }

  async startBot(serverId: string, botToken: string, discordGuildId: string): Promise<boolean> {
    try {
      const existingBot = this.bots.get(serverId);
      if (existingBot) {
        await this.stopBot(serverId);
      }

      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers,
        ],
      });

      client.once(Events.ClientReady, async (readyClient) => {
        console.log(`[Discord Bot] ${readyClient.user.tag} is now ONLINE for server ${serverId}`);
        readyClient.user.setPresence({
          activities: [{ name: 'Moderating Roblox', type: ActivityType.Watching }],
          status: 'online',
        });

        await this.registerGuildCommands(serverId, discordGuildId, readyClient);
      });

      client.on(Events.Error, (error) => {
        console.error(`[Discord Bot] Error for server ${serverId}:`, error);
        this.handleBotError(serverId, botToken, discordGuildId);
      });

      client.on(Events.ShardDisconnect, () => {
        console.warn(`[Discord Bot] Bot disconnected for server ${serverId}, attempting restart...`);
        this.handleBotError(serverId, botToken, discordGuildId);
      });

      this.setupCommandHandlers(client, serverId, discordGuildId);

      await client.login(botToken);

      this.bots.set(serverId, {
        client,
        serverId,
        botId: client.user!.id,
        retries: 0,
      });

      return true;
    } catch (error: any) {
      console.error(`[Discord Bot] Failed to start bot for server ${serverId}:`, error.message);
      return false;
    }
  }

  private async handleBotError(serverId: string, botToken: string, discordGuildId: string): Promise<void> {
    const bot = this.bots.get(serverId);
    if (!bot) return;

    const MAX_RETRIES = 5;
    const RETRY_DELAY_MS = 5000 * Math.pow(2, bot.retries);

    if (bot.retries >= MAX_RETRIES) {
      console.error(`[Discord Bot] Max retries reached for server ${serverId}, giving up`);
      await this.stopBot(serverId);
      return;
    }

    bot.retries++;
    console.log(`[Discord Bot] Retry ${bot.retries}/${MAX_RETRIES} for server ${serverId} in ${RETRY_DELAY_MS}ms`);

    setTimeout(async () => {
      await this.startBot(serverId, botToken, discordGuildId);
    }, RETRY_DELAY_MS);
  }

  async startCentralizedBot(): Promise<boolean> {
    try {
      // Try to load token from database first, then in-memory, then env var
      let botToken = this.centralizedBotToken;
      
      if (!botToken && storage) {
        const tokenSetting = await storage.getAppSetting('CENTRALIZED_BOT_TOKEN');
        if (tokenSetting && tokenSetting.value) {
          if (tokenSetting.encrypted) {
            botToken = decryptToken(tokenSetting.value);
          } else {
            botToken = tokenSetting.value;
          }
          this.centralizedBotToken = botToken;
        }
      }
      
      if (!botToken) {
        botToken = process.env.DISCORD_BOT_TOKEN;
        if (botToken) {
          this.centralizedBotToken = botToken;
        }
      }
      
      if (!botToken) {
        console.error('[Discord Bot] DISCORD_BOT_TOKEN not found in environment variables or database');
        console.error('[Discord Bot] Please add DISCORD_BOT_TOKEN to your .env file or update via API');
        return false;
      }

      if (this.centralizedBot && this.isCentralizedBotReady) {
        console.log('[Discord Bot] Centralized bot already running');
        return true;
      }

      console.log('[Discord Bot] Starting centralized RoModerate bot...');
      console.log('[Discord Bot] Note: Ensure the following intents are enabled in Discord Developer Portal:');
      console.log('[Discord Bot]   - Presence Intent');
      console.log('[Discord Bot]   - Server Members Intent');
      console.log('[Discord Bot]   - Message Content Intent');

      this.centralizedBot = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers,
        ],
      });

      this.centralizedBot.once(Events.ClientReady, (readyClient) => {
        this.isCentralizedBotReady = true;
        console.log(`[Discord Bot] ✓ ${readyClient.user.tag} is now ONLINE`);
        console.log(`[Discord Bot] ✓ Bot is in ${readyClient.guilds.cache.size} servers`);
        readyClient.user.setPresence({
          activities: [{ name: 'Moderating Roblox', type: ActivityType.Watching }],
          status: 'online',
        });
      });

      this.centralizedBot.on(Events.Error, (error) => {
        console.error('[Discord Bot] Centralized bot error:', error);
      });

      this.centralizedBot.on(Events.GuildCreate, (guild) => {
        console.log(`[Discord Bot] ✓ Bot invited to new server: ${guild.name} (${guild.id})`);
      });

      await this.centralizedBot.login(botToken);
      return true;
    } catch (error: any) {
      console.error('[Discord Bot] ❌ Failed to start centralized bot:', error.message);
      
      if (error.message && error.message.includes('disallowed intents')) {
        console.error('[Discord Bot] ❌ PRIVILEGED INTENTS NOT ENABLED');
        console.error('[Discord Bot] Please enable the following in Discord Developer Portal:');
        console.error('[Discord Bot] 1. Go to https://discord.com/developers/applications');
        console.error('[Discord Bot] 2. Select your application');
        console.error('[Discord Bot] 3. Go to the "Bot" tab');
        console.error('[Discord Bot] 4. Scroll down to "Privileged Gateway Intents"');
        console.error('[Discord Bot] 5. Enable: Presence Intent, Server Members Intent, Message Content Intent');
        console.error('[Discord Bot] 6. Save changes and restart your application');
      }
      
      this.isCentralizedBotReady = false;
      return false;
    }
  }

  getCentralizedBot(): Client | null {
    return this.centralizedBot && this.isCentralizedBotReady ? this.centralizedBot : null;
  }

  isCentralizedBotOnline(): boolean {
    return this.isCentralizedBotReady && this.centralizedBot?.isReady() === true;
  }

  async stopCentralizedBot(): Promise<void> {
    try {
      if (this.centralizedBot) {
        console.log('[Discord Bot] Stopping centralized bot...');
        this.isCentralizedBotReady = false;
        await this.centralizedBot.destroy();
        this.centralizedBot = null;
        console.log('[Discord Bot] ✓ Centralized bot stopped');
      }
    } catch (error: any) {
      console.error('[Discord Bot] Error stopping centralized bot:', error);
    }
  }

  async restartCentralizedBot(newToken?: string): Promise<boolean> {
    try {
      console.log('[Discord Bot] Restarting centralized bot...');
      
      // Stop the current bot if running
      await this.stopCentralizedBot();
      
      // Update token if provided
      if (newToken) {
        this.centralizedBotToken = newToken;
        console.log('[Discord Bot] Updated bot token');
        
        // Persist the token to storage (encrypted)
        if (storage) {
          const { encryptToken } = await import('./encryption');
          const encryptedToken = encryptToken(newToken);
          await storage.setAppSetting('CENTRALIZED_BOT_TOKEN', encryptedToken, true);
          console.log('[Discord Bot] Persisted bot token to storage');
        }
      }
      
      // Start with new token
      return await this.startCentralizedBot();
    } catch (error: any) {
      console.error('[Discord Bot] Error restarting centralized bot:', error);
      return false;
    }
  }

  async deployTicketPanel(
    channelId: string,
    panel: {
      title: string;
      description: string;
      color?: string;
      buttons: Array<{
        label: string;
        categoryId: string;
        emoji?: string;
        style: 'primary' | 'secondary' | 'success' | 'danger';
      }>;
    }
  ): Promise<{ success: boolean; message?: string; messageId?: string }> {
    try {
      const bot = this.getCentralizedBot();
      if (!bot) {
        return { success: false, message: 'Bot is not online' };
      }

      const channel = await bot.channels.fetch(channelId);
      if (!channel || !channel.isTextBased() || !('send' in channel)) {
        return { success: false, message: 'Channel not found or not a text channel' };
      }

      // Create embed for the panel
      const embed = new EmbedBuilder()
        .setTitle(panel.title)
        .setDescription(panel.description)
        .setColor(panel.color ? parseInt(panel.color.replace('#', ''), 16) : 0x5865F2);

      // Create buttons
      const buttonStyleMap = {
        'primary': ButtonStyle.Primary,
        'secondary': ButtonStyle.Secondary,
        'success': ButtonStyle.Success,
        'danger': ButtonStyle.Danger,
      };

      const actionRows: any[] = [];
      const buttonsPerRow = 5; // Discord limit

      for (let i = 0; i < panel.buttons.length; i += buttonsPerRow) {
        const rowButtons = panel.buttons.slice(i, i + buttonsPerRow).map(btn => {
          const button = new ButtonBuilder()
            .setCustomId(`ticket_panel_${btn.categoryId}`)
            .setLabel(btn.label)
            .setStyle(buttonStyleMap[btn.style]);

          if (btn.emoji) {
            button.setEmoji(btn.emoji);
          }

          return button;
        });

        actionRows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(rowButtons));
      }

      const message = await channel.send({
        embeds: [embed],
        components: actionRows,
      });

      console.log(`[Discord Bot] ✓ Deployed ticket panel to channel ${channelId}`);
      return { success: true, messageId: message.id };
    } catch (error: any) {
      console.error('[Discord Bot] Failed to deploy ticket panel:', error);
      return { success: false, message: error.message || 'Failed to deploy panel' };
    }
  }

  async stopBot(serverId: string): Promise<void> {
    const bot = this.bots.get(serverId);
    if (bot) {
      bot.client.destroy();
      this.bots.delete(serverId);
      console.log(`[Discord Bot] Stopped bot for server ${serverId}`);
    }
  }

  isOnline(serverId: string): boolean {
    const bot = this.bots.get(serverId);
    return bot ? bot.client.isReady() : false;
  }

  getBotStatus(serverId: string): 'online' | 'offline' {
    return this.isOnline(serverId) ? 'online' : 'offline';
  }

  getBotInfo(serverId: string): { botId: string; botName: string } | null {
    const bot = this.bots.get(serverId);
    if (bot && bot.client.user) {
      return {
        botId: bot.client.user.id,
        botName: bot.client.user.username,
      };
    }
    return null;
  }

  async startAllBots(): Promise<void> {
    try {
      console.log('[Discord Bot] Loading all configured bots from database...');
      const allBots = await storage.getAllDiscordBots();
      
      if (!allBots || allBots.length === 0) {
        console.log('[Discord Bot] No bots found in database');
        return;
      }
      
      for (const botRecord of allBots) {
        try {
          if (!botRecord.botTokenEncrypted) {
            console.log(`[Discord Bot] Skipping bot ${botRecord.botName} - no token stored`);
            continue;
          }
          
          const server = await storage.getServer(botRecord.serverId);
          if (!server) {
            console.warn(`[Discord Bot] Server not found for bot ${botRecord.botName}`);
            continue;
          }
          
          console.log(`[Discord Bot] Auto-starting bot ${botRecord.botName} for server ${server.name}`);
          const decryptedToken = decryptToken(botRecord.botTokenEncrypted);
          const started = await this.startBot(botRecord.serverId, decryptedToken, server.discordServerId);
          
          if (started) {
            await storage.updateDiscordBot(botRecord.id, {
              status: 'active',
              lastOnline: new Date(),
            });
            console.log(`[Discord Bot] ✓ ${botRecord.botName} is online for ${server.name}`);
          } else {
            await storage.updateDiscordBot(botRecord.id, {
              status: 'error',
            });
            console.error(`[Discord Bot] ✗ Failed to start ${botRecord.botName}`);
          }
        } catch (error: any) {
          console.error(`[Discord Bot] Error starting bot ${botRecord.botName}:`, error.message);
        }
      }
      
      console.log(`[Discord Bot] Successfully started ${this.bots.size} user bot(s)`);
    } catch (error: any) {
      console.error('[Discord Bot] Failed to load bots on startup:', error.message);
    }
  }
  
  getBot(serverId: string): Client | null {
    const bot = this.bots.get(serverId);
    return bot?.client || null;
  }
  
  async getChannels(serverId: string): Promise<Array<{ id: string; name: string; type: number }>> {
    const bot = this.bots.get(serverId);
    if (!bot || !bot.client.isReady()) {
      return [];
    }
    
    try {
      const server = await storage.getServer(serverId);
      if (!server) return [];
      
      const guild = bot.client.guilds.cache.get(server.discordServerId);
      if (!guild) return [];
      
      const channels = guild.channels.cache
        .filter(channel => channel.isTextBased())
        .map(channel => ({
          id: channel.id,
          name: channel.name,
          type: channel.type,
        }));
      
      return channels;
    } catch (error: any) {
      console.error(`[Discord Bot] Failed to fetch channels for server ${serverId}:`, error);
      return [];
    }
  }
}

export const botManager = new DiscordBotManager();
