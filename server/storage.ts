// Storage implementation
// Supports both database and in-memory storage

import { db } from './db';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '@shared/schema';

// ===== TYPE DEFINITIONS =====

interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator: string | null;
  avatar: string | null;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tosAcceptedAt: Date | null;
  createdAt: Date;
}

interface Server {
  id: string;
  discordServerId: string;
  name: string;
  icon: string | null;
  ownerId: string;
  settings: any;
  createdAt: Date;
}

interface Ban {
  id: string;
  serverId: string;
  robloxUserId: string;
  robloxUsername: string;
  discordUserId: string | null;
  reason: string;
  bannedBy: string;
  expiresAt: Date | null;
  isActive: boolean;
  metadata: any;
  createdAt: Date;
}

interface Appeal {
  id: string;
  banId: string;
  serverId: string;
  discordUserId: string | null;
  appealText: string;
  status: string;
  reviewedBy: string | null;
  reviewNote: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

interface Report {
  id: string;
  serverId: string;
  robloxUserId: string;
  robloxUsername: string;
  reason: string;
  reportedBy: string;
  reportedByUsername: string | null;
  status: string;
  reviewedBy: string | null;
  reviewNote: string | null;
  reviewedAt: Date | null;
  evidence: string[];
  createdAt: Date;
}

interface Ticket {
  id: string;
  serverId: string;
  userId?: string | null;
  discordUserId: string | null;
  discordUsername: string | null;
  title: string;
  subject?: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  closedBy: string | null;
  closedAt: Date | null;
  metadata: any | null;
  createdAt: Date;
}

interface ServerMember {
  id: string;
  serverId: string;
  userId: string;
  role: string;
  permissions: string[];
  invitedBy: string | null;
  joinedAt: Date;
}

interface InviteCode {
  id: string;
  serverId: string;
  code: string;
  role: string;
  permissions: string[];
  createdBy: string;
  maxUses: number | null;
  currentUses: number;
  expiresAt: Date | null;
  createdAt: Date;
}

interface BotRegistration {
  id: string;
  serverId: string;
  ownerUserId: string;
  botId: string;
  botName: string;
  botToken: string;
  isActive: boolean;
  createdAt: Date;
}

interface ApiKey {
  id: string;
  serverId: string;
  name: string;
  keyHash: string;
  keyPreview: string;
  scopes: string[];
  permissions: string[];
  createdBy: string;
  lastUsed: Date | null;
  createdAt: Date;
}

interface RobloxApiKey {
  id: string;
  serverId: string;
  name: string;
  universeId: string;
  apiKey: string;
  apiKeyEncrypted: string;
  createdBy: string;
  createdAt: Date;
}

interface AutoAction {
  id: string;
  serverId: string;
  name: string;
  trigger: string;
  action: string;
  conditions: any;
  actionParams: any;
  config: any;
  isActive: boolean;
  createdAt: Date;
}

interface ModeratorNote {
  id: string;
  serverId: string;
  robloxUserId: string;
  note: string;
  authorId: string;
  isImportant: boolean;
  createdBy: string;
  createdAt: Date;
}

interface DiscordBot {
  id: string;
  serverId: string;
  botToken?: string;
  botTokenEncrypted: string;
  botId: string;
  botName: string;
  status: string;
  features: string[];
  lastOnline: Date | null;
  createdAt: Date;
}

interface Notification {
  id: string;
  userId: string;
  serverId: string | null;
  type: string;
  title: string;
  message: string;
  metadata: any | null;
  isRead: boolean;
  createdAt: Date;
}

// ===== IN-MEMORY DATA STORES =====

const users = new Map<string, User>();
const servers = new Map<string, Server>();
const bans = new Map<string, Ban>();
const reports = new Map<string, Report>();
const appeals = new Map<string, Appeal>();
const appSettings = new Map<string, any>();
const tickets = new Map<string, Ticket>();
const serverMembers = new Map<string, ServerMember>();
const inviteCodes = new Map<string, InviteCode>();
const botRegistrations = new Map<string, BotRegistration>();
const apiKeys = new Map<string, ApiKey>();
const robloxApiKeys = new Map<string, RobloxApiKey>();
const autoActions = new Map<string, AutoAction>();
const moderatorNotes = new Map<string, ModeratorNote>();
const discordBots = new Map<string, DiscordBot>();
const notifications = new Map<string, Notification>();
const moderatorShifts = new Map<string, any>();
const serverBrandings = new Map<string, any>();
const premiumSubscriptions = new Map<string, any>();
const activityExports = new Map<string, any>();
const analyticsSnapshots = new Map<string, any>();
const marketplaceListings = new Map<string, any>();
const marketplaceOffers = new Map<string, any>();
const marketplaceReviews = new Map<string, any>();
const marketplaceReputations = new Map<string, any>();
const marketplaceTransactions = new Map<string, any>();
const marketplaceEscrow = new Map<string, any>();
const sellerVerifications = new Map<string, any>();
const transactionLogs = new Map<string, any>();

// ===== HELPER FUNCTIONS =====

function generateId(): string {
  // Generate proper UUID v4
  return crypto.randomUUID();
}

// ===== STORAGE INTERFACE =====

export const storage = {
  // ===== USER OPERATIONS =====
  
  async createUser(data: Omit<User, 'id' | 'createdAt'>) {
    try {
      const [user] = await db.insert(schema.users).values({
        discordId: data.discordId,
        username: data.username,
        discriminator: data.discriminator,
        avatar: data.avatar,
        email: data.email,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }).returning();
      return user as User;
    } catch (error) {
      // Fallback to in-memory
      const user: User = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      users.set(user.id, user);
      return user;
    }
  },

  async getUserByDiscordId(discordId: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.discordId, discordId),
      });
      return (user as User) || null;
    } catch (error) {
      return Array.from(users.values()).find(u => u.discordId === discordId) || null;
    }
  },

  async getUser(id: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });
      return (user as User) || null;
    } catch (error) {
      return users.get(id) || null;
    }
  },

  async updateUser(id: string, data: Partial<User>) {
    try {
      const [updated] = await db.update(schema.users)
        .set(data as any)
        .where(eq(schema.users.id, id))
        .returning();
      return (updated as User) || null;
    } catch (error) {
      const user = users.get(id);
      if (!user) return null;
      const updated = { ...user, ...data };
      users.set(id, updated);
      return updated;
    }
  },

  async acceptTos(userId: string) {
    return await this.updateUser(userId, {
      tosAcceptedAt: new Date(),
    });
  },

  // ===== ADMIN OPERATIONS =====

  async createAdmin(data: { username: string; passwordHash: string; role?: string }) {
    try {
      const [admin] = await db.insert(schema.admins).values({
        username: data.username,
        passwordHash: data.passwordHash,
        role: data.role || 'admin',
      }).returning();
      return admin;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  async getAdminByUsername(username: string) {
    try {
      const admin = await db.query.admins.findFirst({
        where: eq(schema.admins.username, username),
      });
      return admin || null;
    } catch (error) {
      console.error('Error fetching admin:', error);
      return null;
    }
  },

  async updateAdminLastLogin(id: string) {
    try {
      const [updated] = await db.update(schema.admins)
        .set({ lastLoginAt: new Date() })
        .where(eq(schema.admins.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating admin last login:', error);
      return null;
    }
  },

  // ===== SERVER OPERATIONS =====
  
  async createServer(data: Omit<Server, 'id' | 'createdAt'>) {
    try {
      const [server] = await db.insert(schema.servers).values({
        discordServerId: data.discordServerId,
        name: data.name,
        icon: data.icon,
        ownerId: data.ownerId,
        settings: data.settings || {},
      }).returning();
      return server as Server;
    } catch (error) {
      const server: Server = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      servers.set(server.id, server);
      return server;
    }
  },

  async getServer(id: string) {
    try {
      const server = await db.query.servers.findFirst({
        where: eq(schema.servers.id, id),
      });
      return (server as Server) || null;
    } catch (error) {
      return servers.get(id) || null;
    }
  },

  async getServerByDiscordId(discordServerId: string) {
    try {
      const server = await db.query.servers.findFirst({
        where: eq(schema.servers.discordServerId, discordServerId),
      });
      return (server as Server) || null;
    } catch (error) {
      return Array.from(servers.values()).find(s => s.discordServerId === discordServerId) || null;
    }
  },

  async getServersByUserId(userId: string) {
    try {
      const ownedServers = await db.query.servers.findMany({
        where: eq(schema.servers.ownerId, userId),
      });
      return ownedServers as Server[];
    } catch (error) {
      const ownedServers = Array.from(servers.values()).filter(s => s.ownerId === userId);
      const memberServers = Array.from(serverMembers.values())
        .filter(m => m.userId === userId)
        .map(m => servers.get(m.serverId))
        .filter(Boolean) as Server[];
      
      const allServers = [...ownedServers, ...memberServers];
      const uniqueServers = Array.from(new Map(allServers.map(s => [s.id, s])).values());
      return uniqueServers;
    }
  },

  async getServersByOwnerId(ownerId: string) {
    try {
      const serversData = await db.query.servers.findMany({
        where: eq(schema.servers.ownerId, ownerId),
      });
      return serversData as Server[];
    } catch (error) {
      return Array.from(servers.values()).filter(s => s.ownerId === ownerId);
    }
  },

  async getAllServers() {
    try {
      const allServers = await db.query.servers.findMany();
      return allServers as Server[];
    } catch (error) {
      return Array.from(servers.values());
    }
  },

  async updateServer(id: string, data: Partial<Server>) {
    try {
      const [updated] = await db.update(schema.servers)
        .set(data as any)
        .where(eq(schema.servers.id, id))
        .returning();
      return (updated as Server) || null;
    } catch (error) {
      const server = servers.get(id);
      if (!server) return null;
      const updated = { ...server, ...data };
      servers.set(id, updated);
      return updated;
    }
  },

  async deleteServer(id: string) {
    return servers.delete(id);
  },

  // ===== BAN OPERATIONS =====
  
  async createBan(data: Omit<Ban, 'id' | 'createdAt'>) {
    try {
      const [ban] = await db.insert(schema.bans)
        .values(data as any)
        .returning();
      const typedBan = ban as Ban;
      // Also populate in-memory cache
      bans.set(typedBan.id, typedBan);
      return typedBan;
    } catch (error) {
      // Fallback to in-memory storage
      const ban: Ban = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      bans.set(ban.id, ban);
      return ban;
    }
  },

  async getBan(id: string) {
    return bans.get(id) || null;
  },

  async getBansByServerId(serverId: string) {
    return Array.from(bans.values()).filter(b => b.serverId === serverId);
  },

  async getBanByRobloxUserId(serverId: string, robloxUserId: string) {
    return Array.from(bans.values()).find(
      b => b.serverId === serverId && b.robloxUserId === robloxUserId && b.isActive
    ) || null;
  },

  async updateBan(id: string, data: Partial<Ban>) {
    const ban = bans.get(id);
    if (!ban) return null;
    const updated = { ...ban, ...data };
    bans.set(id, updated);
    return updated;
  },

  async deleteBan(id: string) {
    return bans.delete(id);
  },

  async deactivateBan(serverId: string, robloxUsername: string) {
    try {
      await db.update(schema.bans)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(
          eq(schema.bans.serverId, serverId),
          eq(schema.bans.robloxUsername, robloxUsername),
          eq(schema.bans.isActive, true)
        ));
      
      // Also update in-memory store if database succeeds
      const userBans = Array.from(bans.values()).filter(
        b => b.serverId === serverId && b.robloxUsername === robloxUsername && b.isActive
      );
      
      for (const ban of userBans) {
        ban.isActive = false;
        bans.set(ban.id, ban);
      }
      
      return userBans.length;
    } catch (error) {
      // Fallback to in-memory only
      const userBans = Array.from(bans.values()).filter(
        b => b.serverId === serverId && b.robloxUsername === robloxUsername && b.isActive
      );
      
      for (const ban of userBans) {
        ban.isActive = false;
        bans.set(ban.id, ban);
      }
      
      return userBans.length;
    }
  },

  async getBansByUsername(serverId: string, username: string) {
    return Array.from(bans.values()).filter(
      b => b.serverId === serverId && b.robloxUsername.toLowerCase() === username.toLowerCase()
    );
  },

  async getServerBans(serverId: string) {
    return this.getBansByServerId(serverId);
  },

  // ===== REPORT OPERATIONS =====
  
  async createReport(data: Omit<Report, 'id' | 'createdAt'>) {
    try {
      const [report] = await db.insert(schema.reports)
        .values(data as any)
        .returning();
      const typedReport = report as Report;
      // Also populate in-memory cache
      reports.set(typedReport.id, typedReport);
      return typedReport;
    } catch (error) {
      // Fallback to in-memory storage
      const report: Report = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      reports.set(report.id, report);
      return report;
    }
  },

  async getReport(id: string) {
    return reports.get(id) || null;
  },

  async getReportsByServerId(serverId: string) {
    return Array.from(reports.values()).filter(r => r.serverId === serverId);
  },

  async updateReport(id: string, data: Partial<Report>) {
    const report = reports.get(id);
    if (!report) return null;
    const updated = { ...report, ...data };
    reports.set(id, updated);
    return updated;
  },

  async getReportsByUsername(serverId: string, username: string) {
    return Array.from(reports.values()).filter(
      r => r.serverId === serverId && r.robloxUsername.toLowerCase() === username.toLowerCase()
    );
  },

  async getServerReports(serverId: string) {
    return this.getReportsByServerId(serverId);
  },

  // ===== APPEAL OPERATIONS =====
  
  async createAppeal(data: Omit<Appeal, 'id' | 'createdAt'>) {
    const appeal: Appeal = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    };
    appeals.set(appeal.id, appeal);
    return appeal;
  },

  async getAppeal(id: string) {
    return appeals.get(id) || null;
  },

  async getAppealsByServerId(serverId: string) {
    return Array.from(appeals.values()).filter(a => a.serverId === serverId);
  },

  async updateAppeal(id: string, data: Partial<Appeal>) {
    const appeal = appeals.get(id);
    if (!appeal) return null;
    const updated = { ...appeal, ...data };
    appeals.set(id, updated);
    return updated;
  },

  // ===== TICKET OPERATIONS =====
  
  async createTicket(data: Omit<Ticket, 'id' | 'createdAt'>) {
    const ticket: Ticket = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    };
    tickets.set(ticket.id, ticket);
    return ticket;
  },

  async getTicket(id: string) {
    return tickets.get(id) || null;
  },

  async getTicketsByServerId(serverId: string) {
    return Array.from(tickets.values()).filter(t => t.serverId === serverId);
  },

  async updateTicket(id: string, data: Partial<Ticket>) {
    const ticket = tickets.get(id);
    if (!ticket) return null;
    const updated = { ...ticket, ...data };
    tickets.set(id, updated);
    return updated;
  },

  async getServerTickets(serverId: string) {
    return this.getTicketsByServerId(serverId);
  },

  // ===== SERVER MEMBER OPERATIONS =====
  
  async createServerMember(data: Omit<ServerMember, 'id' | 'joinedAt'>) {
    const member: ServerMember = {
      id: generateId(),
      ...data,
      joinedAt: new Date(),
    };
    serverMembers.set(member.id, member);
    return member;
  },

  async getServerMembersByServerId(serverId: string) {
    return Array.from(serverMembers.values()).filter(m => m.serverId === serverId);
  },

  async getServerMember(serverId: string, userId: string) {
    return Array.from(serverMembers.values()).find(
      m => m.serverId === serverId && m.userId === userId
    ) || null;
  },

  async getServerMemberByUserAndServer(userId: string, serverId: string) {
    return Array.from(serverMembers.values()).find(
      m => m.userId === userId && m.serverId === serverId
    ) || null;
  },

  async updateServerMember(id: string, data: Partial<ServerMember>) {
    const member = serverMembers.get(id);
    if (!member) return null;
    const updated = { ...member, ...data };
    serverMembers.set(id, updated);
    return updated;
  },

  async deleteServerMember(id: string) {
    return serverMembers.delete(id);
  },

  // ===== INVITE CODE OPERATIONS =====
  
  async createInviteCode(data: Omit<InviteCode, 'id' | 'createdAt'>) {
    const invite: InviteCode = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    };
    inviteCodes.set(invite.id, invite);
    return invite;
  },

  async getInviteCodeByCode(code: string) {
    return Array.from(inviteCodes.values()).find(i => i.code === code) || null;
  },

  async getInviteCodesByServerId(serverId: string) {
    return Array.from(inviteCodes.values()).filter(i => i.serverId === serverId);
  },

  async updateInviteCode(id: string, data: Partial<InviteCode>) {
    const invite = inviteCodes.get(id);
    if (!invite) return null;
    const updated = { ...invite, ...data };
    inviteCodes.set(id, updated);
    return updated;
  },

  async deleteInviteCode(id: string) {
    return inviteCodes.delete(id);
  },

  // ===== BOT REGISTRATION OPERATIONS =====
  
  async createBotRegistration(data: Omit<BotRegistration, 'id' | 'createdAt'>) {
    const bot: BotRegistration = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    };
    botRegistrations.set(bot.id, bot);
    return bot;
  },

  async getBotRegistrationByBotId(botId: string) {
    return Array.from(botRegistrations.values()).find(b => b.botId === botId) || null;
  },

  async getBotRegistrationsByServerId(serverId: string) {
    return Array.from(botRegistrations.values()).filter(b => b.serverId === serverId);
  },

  async deleteBotRegistration(id: string) {
    return botRegistrations.delete(id);
  },

  // ===== API KEY OPERATIONS =====
  
  async createApiKey(data: Omit<ApiKey, 'id' | 'createdAt' | 'lastUsed'>) {
    const apiKey: ApiKey = {
      id: generateId(),
      ...data,
      lastUsed: null,
      createdAt: new Date(),
    };
    apiKeys.set(apiKey.id, apiKey);
    return apiKey;
  },

  async getApiKeyByHash(keyHash: string) {
    return Array.from(apiKeys.values()).find(k => k.keyHash === keyHash) || null;
  },

  async getApiKeysByServerId(serverId: string) {
    return Array.from(apiKeys.values()).filter(k => k.serverId === serverId);
  },

  async updateApiKey(id: string, data: Partial<ApiKey>) {
    const apiKey = apiKeys.get(id);
    if (!apiKey) return null;
    const updated = { ...apiKey, ...data };
    apiKeys.set(id, updated);
    return updated;
  },

  async deleteApiKey(id: string) {
    return apiKeys.delete(id);
  },

  // ===== ROBLOX API KEY OPERATIONS =====
  
  async createRobloxApiKey(data: Omit<RobloxApiKey, 'id' | 'createdAt'>) {
    const key: RobloxApiKey = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    };
    robloxApiKeys.set(key.id, key);
    return key;
  },

  async getRobloxApiKeysByServerId(serverId: string) {
    return Array.from(robloxApiKeys.values()).filter(k => k.serverId === serverId);
  },

  async deleteRobloxApiKey(id: string) {
    return robloxApiKeys.delete(id);
  },

  // ===== AUTO ACTION OPERATIONS =====
  
  async createAutoAction(data: Omit<AutoAction, 'id' | 'createdAt'>) {
    const action: AutoAction = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    };
    autoActions.set(action.id, action);
    return action;
  },

  async getAutoActionsByServerId(serverId: string) {
    return Array.from(autoActions.values()).filter(a => a.serverId === serverId);
  },

  async updateAutoAction(id: string, data: Partial<AutoAction>) {
    const action = autoActions.get(id);
    if (!action) return null;
    const updated = { ...action, ...data };
    autoActions.set(id, updated);
    return updated;
  },

  async deleteAutoAction(id: string) {
    return autoActions.delete(id);
  },

  // ===== MODERATOR NOTE OPERATIONS =====
  
  async createModeratorNote(data: Omit<ModeratorNote, 'id' | 'createdAt'>) {
    const note: ModeratorNote = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    };
    moderatorNotes.set(note.id, note);
    return note;
  },

  async getModeratorNotesByServerId(serverId: string, robloxUserId?: string) {
    let notes = Array.from(moderatorNotes.values()).filter(n => n.serverId === serverId);
    if (robloxUserId) {
      notes = notes.filter(n => n.robloxUserId === robloxUserId);
    }
    return notes;
  },

  async deleteModeratorNote(id: string) {
    return moderatorNotes.delete(id);
  },

  async getNotesForPlayer(serverId: string, username: string) {
    return this.getModeratorNotesByServerId(serverId, username);
  },

  async createNote(data: Omit<ModeratorNote, 'id' | 'createdAt'>) {
    return this.createModeratorNote(data);
  },

  // ===== ADDITIONAL METHODS =====
  
  async getBotRegistrationsByUserId(userId: string) {
    const userServers = await this.getServersByOwnerId(userId);
    const serverIds = userServers.map(s => s.id);
    return Array.from(botRegistrations.values()).filter(b => serverIds.includes(b.serverId));
  },

  async getBotRegistration(id: string) {
    return botRegistrations.get(id) || null;
  },

  async getApiKey(id: string) {
    return apiKeys.get(id) || null;
  },

  async updateApiKeyLastUsed(id: string) {
    const apiKey = apiKeys.get(id);
    if (!apiKey) return null;
    const updated = { ...apiKey, lastUsed: new Date() };
    apiKeys.set(id, updated);
    return updated;
  },

  // ===== DISCORD BOT OPERATIONS =====
  
  async getAllDiscordBots() {
    try {
      const bots = await db.query.discordBots.findMany();
      return bots as DiscordBot[];
    } catch (error) {
      return Array.from(discordBots.values());
    }
  },

  async getDiscordBotByServerId(serverId: string) {
    try {
      const bot = await db.query.discordBots.findFirst({
        where: eq(schema.discordBots.serverId, serverId),
      });
      return (bot as DiscordBot) || null;
    } catch (error) {
      return Array.from(discordBots.values()).find(b => b.serverId === serverId) || null;
    }
  },

  async createDiscordBot(data: Omit<DiscordBot, 'id' | 'createdAt'>) {
    try {
      const [bot] = await db.insert(schema.discordBots).values({
        serverId: data.serverId,
        botTokenEncrypted: data.botTokenEncrypted,
        botId: data.botId,
        botName: data.botName,
        status: data.status,
        features: data.features,
        lastOnline: data.lastOnline,
      }).returning();
      return bot as DiscordBot;
    } catch (error) {
      console.error('Failed to create discord bot in database:', error);
      const bot: DiscordBot = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      discordBots.set(bot.id, bot);
      return bot;
    }
  },

  async updateDiscordBot(id: string, data: Partial<DiscordBot>) {
    try {
      const [updated] = await db.update(schema.discordBots)
        .set(data as any)
        .where(eq(schema.discordBots.id, id))
        .returning();
      return (updated as DiscordBot) || null;
    } catch (error) {
      const bot = discordBots.get(id);
      if (!bot) return null;
      const updated = { ...bot, ...data };
      discordBots.set(id, updated);
      return updated;
    }
  },

  // ===== NOTIFICATION OPERATIONS =====
  
  async createNotification(data: Omit<Notification, 'id' | 'createdAt'>) {
    const notification: Notification = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    };
    notifications.set(notification.id, notification);
    return notification;
  },

  async getNotificationsByUserId(userId: string) {
    return Array.from(notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async markNotificationAsRead(id: string) {
    const notification = notifications.get(id);
    if (!notification) return null;
    const updated = { ...notification, isRead: true };
    notifications.set(id, updated);
    return updated;
  },

  async markAllNotificationsAsRead(userId: string) {
    const userNotifications = Array.from(notifications.values()).filter(n => n.userId === userId);
    userNotifications.forEach(n => {
      notifications.set(n.id, { ...n, isRead: true });
    });
    return true;
  },

  async deleteNotification(id: string) {
    return notifications.delete(id);
  },

  // ===== SHIFT TRACKING OPERATIONS =====

  async getShiftsByServerId(serverId: string, options: any = {}) {
    try {
      let query = db.query.moderatorShifts.findMany({
        where: eq(schema.moderatorShifts.serverId, serverId),
        with: {
          user: true,
        },
        orderBy: (shifts, { desc }) => [desc(shifts.startTime)],
        limit: options.limit || 50,
      });

      const shifts = await query;
      
      if (options.status) {
        return shifts.filter(s => s.status === options.status);
      }
      if (options.userId) {
        return shifts.filter(s => s.userId === options.userId);
      }
      if (options.startDate) {
        return shifts.filter(s => new Date(s.startTime) >= options.startDate);
      }
      
      return shifts;
    } catch (error) {
      return [];
    }
  },

  async createShift(data: any) {
    try {
      const [shift] = await db.insert(schema.moderatorShifts)
        .values(data)
        .returning();
      return shift;
    } catch (error) {
      // Fallback to in-memory storage
      const shift = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      moderatorShifts.set(shift.id, shift);
      return shift;
    }
  },

  async getShift(id: string) {
    try {
      const shift = await db.query.moderatorShifts.findFirst({
        where: eq(schema.moderatorShifts.id, id),
      });
      return shift || null;
    } catch (error) {
      return null;
    }
  },

  async updateShift(id: string, data: any) {
    try {
      const [updated] = await db.update(schema.moderatorShifts)
        .set(data)
        .where(eq(schema.moderatorShifts.id, id))
        .returning();
      return updated;
    } catch (error) {
      return null;
    }
  },

  async getActiveShiftByUserId(userId: string, serverId: string) {
    try {
      const shift = await db.query.moderatorShifts.findFirst({
        where: and(
          eq(schema.moderatorShifts.userId, userId),
          eq(schema.moderatorShifts.serverId, serverId),
          eq(schema.moderatorShifts.status, 'active')
        ),
      });
      return shift || null;
    } catch (error) {
      // Fallback to in-memory storage
      return Array.from(moderatorShifts.values()).find(
        s => s.userId === userId && s.serverId === serverId && s.status === 'active'
      ) || null;
    }
  },

  async getShiftMetrics(shiftId: string, startTime: Date, endTime: Date) {
    try {
      const logs = await db.query.moderationLogs.findMany({
        where: and(
          eq(schema.moderationLogs.shiftId, shiftId),
        ),
      });

      const metrics = {
        actionsCount: logs.length,
        bansIssued: logs.filter(l => l.action === 'ban').length,
        appealsReviewed: logs.filter(l => l.action === 'appeal_review').length,
        ticketsHandled: logs.filter(l => l.action === 'ticket_close').length,
        reportsProcessed: logs.filter(l => l.action === 'report_process').length,
      };

      return metrics;
    } catch (error) {
      return {};
    }
  },

  // ===== MODERATION LOGS OPERATIONS =====

  async getModerationLogsByServerId(serverId: string, options: any = {}) {
    try {
      let query = db.query.moderationLogs.findMany({
        where: eq(schema.moderationLogs.serverId, serverId),
        with: {
          moderator: true,
          shift: true,
        },
        orderBy: (logs, { desc }) => [desc(logs.createdAt)],
        limit: options.limit || 100,
      });

      const logs = await query;

      if (options.action) {
        return logs.filter(l => l.action === options.action);
      }
      if (options.moderatorId) {
        return logs.filter(l => l.moderatorId === options.moderatorId);
      }
      if (options.startDate) {
        return logs.filter(l => new Date(l.createdAt) >= options.startDate);
      }

      return logs;
    } catch (error) {
      return [];
    }
  },

  async createModerationLog(data: any) {
    try {
      const [log] = await db.insert(schema.moderationLogs)
        .values(data)
        .returning();
      return log;
    } catch (error) {
      return null;
    }
  },

  // ===== APP SETTINGS OPERATIONS =====
  
  async getAppSetting(key: string) {
    try {
      // Try database first
      const setting = await db.query.appSettings.findFirst({
        where: eq(schema.appSettings.key, key),
      });
      return setting || null;
    } catch (error) {
      // Fall back to in-memory if database unavailable
      return appSettings.get(key) || null;
    }
  },

  async setAppSetting(key: string, value: string, encrypted: boolean = false) {
    try {
      const existing = await this.getAppSetting(key);
      
      if (existing) {
        const [updated] = await db.update(schema.appSettings)
          .set({ value, encrypted, updatedAt: new Date() })
          .where(eq(schema.appSettings.key, key))
          .returning();
        return updated;
      } else {
        const [created] = await db.insert(schema.appSettings)
          .values({ key, value, encrypted })
          .returning();
        return created;
      }
    } catch (error) {
      // Fall back to in-memory if database unavailable
      const setting = {
        id: generateId(),
        key,
        value,
        encrypted,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      appSettings.set(key, setting);
      return setting;
    }
  },

  async deleteAppSetting(key: string) {
    try {
      await db.delete(schema.appSettings)
        .where(eq(schema.appSettings.key, key));
      return true;
    } catch (error) {
      // Fall back to in-memory if database unavailable
      appSettings.delete(key);
      return true;
    }
  },

  // ===== SERVER BRANDING OPERATIONS =====

  async getServerBranding(serverId: string) {
    try {
      const branding = await db.query.serverBranding.findFirst({
        where: eq(schema.serverBranding.serverId, serverId),
      });
      return branding || null;
    } catch (error) {
      return serverBrandings.get(serverId) || null;
    }
  },

  async createOrUpdateServerBranding(serverId: string, data: any) {
    try {
      const existing = await this.getServerBranding(serverId);
      
      if (existing) {
        const [updated] = await db.update(schema.serverBranding)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(schema.serverBranding.serverId, serverId))
          .returning();
        serverBrandings.set(serverId, updated);
        return updated;
      } else {
        const [created] = await db.insert(schema.serverBranding)
          .values({ serverId, ...data })
          .returning();
        serverBrandings.set(serverId, created);
        return created;
      }
    } catch (error) {
      const branding = {
        id: generateId(),
        serverId,
        ...data,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      serverBrandings.set(serverId, branding);
      return branding;
    }
  },

  // ===== PREMIUM SUBSCRIPTION OPERATIONS =====

  async getPremiumSubscription(serverId: string) {
    try {
      const subscription = await db.query.premiumSubscriptions.findFirst({
        where: eq(schema.premiumSubscriptions.serverId, serverId),
      });
      return subscription || null;
    } catch (error) {
      return premiumSubscriptions.get(serverId) || null;
    }
  },

  async createOrUpdatePremiumSubscription(serverId: string, data: any) {
    try {
      const existing = await this.getPremiumSubscription(serverId);
      
      if (existing) {
        const [updated] = await db.update(schema.premiumSubscriptions)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(schema.premiumSubscriptions.serverId, serverId))
          .returning();
        premiumSubscriptions.set(serverId, updated);
        return updated;
      } else {
        const [created] = await db.insert(schema.premiumSubscriptions)
          .values({ serverId, ...data })
          .returning();
        premiumSubscriptions.set(serverId, created);
        return created;
      }
    } catch (error) {
      const subscription = {
        id: generateId(),
        serverId,
        ...data,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      premiumSubscriptions.set(serverId, subscription);
      return subscription;
    }
  },

  // ===== ACTIVITY EXPORT OPERATIONS =====

  async createActivityExport(data: any) {
    try {
      const [exportRecord] = await db.insert(schema.activityExports)
        .values(data)
        .returning();
      activityExports.set(exportRecord.id, exportRecord);
      return exportRecord;
    } catch (error) {
      const exportRecord = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      activityExports.set(exportRecord.id, exportRecord);
      return exportRecord;
    }
  },

  async getActivityExport(id: string) {
    try {
      const exportRecord = await db.query.activityExports.findFirst({
        where: eq(schema.activityExports.id, id),
      });
      return exportRecord || null;
    } catch (error) {
      return activityExports.get(id) || null;
    }
  },

  async getActivityExportsByServerId(serverId: string, limit: number = 50) {
    try {
      const exports = await db.query.activityExports.findMany({
        where: eq(schema.activityExports.serverId, serverId),
        orderBy: (exports, { desc }) => [desc(exports.createdAt)],
        limit,
      });
      return exports;
    } catch (error) {
      return Array.from(activityExports.values())
        .filter(e => e.serverId === serverId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    }
  },

  async updateActivityExport(id: string, data: any) {
    try {
      const [updated] = await db.update(schema.activityExports)
        .set(data)
        .where(eq(schema.activityExports.id, id))
        .returning();
      activityExports.set(id, updated);
      return updated;
    } catch (error) {
      const existing = activityExports.get(id);
      if (existing) {
        const updated = { ...existing, ...data };
        activityExports.set(id, updated);
        return updated;
      }
      return null;
    }
  },

  // ===== ANALYTICS SNAPSHOT OPERATIONS =====

  async createAnalyticsSnapshot(data: any) {
    try {
      const [snapshot] = await db.insert(schema.analyticsSnapshots)
        .values(data)
        .returning();
      return snapshot;
    } catch (error) {
      const snapshot = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      const key = `${data.serverId}-${data.snapshotDate}`;
      analyticsSnapshots.set(key, snapshot);
      return snapshot;
    }
  },

  async getAnalyticsSnapshots(serverId: string, startDate: Date, endDate: Date) {
    try {
      const snapshots = await db.query.analyticsSnapshots.findMany({
        where: and(
          eq(schema.analyticsSnapshots.serverId, serverId),
        ),
        orderBy: (snapshots, { desc }) => [desc(snapshots.snapshotDate)],
      });
      
      return snapshots.filter(s => {
        const date = new Date(s.snapshotDate);
        return date >= startDate && date <= endDate;
      });
    } catch (error) {
      return Array.from(analyticsSnapshots.values())
        .filter(s => {
          if (s.serverId !== serverId) return false;
          const date = new Date(s.snapshotDate);
          return date >= startDate && date <= endDate;
        })
        .sort((a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime());
    }
  },

  async getLatestAnalyticsSnapshot(serverId: string) {
    try {
      const snapshot = await db.query.analyticsSnapshots.findFirst({
        where: eq(schema.analyticsSnapshots.serverId, serverId),
        orderBy: (snapshots, { desc }) => [desc(snapshots.snapshotDate)],
      });
      return snapshot || null;
    } catch (error) {
      const serverSnapshots = Array.from(analyticsSnapshots.values())
        .filter(s => s.serverId === serverId)
        .sort((a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime());
      return serverSnapshots[0] || null;
    }
  },

  // ===== ENHANCED BAN OPERATIONS WITH FILTERING =====

  async getBansWithFilters(serverId: string, filters: {
    status?: 'active' | 'inactive' | 'all';
    search?: string;
    bannedBy?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}) {
    try {
      let query = db.query.bans.findMany({
        where: eq(schema.bans.serverId, serverId),
        orderBy: (bans, { desc }) => [desc(bans.createdAt)],
        limit: filters.limit || 100,
      });

      const allBans = await query;
      let filtered = allBans;

      if (filters.status === 'active') {
        filtered = filtered.filter(b => b.isActive);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(b => !b.isActive);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(b =>
          b.robloxUsername.toLowerCase().includes(searchLower) ||
          b.robloxUserId.includes(filters.search!) ||
          b.reason.toLowerCase().includes(searchLower)
        );
      }

      if (filters.bannedBy) {
        filtered = filtered.filter(b => b.bannedBy === filters.bannedBy);
      }

      if (filters.startDate) {
        filtered = filtered.filter(b => new Date(b.createdAt) >= filters.startDate!);
      }

      if (filters.endDate) {
        filtered = filtered.filter(b => new Date(b.createdAt) <= filters.endDate!);
      }

      return filtered;
    } catch (error) {
      let filtered = Array.from(bans.values()).filter(b => b.serverId === serverId);

      if (filters.status === 'active') {
        filtered = filtered.filter(b => b.isActive);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(b => !b.isActive);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(b =>
          b.robloxUsername.toLowerCase().includes(searchLower) ||
          b.robloxUserId.includes(filters.search!) ||
          b.reason.toLowerCase().includes(searchLower)
        );
      }

      if (filters.bannedBy) {
        filtered = filtered.filter(b => b.bannedBy === filters.bannedBy);
      }

      return filtered
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, filters.limit || 100);
    }
  },

  // ===== ENHANCED APPEAL OPERATIONS WITH FILTERING =====

  async getAppealsWithFilters(serverId: string, filters: {
    status?: string;
    reviewedBy?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}) {
    try {
      const allAppeals = await db.query.appeals.findMany({
        where: eq(schema.appeals.serverId, serverId),
        orderBy: (appeals, { desc }) => [desc(appeals.createdAt)],
        limit: filters.limit || 100,
      });

      let filtered = allAppeals;

      if (filters.status) {
        filtered = filtered.filter(a => a.status === filters.status);
      }

      if (filters.reviewedBy) {
        filtered = filtered.filter(a => a.reviewedBy === filters.reviewedBy);
      }

      if (filters.startDate) {
        filtered = filtered.filter(a => new Date(a.createdAt) >= filters.startDate!);
      }

      if (filters.endDate) {
        filtered = filtered.filter(a => new Date(a.createdAt) <= filters.endDate!);
      }

      return filtered;
    } catch (error) {
      let filtered = Array.from(appeals.values()).filter(a => a.serverId === serverId);

      if (filters.status) {
        filtered = filtered.filter(a => a.status === filters.status);
      }

      if (filters.reviewedBy) {
        filtered = filtered.filter(a => a.reviewedBy === filters.reviewedBy);
      }

      return filtered
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, filters.limit || 100);
    }
  },

  // ===== ENHANCED TICKET OPERATIONS WITH FILTERING =====

  async getTicketsWithFilters(serverId: string, filters: {
    status?: string;
    category?: string;
    priority?: string;
    assignedTo?: string;
    search?: string;
    limit?: number;
  } = {}) {
    try {
      const allTickets = await db.query.tickets.findMany({
        where: eq(schema.tickets.serverId, serverId),
        orderBy: (tickets, { desc }) => [desc(tickets.createdAt)],
        limit: filters.limit || 100,
      });

      let filtered = allTickets;

      if (filters.status) {
        filtered = filtered.filter(t => t.status === filters.status);
      }

      if (filters.category) {
        filtered = filtered.filter(t => t.category === filters.category);
      }

      if (filters.priority) {
        filtered = filtered.filter(t => t.priority === filters.priority);
      }

      if (filters.assignedTo) {
        filtered = filtered.filter(t => t.assignedTo === filters.assignedTo);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(t =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.discordUsername.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    } catch (error) {
      let filtered = Array.from(tickets.values()).filter(t => t.serverId === serverId);

      if (filters.status) {
        filtered = filtered.filter(t => t.status === filters.status);
      }

      if (filters.category) {
        filtered = filtered.filter(t => t.category === filters.category);
      }

      if (filters.priority) {
        filtered = filtered.filter(t => t.priority === filters.priority);
      }

      if (filters.assignedTo) {
        filtered = filtered.filter(t => t.assignedTo === filters.assignedTo);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(t =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
        );
      }

      return filtered
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, filters.limit || 100);
    }
  },

  // ===== MARKETPLACE OPERATIONS =====

  async createListing(data: schema.InsertMarketplaceListing) {
    try {
      const [listing] = await db.insert(schema.marketplaceListings).values(data).returning();
      return listing;
    } catch (error) {
      const listing = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      marketplaceListings.set(listing.id, listing);
      return listing;
    }
  },

  async getListing(id: string) {
    try {
      const listing = await db.query.marketplaceListings.findFirst({
        where: eq(schema.marketplaceListings.id, id),
      });
      return listing || null;
    } catch (error) {
      return marketplaceListings.get(id) || null;
    }
  },

  async getListings(filters: {
    sellerId?: string;
    serverId?: string;
    category?: string;
    status?: string;
    search?: string;
    limit?: number;
  }) {
    try {
      let query = db.select().from(schema.marketplaceListings);
      const conditions: any[] = [];

      if (filters.sellerId) conditions.push(eq(schema.marketplaceListings.sellerId, filters.sellerId));
      if (filters.serverId) conditions.push(eq(schema.marketplaceListings.serverId, filters.serverId));
      if (filters.category) conditions.push(eq(schema.marketplaceListings.category, filters.category));
      if (filters.status) conditions.push(eq(schema.marketplaceListings.status, filters.status));

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      let listings = await query;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        listings = listings.filter(l =>
          l.title.toLowerCase().includes(searchLower) ||
          l.description.toLowerCase().includes(searchLower)
        );
      }

      return listings.slice(0, filters.limit || 100);
    } catch (error) {
      let filtered = Array.from(marketplaceListings.values());

      if (filters.sellerId) filtered = filtered.filter(l => l.sellerId === filters.sellerId);
      if (filters.serverId) filtered = filtered.filter(l => l.serverId === filters.serverId);
      if (filters.category) filtered = filtered.filter(l => l.category === filters.category);
      if (filters.status) filtered = filtered.filter(l => l.status === filters.status);

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(l =>
          l.title.toLowerCase().includes(searchLower) ||
          l.description.toLowerCase().includes(searchLower)
        );
      }

      return filtered.slice(0, filters.limit || 100);
    }
  },

  async updateListing(id: string, data: Partial<schema.InsertMarketplaceListing>) {
    try {
      const [updated] = await db.update(schema.marketplaceListings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.marketplaceListings.id, id))
        .returning();
      return updated || null;
    } catch (error) {
      const listing = marketplaceListings.get(id);
      if (!listing) return null;
      const updated = { ...listing, ...data, updatedAt: new Date() };
      marketplaceListings.set(id, updated);
      return updated;
    }
  },

  async deleteListing(id: string) {
    try {
      await db.delete(schema.marketplaceListings).where(eq(schema.marketplaceListings.id, id));
      return true;
    } catch (error) {
      return marketplaceListings.delete(id);
    }
  },

  async createOffer(data: schema.InsertMarketplaceOffer) {
    try {
      const [offer] = await db.insert(schema.marketplaceOffers).values(data).returning();
      await db.update(schema.marketplaceListings)
        .set({ offerCount: sql`${schema.marketplaceListings.offerCount} + 1` })
        .where(eq(schema.marketplaceListings.id, data.listingId));
      return offer;
    } catch (error) {
      const offer = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      marketplaceOffers.set(offer.id, offer);
      const listing = marketplaceListings.get(data.listingId);
      if (listing) {
        listing.offerCount = (listing.offerCount || 0) + 1;
      }
      return offer;
    }
  },

  async getOffer(id: string) {
    try {
      const offer = await db.query.marketplaceOffers.findFirst({
        where: eq(schema.marketplaceOffers.id, id),
      });
      return offer || null;
    } catch (error) {
      return marketplaceOffers.get(id) || null;
    }
  },

  async getOffersByListing(listingId: string) {
    try {
      return await db.query.marketplaceOffers.findMany({
        where: eq(schema.marketplaceOffers.listingId, listingId),
      });
    } catch (error) {
      return Array.from(marketplaceOffers.values()).filter(o => o.listingId === listingId);
    }
  },

  async updateOffer(id: string, data: Partial<schema.InsertMarketplaceOffer>) {
    try {
      const [updated] = await db.update(schema.marketplaceOffers)
        .set(data)
        .where(eq(schema.marketplaceOffers.id, id))
        .returning();
      return updated || null;
    } catch (error) {
      const offer = marketplaceOffers.get(id);
      if (!offer) return null;
      const updated = { ...offer, ...data };
      marketplaceOffers.set(id, updated);
      return updated;
    }
  },

  async createTransaction(data: schema.InsertMarketplaceTransaction) {
    try {
      const [transaction] = await db.insert(schema.marketplaceTransactions).values(data as any).returning();
      return transaction;
    } catch (error) {
      const transaction = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      marketplaceTransactions.set(transaction.id, transaction);
      return transaction;
    }
  },

  async getTransaction(id: string) {
    try {
      const transaction = await db.query.marketplaceTransactions.findFirst({
        where: eq(schema.marketplaceTransactions.id, id),
      });
      return transaction || null;
    } catch (error) {
      return marketplaceTransactions.get(id) || null;
    }
  },

  async getTransactions(filters: {
    userId?: string;
    listingId?: string;
    status?: string;
    limit?: number;
  }) {
    try {
      let query = db.select().from(schema.marketplaceTransactions);
      const conditions: any[] = [];

      if (filters.userId) {
        conditions.push(
          sql`${schema.marketplaceTransactions.sellerId} = ${filters.userId} OR ${schema.marketplaceTransactions.buyerId} = ${filters.userId}`
        );
      }
      if (filters.listingId) conditions.push(eq(schema.marketplaceTransactions.listingId, filters.listingId));
      if (filters.status) conditions.push(eq(schema.marketplaceTransactions.status, filters.status));

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const transactions = await query;
      return transactions.slice(0, filters.limit || 100);
    } catch (error) {
      let filtered = Array.from(marketplaceTransactions.values());

      if (filters.userId) {
        filtered = filtered.filter(t => t.sellerId === filters.userId || t.buyerId === filters.userId);
      }
      if (filters.listingId) filtered = filtered.filter(t => t.listingId === filters.listingId);
      if (filters.status) filtered = filtered.filter(t => t.status === filters.status);

      return filtered.slice(0, filters.limit || 100);
    }
  },

  async updateTransaction(id: string, data: Partial<schema.InsertMarketplaceTransaction>) {
    try {
      const [updated] = await db.update(schema.marketplaceTransactions)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(eq(schema.marketplaceTransactions.id, id))
        .returning();
      return updated || null;
    } catch (error) {
      const transaction = marketplaceTransactions.get(id);
      if (!transaction) return null;
      const updated = { ...transaction, ...data, updatedAt: new Date() };
      marketplaceTransactions.set(id, updated);
      return updated;
    }
  },

  async createEscrow(data: schema.InsertMarketplaceEscrow) {
    try {
      const [escrow] = await db.insert(schema.marketplaceEscrow).values(data).returning();
      return escrow;
    } catch (error) {
      const escrow = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      marketplaceEscrow.set(escrow.id, escrow);
      return escrow;
    }
  },

  async getEscrow(id: string) {
    try {
      const escrow = await db.query.marketplaceEscrow.findFirst({
        where: eq(schema.marketplaceEscrow.id, id),
      });
      return escrow || null;
    } catch (error) {
      return marketplaceEscrow.get(id) || null;
    }
  },

  async getEscrowByTransaction(transactionId: string) {
    try {
      const escrow = await db.query.marketplaceEscrow.findFirst({
        where: eq(schema.marketplaceEscrow.transactionId, transactionId),
      });
      return escrow || null;
    } catch (error) {
      return Array.from(marketplaceEscrow.values()).find(e => e.transactionId === transactionId) || null;
    }
  },

  async updateEscrow(id: string, data: Partial<schema.InsertMarketplaceEscrow>) {
    try {
      const [updated] = await db.update(schema.marketplaceEscrow)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.marketplaceEscrow.id, id))
        .returning();
      return updated || null;
    } catch (error) {
      const escrow = marketplaceEscrow.get(id);
      if (!escrow) return null;
      const updated = { ...escrow, ...data, updatedAt: new Date() };
      marketplaceEscrow.set(id, updated);
      return updated;
    }
  },

  async createReview(data: schema.InsertMarketplaceReview) {
    try {
      const [review] = await db.insert(schema.marketplaceReviews).values(data).returning();
      return review;
    } catch (error) {
      const review = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      marketplaceReviews.set(review.id, review);
      return review;
    }
  },

  async getReviewsByUser(userId: string) {
    try {
      return await db.query.marketplaceReviews.findMany({
        where: eq(schema.marketplaceReviews.reviewedUserId, userId),
      });
    } catch (error) {
      return Array.from(marketplaceReviews.values()).filter(r => r.reviewedUserId === userId);
    }
  },

  async getOrCreateReputation(userId: string) {
    try {
      let reputation = await db.query.marketplaceReputations.findFirst({
        where: eq(schema.marketplaceReputations.userId, userId),
      });
      
      if (!reputation) {
        [reputation] = await db.insert(schema.marketplaceReputations)
          .values({ userId })
          .returning();
      }
      
      return reputation;
    } catch (error) {
      let reputation = Array.from(marketplaceReputations.values()).find(r => r.userId === userId);
      
      if (!reputation) {
        reputation = {
          id: generateId(),
          userId,
          totalTransactions: 0,
          completedTransactions: 0,
          cancelledTransactions: 0,
          averageRating: 0,
          totalReviews: 0,
          badges: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        marketplaceReputations.set(reputation.id, reputation);
      }
      
      return reputation;
    }
  },

  async updateReputation(userId: string, data: Partial<schema.InsertMarketplaceReputation>) {
    try {
      const [updated] = await db.update(schema.marketplaceReputations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.marketplaceReputations.userId, userId))
        .returning();
      return updated || null;
    } catch (error) {
      const reputation = Array.from(marketplaceReputations.values()).find(r => r.userId === userId);
      if (!reputation) return null;
      const updated = { ...reputation, ...data, updatedAt: new Date() };
      marketplaceReputations.set(reputation.id, updated);
      return updated;
    }
  },

  async getOrCreateSellerVerification(userId: string) {
    try {
      let verification = await db.query.sellerVerification.findFirst({
        where: eq(schema.sellerVerification.userId, userId),
      });
      
      if (!verification) {
        [verification] = await db.insert(schema.sellerVerification)
          .values({ userId })
          .returning();
      }
      
      return verification;
    } catch (error) {
      let verification = Array.from(sellerVerifications.values()).find(v => v.userId === userId);
      
      if (!verification) {
        verification = {
          id: generateId(),
          userId,
          verificationLevel: 'unverified',
          discordVerified: false,
          robloxVerified: false,
          emailVerified: false,
          identityVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        sellerVerifications.set(verification.id, verification);
      }
      
      return verification;
    }
  },

  async updateSellerVerification(userId: string, data: Partial<schema.InsertSellerVerification>) {
    try {
      const [updated] = await db.update(schema.sellerVerification)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.sellerVerification.userId, userId))
        .returning();
      return updated || null;
    } catch (error) {
      const verification = Array.from(sellerVerifications.values()).find(v => v.userId === userId);
      if (!verification) return null;
      const updated = { ...verification, ...data, updatedAt: new Date() };
      sellerVerifications.set(verification.id, updated);
      return updated;
    }
  },

  async createTransactionLog(data: schema.InsertTransactionLog) {
    try {
      const [log] = await db.insert(schema.transactionLogs).values(data).returning();
      return log;
    } catch (error) {
      const log = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
      };
      transactionLogs.set(log.id, log);
      return log;
    }
  },

  async getTransactionLogs(transactionId: string) {
    try {
      return await db.query.transactionLogs.findMany({
        where: eq(schema.transactionLogs.transactionId, transactionId),
      });
    } catch (error) {
      return Array.from(transactionLogs.values())
        .filter(l => l.transactionId === transactionId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  // ===== ADMIN STATISTICS =====

  async getAdminStats() {
    try {
      const [
        pendingListingsCount,
        totalUsersCount,
        totalTransactionsCount,
        totalRevenueResult
      ] = await Promise.all([
        db.select({ count: sql<number>`count(*)::int` })
          .from(schema.marketplaceListings)
          .where(eq(schema.marketplaceListings.status, 'pending')),
        db.select({ count: sql<number>`count(*)::int` })
          .from(schema.users),
        db.select({ count: sql<number>`count(*)::int` })
          .from(schema.marketplaceTransactions),
        db.select({ 
          total: sql<number>`coalesce(sum(amount), 0)::int`,
          completed: sql<number>`count(case when status = 'completed' then 1 end)::int`
        })
          .from(schema.marketplaceTransactions)
      ]);

      return {
        pendingListings: pendingListingsCount[0]?.count || 0,
        totalUsers: totalUsersCount[0]?.count || 0,
        totalTransactions: totalTransactionsCount[0]?.count || 0,
        completedTransactions: totalRevenueResult[0]?.completed || 0,
        totalRevenue: totalRevenueResult[0]?.total || 0,
      };
    } catch (error) {
      // Fallback to in-memory counts
      const pendingListings = Array.from(marketplaceListings.values())
        .filter(l => l.status === 'pending').length;
      const totalUsers = users.size;
      const allTransactions = Array.from(marketplaceTransactions.values());
      const completedTransactions = allTransactions.filter(t => t.status === 'completed');
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      return {
        pendingListings,
        totalUsers,
        totalTransactions: allTransactions.length,
        completedTransactions: completedTransactions.length,
        totalRevenue,
      };
    }
  },
};
