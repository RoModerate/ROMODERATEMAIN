import { decryptToken } from "./encryption";

export interface RobloxBanRequest {
  universeId: string;
  userId: string;
  apiKey: string;
  privateReason: string;
  displayReason: string;
  duration?: number;
  excludeAltAccounts: boolean;
}

export interface RobloxBanResponse {
  success: boolean;
  statusCode?: number;
  data?: any;
  error?: string;
  altAccountsRestricted?: boolean;
}

export interface RobloxUnbanRequest {
  universeId: string;
  userId: string;
  apiKey: string;
}

export interface AltDetectionResult {
  isLikelyAlt: boolean;
  confidence: number;
  reasons: string[];
  metadata: {
    accountAge?: number;
    sharedIPs?: string[];
    knownAlts?: string[];
    creationDate?: string;
  };
}

class RobloxCloudService {
  private readonly ROBLOX_CLOUD_BASE = "https://apis.roblox.com/cloud/v2";

  async banUser(request: RobloxBanRequest): Promise<RobloxBanResponse> {
    try {
      const endpoint = `${this.ROBLOX_CLOUD_BASE}/universes/${request.universeId}/user-restrictions/${request.userId}`;
      
      const body: any = {
        gameJoinRestriction: {
          active: true,
          privateReason: request.privateReason,
          displayReason: request.displayReason,
          excludeAltAccounts: request.excludeAltAccounts,
        },
      };

      if (request.duration && request.duration > 0) {
        const durationInSeconds = request.duration * 24 * 60 * 60;
        body.gameJoinRestriction.duration = `${durationInSeconds}s`;
      }

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "x-api-key": request.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          data,
          altAccountsRestricted: request.excludeAltAccounts,
        };
      }

      return {
        success: false,
        statusCode: response.status,
        error: data.message || `Roblox API returned status ${response.status}`,
        data,
      };
    } catch (error: any) {
      console.error("[Roblox Cloud] Ban user error:", error);
      return {
        success: false,
        error: error.message || "Failed to ban user in Roblox",
      };
    }
  }

  async unbanUser(request: RobloxUnbanRequest): Promise<RobloxBanResponse> {
    try {
      const endpoint = `${this.ROBLOX_CLOUD_BASE}/universes/${request.universeId}/user-restrictions/${request.userId}`;
      
      const body = {
        gameJoinRestriction: {
          active: false,
          privateReason: "Ban lifted",
          displayReason: "Ban has been removed",
          excludeAltAccounts: false,
        },
      };

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "x-api-key": request.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          data,
        };
      }

      return {
        success: false,
        statusCode: response.status,
        error: data.message || `Roblox API returned status ${response.status}`,
        data,
      };
    } catch (error: any) {
      console.error("[Roblox Cloud] Unban user error:", error);
      return {
        success: false,
        error: error.message || "Failed to unban user in Roblox",
      };
    }
  }

  async performAltDetection(
    robloxUserId: string,
    serverId: string,
    knownAltsFromCaller?: string[]
  ): Promise<AltDetectionResult> {
    const reasons: string[] = [];
    let confidence = 0;
    const metadata: AltDetectionResult['metadata'] = {};

    try {
      // Layer 1: Account Age Detection
      const userResponse = await fetch(
        `https://users.roblox.com/v1/users/${robloxUserId}`
      );
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const createdDate = new Date(userData.created);
        const accountAgeDays = Math.floor(
          (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        metadata.accountAge = accountAgeDays;
        metadata.creationDate = userData.created;

        if (accountAgeDays < 30) {
          reasons.push("Layer 1: Account created within last 30 days (suspicious timing)");
          confidence += 35;
        } else if (accountAgeDays < 90) {
          reasons.push("Layer 1: Account created within last 90 days (moderately new)");
          confidence += 20;
        } else if (accountAgeDays < 180) {
          reasons.push("Layer 1: Account less than 6 months old");
          confidence += 10;
        }
      }

      // Layer 2: Known Alt Relationships Database Check
      // This checks for previously identified alt accounts
      let databaseKnownAlts: string[] = [];
      
      if (typeof window === 'undefined') {
        // Server-side only
        try {
          const { storage } = await import('./storage');
          const existingBans = await storage.getBansByServerId(serverId);
          
          // Find bans with matching characteristics
          const suspiciousMatches = existingBans.filter((ban: any) => {
            const banAltData = ban.metadata?.altDetection;
            const banRobloxId = ban.robloxUserId;
            
            // Check if this ban is linked to our current user
            if (banAltData?.linkedAccounts?.includes(robloxUserId)) {
              return true;
            }
            
            // Check if account ages are within 7 days of each other (likely created together)
            if (banAltData?.accountAge && metadata.accountAge) {
              const ageDiff = Math.abs(banAltData.accountAge - metadata.accountAge);
              if (ageDiff <= 7) {
                return true;
              }
            }
            
            return false;
          });
          
          databaseKnownAlts = suspiciousMatches.map((ban: any) => ban.robloxUserId);
        } catch (error) {
          console.error('[Alt Detection Layer 2] Database check failed:', error);
        }
      }
      
      // Combine known alts from caller and database
      const allKnownAlts = [
        ...(knownAltsFromCaller || []),
        ...databaseKnownAlts
      ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
      
      if (allKnownAlts.length > 0) {
        metadata.knownAlts = allKnownAlts;
        reasons.push(`Layer 2: Linked to ${allKnownAlts.length} known alt account(s) in database`);
        confidence += 45;
      }

      // Additional signals for Layer 2
      // Check for similar usernames (pattern detection)
      if (databaseKnownAlts.length > 0) {
        reasons.push("Layer 2: Pattern match with previously banned accounts");
        confidence += 10;
      }

      return {
        isLikelyAlt: confidence >= 40,
        confidence: Math.min(confidence, 100),
        reasons,
        metadata,
      };
    } catch (error) {
      console.error("[Alt Detection] Error:", error);
      return {
        isLikelyAlt: false,
        confidence: 0,
        reasons: ["Unable to perform alt detection"],
        metadata,
      };
    }
  }

  async getRobloxUsername(robloxUserId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://users.roblox.com/v1/users/${robloxUserId}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data.name || null;
    } catch {
      return null;
    }
  }

  async getRobloxUserId(username: string): Promise<string | null> {
    try {
      const response = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
      });
      
      if (!response.ok) return null;
      const data = await response.json();
      if (!data.data || data.data.length === 0) return null;
      return data.data[0].id.toString();
    } catch {
      return null;
    }
  }
}

export const robloxCloud = new RobloxCloudService();
