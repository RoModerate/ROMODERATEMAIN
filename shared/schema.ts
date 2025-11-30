import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer, boolean, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordId: varchar("discord_id").notNull().unique(),
  username: text("username").notNull(),
  discriminator: text("discriminator"),
  avatar: text("avatar"),
  email: text("email"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tosAcceptedAt: timestamp("tos_accepted_at"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  encrypted: boolean("encrypted").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const servers = pgTable("servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordServerId: varchar("discord_server_id").notNull().unique(),
  name: text("name").notNull(),
  icon: text("icon"),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  botClientId: varchar("bot_client_id"),
  botTokenEncrypted: text("bot_token_encrypted"),
  botLinked: boolean("bot_linked").default(false),
  linkKey: varchar("link_key"),
  linkKeyExpiresAt: timestamp("link_key_expires_at"),
  lastLinkedAt: timestamp("last_linked_at"),
  settings: json("settings").$type<{
    accentColor?: string;
    features?: string[];
    webhookUrl?: string;
    rateLimits?: { perUser: number; perServer: number };
    reportsChannel?: string;
    reportLogsChannel?: string;
    appealsCategory?: string;
    appealLogsChannel?: string;
    ticketsChannel?: string;
    moderatorChatEnabled?: boolean;
    setupCompleted?: boolean;
    robloxApiKey?: string;
    robloxUniverseId?: string;
    botKey?: string;
    banAppealWebhook?: string;
    banAppealFormLink?: string;
    hideSupportLink?: boolean;
    maxReportsPerDay?: number;
    enableAutoModeration?: boolean;
    evidenceServices?: {
      youtube: { enabled: boolean; whitelist: string[] };
      medal: { enabled: boolean; whitelist: string[] };
      imgur: { enabled: boolean; whitelist: string[] };
      streamable: { enabled: boolean; whitelist: string[] };
    };
    advancedSettings?: {
      autoModeration: boolean;
      requireApproval: boolean;
      logAllActions: boolean;
      webhookNotifications: boolean;
    };
    ticketConfig?: {
      enabled: boolean;
      categories: Array<{
        id: string;
        name: string;
        description?: string;
        emoji?: string;
        autoResponse?: string;
      }>;
      panels?: Array<{
        id: string;
        title: string;
        description?: string;
        channelId?: string;
        messageId?: string;
        buttons: Array<{
          id: string;
          label: string;
          emoji?: string;
          categoryId: string;
          style: 'primary' | 'secondary' | 'success' | 'danger';
        }>;
      }>;
    };
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const botRegistrations = pgTable("bot_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").notNull().unique(),
  botName: text("bot_name").notNull(),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  ownerUserId: varchar("owner_user_id").notNull().references(() => users.id),
  webhookUrl: text("webhook_url"),
  secretHash: text("secret_hash").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  keyPreview: text("key_preview").notNull(),
  scopes: text("scopes").array().notNull().default(sql`ARRAY[]::text[]`),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bans = pgTable("bans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  robloxUserId: varchar("roblox_user_id").notNull(),
  robloxUsername: text("roblox_username").notNull(),
  discordUserId: varchar("discord_user_id"),
  reason: text("reason").notNull(),
  bannedBy: varchar("banned_by").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  metadata: json("metadata").$type<{
    gameId?: string;
    gameName?: string;
    evidence?: string[];
    notes?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  robloxUserId: varchar("roblox_user_id").notNull(),
  robloxUsername: text("roblox_username").notNull(),
  reason: text("reason").notNull(),
  reportedBy: varchar("reported_by").notNull(),
  reportedByUsername: text("reported_by_username"),
  status: text("status").notNull().default("pending"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewNote: text("review_note"),
  reviewedAt: timestamp("reviewed_at"),
  evidence: text("evidence").array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appeals = pgTable("appeals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  banId: varchar("ban_id").notNull().references(() => bans.id),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  discordUserId: varchar("discord_user_id"),
  appealText: text("appeal_text").notNull(),
  status: text("status").notNull().default("pending"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewNote: text("review_note"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  discordUserId: varchar("discord_user_id").notNull(),
  discordUsername: text("discord_username").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("general"),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  closedBy: varchar("closed_by").references(() => users.id),
  closedAt: timestamp("closed_at"),
  metadata: json("metadata").$type<{
    tags?: string[];
    relatedBanId?: string;
    attachments?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serverMembers = pgTable("server_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("moderator"),
  permissions: text("permissions").array().notNull().default(sql`ARRAY[]::text[]`),
  invitedBy: varchar("invited_by").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  uniqueServerUser: sql`UNIQUE(${table.serverId}, ${table.userId})`,
}));

export const pendingMemberRequests = pgTable("pending_member_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  inviteCode: text("invite_code").notNull(),
  requestedRole: text("requested_role").notNull().default("moderator"),
  requestedPermissions: text("requested_permissions").array().notNull().default(sql`ARRAY[]::text[]`),
  status: text("status").notNull().default("pending"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewNote: text("review_note"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniquePendingServerUser: sql`UNIQUE(${table.serverId}, ${table.userId}) WHERE ${table.status} = 'pending'`,
}));

export const inviteCodes = pgTable("invite_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  role: text("role").notNull().default("moderator"),
  permissions: text("permissions").array().notNull().default(sql`ARRAY[]::text[]`),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const playerRiskScores = pgTable("player_risk_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  robloxUserId: varchar("roblox_user_id").notNull(),
  robloxUsername: text("roblox_username").notNull(),
  riskScore: integer("risk_score").notNull().default(0),
  reportCount: integer("report_count").notNull().default(0),
  banCount: integer("ban_count").notNull().default(0),
  metadata: json("metadata").$type<{
    factors?: { type: string; weight: number }[];
    lastCalculated?: string;
  }>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueServerPlayer: sql`UNIQUE(${table.serverId}, ${table.robloxUserId})`,
}));

export const moderatorNotes = pgTable("moderator_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  robloxUserId: varchar("roblox_user_id").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  note: text("note").notNull(),
  isImportant: boolean("is_important").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const autoActions = pgTable("auto_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  name: text("name").notNull(),
  trigger: text("trigger").notNull(),
  conditions: json("conditions").$type<{
    reportCount?: number;
    trustedModCount?: number;
    timeWindow?: number;
  }>().notNull(),
  action: text("action").notNull(),
  actionParams: json("action_params").$type<{
    duration?: number;
    reason?: string;
    notifyUser?: boolean;
  }>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evidenceFiles = pgTable("evidence_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  banId: varchar("ban_id").references(() => bans.id),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const discordBots = pgTable("discord_bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  botTokenEncrypted: text("bot_token_encrypted").notNull(),
  botId: varchar("bot_id").notNull().unique(),
  botName: text("bot_name").notNull(),
  status: text("status").notNull().default("inactive"),
  features: text("features").array().notNull().default(sql`ARRAY[]::text[]`),
  lastOnline: timestamp("last_online"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const robloxApiKeys = pgTable("roblox_api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  name: text("name").notNull(),
  apiKeyEncrypted: text("api_key_encrypted").notNull(),
  universeId: varchar("universe_id"),
  scopes: text("scopes").array().notNull().default(sql`ARRAY[]::text[]`),
  lastUsedAt: timestamp("last_used_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  serverId: varchar("server_id").references(() => servers.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  metadata: json("metadata").$type<{
    banId?: string;
    appealId?: string;
    ticketId?: string;
    memberId?: string;
    link?: string;
  }>(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  serverId: varchar("server_id").references(() => servers.id),
  enabledTypes: text("enabled_types").array().notNull().default(sql`ARRAY['new_ban', 'new_appeal', 'new_ticket', 'new_member', 'system_update']::text[]`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const moderatorShifts = pgTable("moderator_shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: text("status").notNull().default("active"),
  metrics: json("metrics").$type<{
    actionsCount?: number;
    bansIssued?: number;
    appealsReviewed?: number;
    ticketsHandled?: number;
    reportsProcessed?: number;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueActiveShift: sql`UNIQUE(${table.userId}, ${table.serverId}) WHERE ${table.status} = 'active'`,
}));

export const serverChannels = pgTable("server_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  discordChannelId: varchar("discord_channel_id").notNull(),
  name: text("name").notNull(),
  channelType: text("channel_type").notNull(),
  parentId: varchar("parent_id"),
  position: integer("position"),
  lastSynced: timestamp("last_synced").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueServerChannel: sql`UNIQUE(${table.serverId}, ${table.discordChannelId})`,
}));

export const serverOnboardingState = pgTable("server_onboarding_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id).unique(),
  currentStep: integer("current_step").notNull().default(1),
  completedSteps: text("completed_steps").array().notNull().default(sql`ARRAY[]::text[]`),
  channelSelections: json("channel_selections").$type<{
    reportsChannel?: string;
    reportLogsChannel?: string;
    appealsCategory?: string;
    appealLogsChannel?: string;
    ticketsChannel?: string;
  }>().default({}),
  botTokenSet: boolean("bot_token_set").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moderationLogs = pgTable("moderation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  moderatorId: varchar("moderator_id").notNull().references(() => users.id),
  shiftId: varchar("shift_id").references(() => moderatorShifts.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: varchar("target_id"),
  targetUsername: text("target_username"),
  details: json("details").$type<{
    reason?: string;
    duration?: string;
    evidence?: string[];
    notes?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commandLogs = pgTable("command_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  executedBy: varchar("executed_by").notNull().references(() => users.id),
  commandName: text("command_name").notNull(),
  parameters: json("parameters").$type<{
    [key: string]: any;
  }>(),
  executionSource: text("execution_source").notNull().default("dashboard"),
  status: text("status").notNull().default("pending"),
  result: json("result").$type<{
    success?: boolean;
    message?: string;
    error?: string;
    data?: any;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serverBranding = pgTable("server_branding", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id).unique(),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  customDescription: text("custom_description"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#6B21A8"),
  secondaryColor: varchar("secondary_color", { length: 7 }),
  customDomain: text("custom_domain"),
  publicProfileEnabled: boolean("public_profile_enabled").notNull().default(false),
  showStatistics: boolean("show_statistics").notNull().default(true),
  showTeamMembers: boolean("show_team_members").notNull().default(false),
  socialLinks: json("social_links").$type<{
    website?: string;
    discord?: string;
    discordServer?: string;
    twitter?: string;
    youtube?: string;
    twitch?: string;
    tiktok?: string;
    robloxGroup?: string;
  }>(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const premiumSubscriptions = pgTable("premium_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id).unique(),
  tier: text("tier").notNull().default("free"),
  status: text("status").notNull().default("active"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  features: text("features").array().notNull().default(sql`ARRAY['basic_moderation', 'ticket_system']::text[]`),
  metadata: json("metadata").$type<{
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    cancelAtPeriodEnd?: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activityExports = pgTable("activity_exports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  requestedBy: varchar("requested_by").notNull().references(() => users.id),
  exportType: text("export_type").notNull(),
  dateRange: json("date_range").$type<{
    startDate: string;
    endDate: string;
  }>().notNull(),
  filters: json("filters").$type<{
    actionTypes?: string[];
    moderators?: string[];
    status?: string;
  }>(),
  status: text("status").notNull().default("pending"),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  recordCount: integer("record_count"),
  errorMessage: text("error_message"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  snapshotDate: timestamp("snapshot_date").notNull(),
  totalBans: integer("total_bans").notNull().default(0),
  activeBans: integer("active_bans").notNull().default(0),
  totalAppeals: integer("total_appeals").notNull().default(0),
  pendingAppeals: integer("pending_appeals").notNull().default(0),
  approvedAppeals: integer("approved_appeals").notNull().default(0),
  rejectedAppeals: integer("rejected_appeals").notNull().default(0),
  totalTickets: integer("total_tickets").notNull().default(0),
  openTickets: integer("open_tickets").notNull().default(0),
  closedTickets: integer("closed_tickets").notNull().default(0),
  totalReports: integer("total_reports").notNull().default(0),
  pendingReports: integer("pending_reports").notNull().default(0),
  activeShifts: integer("active_shifts").notNull().default(0),
  totalModerators: integer("total_moderators").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueServerDate: sql`UNIQUE(${table.serverId}, ${table.snapshotDate})`,
}));

export const marketplaceListings = pgTable("marketplace_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  serverId: varchar("server_id").references(() => servers.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  itemType: text("item_type").notNull(),
  robloxAssetId: varchar("roblox_asset_id"),
  price: integer("price").notNull(),
  currency: text("currency").notNull().default("robux"),
  images: text("images").array().default(sql`ARRAY[]::text[]`),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  status: text("status").notNull().default("active"),
  viewCount: integer("view_count").notNull().default(0),
  offerCount: integer("offer_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceOffers = pgTable("marketplace_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => marketplaceListings.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  offerAmount: integer("offer_amount").notNull(),
  currency: text("currency").notNull().default("robux"),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceReviews = pgTable("marketplace_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull(),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  reviewedUserId: varchar("reviewed_user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueTransactionReviewer: sql`UNIQUE(${table.transactionId}, ${table.reviewerId})`,
}));

export const marketplaceReputations = pgTable("marketplace_reputations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  totalTransactions: integer("total_transactions").notNull().default(0),
  completedTransactions: integer("completed_transactions").notNull().default(0),
  cancelledTransactions: integer("cancelled_transactions").notNull().default(0),
  averageRating: real("average_rating").notNull().default(0),
  totalReviews: integer("total_reviews").notNull().default(0),
  badges: text("badges").array().default(sql`ARRAY[]::text[]`),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceTransactions = pgTable("marketplace_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => marketplaceListings.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("robux"),
  status: text("status").notNull().default("pending"),
  escrowStatus: text("escrow_status").notNull().default("pending"),
  metadata: json("metadata").$type<{
    itemDetails?: Record<string, any>;
    deliveryMethod?: string;
    paymentProof?: string[];
    deliveryProof?: string[];
    notes?: string;
  }>(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceEscrow = pgTable("marketplace_escrow", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull().references(() => marketplaceTransactions.id).unique(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("robux"),
  status: text("status").notNull().default("held"),
  buyerConfirmed: boolean("buyer_confirmed").notNull().default(false),
  sellerConfirmed: boolean("seller_confirmed").notNull().default(false),
  releasedAt: timestamp("released_at"),
  disputeReason: text("dispute_reason"),
  disputeOpenedAt: timestamp("dispute_opened_at"),
  disputeResolvedAt: timestamp("dispute_resolved_at"),
  disputeResolvedBy: varchar("dispute_resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sellerVerification = pgTable("seller_verification", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  verificationLevel: text("verification_level").notNull().default("unverified"),
  discordVerified: boolean("discord_verified").notNull().default(false),
  robloxVerified: boolean("roblox_verified").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  identityVerified: boolean("identity_verified").notNull().default(false),
  robloxUserId: varchar("roblox_user_id"),
  robloxUsername: text("roblox_username"),
  verificationNotes: text("verification_notes"),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactionLogs = pgTable("transaction_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").notNull().references(() => marketplaceTransactions.id),
  action: text("action").notNull(),
  performedBy: varchar("performed_by").references(() => users.id),
  details: json("details").$type<Record<string, any>>(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceWishlist = pgTable("marketplace_wishlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  listingId: varchar("listing_id").notNull().references(() => marketplaceListings.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserListing: sql`UNIQUE(${table.userId}, ${table.listingId})`,
}));

export const marketplaceBundles = pgTable("marketplace_bundles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  listingIds: text("listing_ids").array().notNull(),
  bundlePrice: integer("bundle_price").notNull(),
  currency: text("currency").notNull().default("robux"),
  discount: integer("discount").notNull().default(0),
  images: text("images").array().default(sql`ARRAY[]::text[]`),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceAuctions = pgTable("marketplace_auctions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => marketplaceListings.id).unique(),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  startingBid: integer("starting_bid").notNull(),
  currentBid: integer("current_bid").notNull(),
  highestBidderId: varchar("highest_bidder_id").references(() => users.id),
  buyNowPrice: integer("buy_now_price"),
  currency: text("currency").notNull().default("robux"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("active"),
  bidCount: integer("bid_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceAuctionBids = pgTable("marketplace_auction_bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auctionId: varchar("auction_id").notNull().references(() => marketplaceAuctions.id),
  bidderId: varchar("bidder_id").notNull().references(() => users.id),
  bidAmount: integer("bid_amount").notNull(),
  isAutoBid: boolean("is_auto_bid").notNull().default(false),
  maxAutoBidAmount: integer("max_auto_bid_amount"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceFlashSales = pgTable("marketplace_flash_sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  listingIds: text("listing_ids").array().notNull(),
  discount: integer("discount").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("scheduled"),
  maxPurchases: integer("max_purchases"),
  currentPurchases: integer("current_purchases").notNull().default(0),
  images: text("images").array().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceReferrals = pgTable("marketplace_referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id),
  referralCode: text("referral_code").notNull(),
  status: text("status").notNull().default("pending"),
  rewardAmount: integer("reward_amount").notNull().default(0),
  rewardClaimed: boolean("reward_claimed").notNull().default(false),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueReferredUser: sql`UNIQUE(${table.referredUserId})`,
}));

export const marketplaceStorefronts = pgTable("marketplace_storefronts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  bannerImage: text("banner_image"),
  logoImage: text("logo_image"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#D946EF"),
  secondaryColor: varchar("secondary_color", { length: 7 }),
  featuredListingIds: text("featured_listing_ids").array().default(sql`ARRAY[]::text[]`),
  socialLinks: json("social_links").$type<{
    discord?: string;
    twitter?: string;
    youtube?: string;
    roblox?: string;
  }>(),
  isPublic: boolean("is_public").notNull().default(true),
  customUrl: text("custom_url").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceLevels = pgTable("marketplace_levels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  totalSales: integer("total_sales").notNull().default(0),
  totalPurchases: integer("total_purchases").notNull().default(0),
  achievementIds: text("achievement_ids").array().default(sql`ARRAY[]::text[]`),
  challengeProgress: json("challenge_progress").$type<{
    daily?: Record<string, number>;
    weekly?: Record<string, number>;
    lifetime?: Record<string, number>;
  }>(),
  lastDailyReset: timestamp("last_daily_reset").defaultNow().notNull(),
  lastWeeklyReset: timestamp("last_weekly_reset").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketplaceAchievements = pgTable("marketplace_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  achievementId: text("achievement_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  category: text("category").notNull(),
  requirement: integer("requirement").notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
  badgeReward: text("badge_reward"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceLeaderboards = pgTable("marketplace_leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  score: integer("score").notNull().default(0),
  rank: integer("rank").notNull().default(0),
  periodType: text("period_type").notNull().default("all_time"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserCategoryPeriod: sql`UNIQUE(${table.userId}, ${table.category}, ${table.periodType})`,
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  servers: many(servers),
  botRegistrations: many(botRegistrations),
  bannedUsers: many(bans),
  reviewedAppeals: many(appeals),
  assignedTickets: many(tickets, { relationName: "assignedTickets" }),
  closedTickets: many(tickets, { relationName: "closedTickets" }),
  serverMemberships: many(serverMembers),
  createdInvites: many(inviteCodes),
  moderatorNotes: many(moderatorNotes),
  evidenceFiles: many(evidenceFiles),
  notifications: many(notifications),
  notificationPreferences: one(notificationPreferences),
}));

export const serversRelations = relations(servers, ({ one, many }) => ({
  owner: one(users, {
    fields: [servers.ownerId],
    references: [users.id],
  }),
  botRegistrations: many(botRegistrations),
  apiKeys: many(apiKeys),
  bans: many(bans),
  appeals: many(appeals),
  tickets: many(tickets),
  members: many(serverMembers),
  pendingRequests: many(pendingMemberRequests),
  inviteCodes: many(inviteCodes),
  playerRiskScores: many(playerRiskScores),
  moderatorNotes: many(moderatorNotes),
  autoActions: many(autoActions),
  evidenceFiles: many(evidenceFiles),
  discordBots: many(discordBots),
  robloxApiKeys: many(robloxApiKeys),
  notifications: many(notifications),
  moderatorShifts: many(moderatorShifts),
  serverChannels: many(serverChannels),
  moderationLogs: many(moderationLogs),
  onboardingState: one(serverOnboardingState),
  branding: one(serverBranding),
  premiumSubscription: one(premiumSubscriptions),
  activityExports: many(activityExports),
  analyticsSnapshots: many(analyticsSnapshots),
}));

export const botRegistrationsRelations = relations(botRegistrations, ({ one }) => ({
  server: one(servers, {
    fields: [botRegistrations.serverId],
    references: [servers.id],
  }),
  owner: one(users, {
    fields: [botRegistrations.ownerUserId],
    references: [users.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  server: one(servers, {
    fields: [apiKeys.serverId],
    references: [servers.id],
  }),
}));

export const bansRelations = relations(bans, ({ one, many }) => ({
  server: one(servers, {
    fields: [bans.serverId],
    references: [servers.id],
  }),
  bannedByUser: one(users, {
    fields: [bans.bannedBy],
    references: [users.id],
  }),
  appeals: many(appeals),
}));

export const appealsRelations = relations(appeals, ({ one }) => ({
  ban: one(bans, {
    fields: [appeals.banId],
    references: [bans.id],
  }),
  server: one(servers, {
    fields: [appeals.serverId],
    references: [servers.id],
  }),
  reviewer: one(users, {
    fields: [appeals.reviewedBy],
    references: [users.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  server: one(servers, {
    fields: [tickets.serverId],
    references: [servers.id],
  }),
  assignee: one(users, {
    fields: [tickets.assignedTo],
    references: [users.id],
    relationName: "assignedTickets",
  }),
  closer: one(users, {
    fields: [tickets.closedBy],
    references: [users.id],
    relationName: "closedTickets",
  }),
}));

export const serverMembersRelations = relations(serverMembers, ({ one }) => ({
  server: one(servers, {
    fields: [serverMembers.serverId],
    references: [servers.id],
  }),
  user: one(users, {
    fields: [serverMembers.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [serverMembers.invitedBy],
    references: [users.id],
  }),
}));

export const pendingMemberRequestsRelations = relations(pendingMemberRequests, ({ one }) => ({
  server: one(servers, {
    fields: [pendingMemberRequests.serverId],
    references: [servers.id],
  }),
  user: one(users, {
    fields: [pendingMemberRequests.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [pendingMemberRequests.reviewedBy],
    references: [users.id],
  }),
}));

export const inviteCodesRelations = relations(inviteCodes, ({ one }) => ({
  server: one(servers, {
    fields: [inviteCodes.serverId],
    references: [servers.id],
  }),
  creator: one(users, {
    fields: [inviteCodes.createdBy],
    references: [users.id],
  }),
}));

export const playerRiskScoresRelations = relations(playerRiskScores, ({ one }) => ({
  server: one(servers, {
    fields: [playerRiskScores.serverId],
    references: [servers.id],
  }),
}));

export const moderatorNotesRelations = relations(moderatorNotes, ({ one }) => ({
  server: one(servers, {
    fields: [moderatorNotes.serverId],
    references: [servers.id],
  }),
  author: one(users, {
    fields: [moderatorNotes.authorId],
    references: [users.id],
  }),
}));

export const autoActionsRelations = relations(autoActions, ({ one }) => ({
  server: one(servers, {
    fields: [autoActions.serverId],
    references: [servers.id],
  }),
}));

export const evidenceFilesRelations = relations(evidenceFiles, ({ one }) => ({
  server: one(servers, {
    fields: [evidenceFiles.serverId],
    references: [servers.id],
  }),
  ban: one(bans, {
    fields: [evidenceFiles.banId],
    references: [bans.id],
  }),
  uploader: one(users, {
    fields: [evidenceFiles.uploadedBy],
    references: [users.id],
  }),
}));

export const discordBotsRelations = relations(discordBots, ({ one }) => ({
  server: one(servers, {
    fields: [discordBots.serverId],
    references: [servers.id],
  }),
}));

export const robloxApiKeysRelations = relations(robloxApiKeys, ({ one }) => ({
  server: one(servers, {
    fields: [robloxApiKeys.serverId],
    references: [servers.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [notifications.serverId],
    references: [servers.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [notificationPreferences.serverId],
    references: [servers.id],
  }),
}));

export const moderatorShiftsRelations = relations(moderatorShifts, ({ one }) => ({
  server: one(servers, {
    fields: [moderatorShifts.serverId],
    references: [servers.id],
  }),
  user: one(users, {
    fields: [moderatorShifts.userId],
    references: [users.id],
  }),
}));

export const serverChannelsRelations = relations(serverChannels, ({ one }) => ({
  server: one(servers, {
    fields: [serverChannels.serverId],
    references: [servers.id],
  }),
}));

export const serverOnboardingStateRelations = relations(serverOnboardingState, ({ one }) => ({
  server: one(servers, {
    fields: [serverOnboardingState.serverId],
    references: [servers.id],
  }),
}));

export const moderationLogsRelations = relations(moderationLogs, ({ one }) => ({
  server: one(servers, {
    fields: [moderationLogs.serverId],
    references: [servers.id],
  }),
  moderator: one(users, {
    fields: [moderationLogs.moderatorId],
    references: [users.id],
  }),
  shift: one(moderatorShifts, {
    fields: [moderationLogs.shiftId],
    references: [moderatorShifts.id],
  }),
}));

export const serverBrandingRelations = relations(serverBranding, ({ one }) => ({
  server: one(servers, {
    fields: [serverBranding.serverId],
    references: [servers.id],
  }),
}));

export const premiumSubscriptionsRelations = relations(premiumSubscriptions, ({ one }) => ({
  server: one(servers, {
    fields: [premiumSubscriptions.serverId],
    references: [servers.id],
  }),
}));

export const activityExportsRelations = relations(activityExports, ({ one }) => ({
  server: one(servers, {
    fields: [activityExports.serverId],
    references: [servers.id],
  }),
  requestedByUser: one(users, {
    fields: [activityExports.requestedBy],
    references: [users.id],
  }),
}));

export const analyticsSnapshotsRelations = relations(analyticsSnapshots, ({ one }) => ({
  server: one(servers, {
    fields: [analyticsSnapshots.serverId],
    references: [servers.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertServerSchema = createInsertSchema(servers).omit({
  id: true,
  createdAt: true,
});

export const insertBotRegistrationSchema = createInsertSchema(botRegistrations).omit({
  id: true,
  createdAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export const insertBanSchema = createInsertSchema(bans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertAppealSchema = createInsertSchema(appeals).omit({
  id: true,
  createdAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServerMemberSchema = createInsertSchema(serverMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertPendingMemberRequestSchema = createInsertSchema(pendingMemberRequests).omit({
  id: true,
  createdAt: true,
});

export const insertInviteCodeSchema = createInsertSchema(inviteCodes).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerRiskScoreSchema = createInsertSchema(playerRiskScores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModeratorNoteSchema = createInsertSchema(moderatorNotes).omit({
  id: true,
  createdAt: true,
});

export const insertAutoActionSchema = createInsertSchema(autoActions).omit({
  id: true,
  createdAt: true,
});

export const insertEvidenceFileSchema = createInsertSchema(evidenceFiles).omit({
  id: true,
  createdAt: true,
});

export const insertDiscordBotSchema = createInsertSchema(discordBots).omit({
  id: true,
  createdAt: true,
});

export const insertRobloxApiKeySchema = createInsertSchema(robloxApiKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModeratorShiftSchema = createInsertSchema(moderatorShifts).omit({
  id: true,
  createdAt: true,
});

export const insertServerChannelSchema = createInsertSchema(serverChannels).omit({
  id: true,
  createdAt: true,
  lastSynced: true,
});

export const insertServerOnboardingStateSchema = createInsertSchema(serverOnboardingState).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModerationLogSchema = createInsertSchema(moderationLogs).omit({
  id: true,
  createdAt: true,
});

export const insertCommandLogSchema = createInsertSchema(commandLogs).omit({
  id: true,
  createdAt: true,
});

export const insertServerBrandingSchema = createInsertSchema(serverBranding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPremiumSubscriptionSchema = createInsertSchema(premiumSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityExportSchema = createInsertSchema(activityExports).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertAnalyticsSnapshotSchema = createInsertSchema(analyticsSnapshots).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  offerCount: true,
});

export const insertMarketplaceOfferSchema = createInsertSchema(marketplaceOffers).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceReviewSchema = createInsertSchema(marketplaceReviews).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceReputationSchema = createInsertSchema(marketplaceReputations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceTransactionSchema = createInsertSchema(marketplaceTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceEscrowSchema = createInsertSchema(marketplaceEscrow).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSellerVerificationSchema = createInsertSchema(sellerVerification).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionLogSchema = createInsertSchema(transactionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceWishlistSchema = createInsertSchema(marketplaceWishlist).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceBundleSchema = createInsertSchema(marketplaceBundles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceAuctionSchema = createInsertSchema(marketplaceAuctions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  bidCount: true,
});

export const insertMarketplaceAuctionBidSchema = createInsertSchema(marketplaceAuctionBids).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceFlashSaleSchema = createInsertSchema(marketplaceFlashSales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentPurchases: true,
});

export const insertMarketplaceReferralSchema = createInsertSchema(marketplaceReferrals).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceStorefrontSchema = createInsertSchema(marketplaceStorefronts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceLevelSchema = createInsertSchema(marketplaceLevels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceAchievementSchema = createInsertSchema(marketplaceAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceLeaderboardSchema = createInsertSchema(marketplaceLeaderboards).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

export type InsertServer = z.infer<typeof insertServerSchema>;
export type Server = typeof servers.$inferSelect;

export type InsertBotRegistration = z.infer<typeof insertBotRegistrationSchema>;
export type BotRegistration = typeof botRegistrations.$inferSelect;

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

export type InsertBan = z.infer<typeof insertBanSchema>;
export type Ban = typeof bans.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export type InsertAppeal = z.infer<typeof insertAppealSchema>;
export type Appeal = typeof appeals.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export type InsertServerMember = z.infer<typeof insertServerMemberSchema>;
export type ServerMember = typeof serverMembers.$inferSelect;

export type InsertPendingMemberRequest = z.infer<typeof insertPendingMemberRequestSchema>;
export type PendingMemberRequest = typeof pendingMemberRequests.$inferSelect;

export type InsertInviteCode = z.infer<typeof insertInviteCodeSchema>;
export type InviteCode = typeof inviteCodes.$inferSelect;

export type InsertPlayerRiskScore = z.infer<typeof insertPlayerRiskScoreSchema>;
export type PlayerRiskScore = typeof playerRiskScores.$inferSelect;

export type InsertModeratorNote = z.infer<typeof insertModeratorNoteSchema>;
export type ModeratorNote = typeof moderatorNotes.$inferSelect;

export type InsertAutoAction = z.infer<typeof insertAutoActionSchema>;
export type AutoAction = typeof autoActions.$inferSelect;

export type InsertEvidenceFile = z.infer<typeof insertEvidenceFileSchema>;
export type EvidenceFile = typeof evidenceFiles.$inferSelect;

export type InsertDiscordBot = z.infer<typeof insertDiscordBotSchema>;
export type DiscordBot = typeof discordBots.$inferSelect;

export type InsertRobloxApiKey = z.infer<typeof insertRobloxApiKeySchema>;
export type RobloxApiKey = typeof robloxApiKeys.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;

export type InsertModeratorShift = z.infer<typeof insertModeratorShiftSchema>;
export type ModeratorShift = typeof moderatorShifts.$inferSelect;

export type InsertServerChannel = z.infer<typeof insertServerChannelSchema>;
export type ServerChannel = typeof serverChannels.$inferSelect;

export type InsertServerOnboardingState = z.infer<typeof insertServerOnboardingStateSchema>;
export type ServerOnboardingState = typeof serverOnboardingState.$inferSelect;

export type InsertModerationLog = z.infer<typeof insertModerationLogSchema>;
export type ModerationLog = typeof moderationLogs.$inferSelect;

export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;
export type CommandLog = typeof commandLogs.$inferSelect;

export type InsertServerBranding = z.infer<typeof insertServerBrandingSchema>;
export type ServerBranding = typeof serverBranding.$inferSelect;

export type InsertPremiumSubscription = z.infer<typeof insertPremiumSubscriptionSchema>;
export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;

export type InsertActivityExport = z.infer<typeof insertActivityExportSchema>;
export type ActivityExport = typeof activityExports.$inferSelect;

export type InsertAnalyticsSnapshot = z.infer<typeof insertAnalyticsSnapshotSchema>;
export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;

export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;

export type InsertMarketplaceOffer = z.infer<typeof insertMarketplaceOfferSchema>;
export type MarketplaceOffer = typeof marketplaceOffers.$inferSelect;

export type InsertMarketplaceReview = z.infer<typeof insertMarketplaceReviewSchema>;
export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;

export type InsertMarketplaceReputation = z.infer<typeof insertMarketplaceReputationSchema>;
export type MarketplaceReputation = typeof marketplaceReputations.$inferSelect;

export type InsertMarketplaceTransaction = z.infer<typeof insertMarketplaceTransactionSchema>;
export type MarketplaceTransaction = typeof marketplaceTransactions.$inferSelect;

export type InsertMarketplaceEscrow = z.infer<typeof insertMarketplaceEscrowSchema>;
export type MarketplaceEscrow = typeof marketplaceEscrow.$inferSelect;

export type InsertSellerVerification = z.infer<typeof insertSellerVerificationSchema>;
export type SellerVerification = typeof sellerVerification.$inferSelect;

export type InsertTransactionLog = z.infer<typeof insertTransactionLogSchema>;
export type TransactionLog = typeof transactionLogs.$inferSelect;

export type InsertMarketplaceWishlist = z.infer<typeof insertMarketplaceWishlistSchema>;
export type MarketplaceWishlist = typeof marketplaceWishlist.$inferSelect;

export type InsertMarketplaceBundle = z.infer<typeof insertMarketplaceBundleSchema>;
export type MarketplaceBundle = typeof marketplaceBundles.$inferSelect;

export type InsertMarketplaceAuction = z.infer<typeof insertMarketplaceAuctionSchema>;
export type MarketplaceAuction = typeof marketplaceAuctions.$inferSelect;

export type InsertMarketplaceAuctionBid = z.infer<typeof insertMarketplaceAuctionBidSchema>;
export type MarketplaceAuctionBid = typeof marketplaceAuctionBids.$inferSelect;

export type InsertMarketplaceFlashSale = z.infer<typeof insertMarketplaceFlashSaleSchema>;
export type MarketplaceFlashSale = typeof marketplaceFlashSales.$inferSelect;

export type InsertMarketplaceReferral = z.infer<typeof insertMarketplaceReferralSchema>;
export type MarketplaceReferral = typeof marketplaceReferrals.$inferSelect;

export type InsertMarketplaceStorefront = z.infer<typeof insertMarketplaceStorefrontSchema>;
export type MarketplaceStorefront = typeof marketplaceStorefronts.$inferSelect;

export type InsertMarketplaceLevel = z.infer<typeof insertMarketplaceLevelSchema>;
export type MarketplaceLevel = typeof marketplaceLevels.$inferSelect;

export type InsertMarketplaceAchievement = z.infer<typeof insertMarketplaceAchievementSchema>;
export type MarketplaceAchievement = typeof marketplaceAchievements.$inferSelect;

export type InsertMarketplaceLeaderboard = z.infer<typeof insertMarketplaceLeaderboardSchema>;
export type MarketplaceLeaderboard = typeof marketplaceLeaderboards.$inferSelect;

export const changelogs = pgTable("changelogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  title: text("title").notNull(),
  version: text("version").notNull(),
  content: text("content").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  authorId: varchar("author_id").references(() => users.id),
  category: text("category").default("general"),
  emoji: text("emoji"),
  postedToDiscord: boolean("posted_to_discord").default(false),
  discordMessageId: text("discord_message_id"),
});

export const insertChangelogSchema = createInsertSchema(changelogs).omit({
  id: true,
  publishedAt: true,
});

export type InsertChangelog = z.infer<typeof insertChangelogSchema>;
export type Changelog = typeof changelogs.$inferSelect;
