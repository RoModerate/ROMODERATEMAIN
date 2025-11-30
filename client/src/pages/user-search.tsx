import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Ban, AlertCircle, UserCheck, Activity, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { Ban as BanType, ModeratorNote, Server as ServerType } from "@shared/schema";

export default function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"username" | "userid">("username");
  const [activeSearch, setActiveSearch] = useState<{ type: string; query: string } | null>(null);

  const { data: servers = [] } = useQuery<ServerType[]>({
    queryKey: ["/api/servers"],
  });

  // Roblox player lookup query via Bloxlink
  const { data: playerData, isLoading: isSearching, error: searchError, refetch: retrySearch} = useQuery<{ id: string; name: string } | null>({
    queryKey: ["/api/bloxlink/lookup", activeSearch],
    queryFn: async () => {
      if (!activeSearch) return null;
      
      const response = await fetch("/api/bloxlink/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: activeSearch.query,
          queryType: activeSearch.type,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to lookup player");
      }
      
      const data = await response.json();
      // Map the response to match expected format (id/name for compatibility)
      return {
        id: data.robloxId,
        name: data.robloxUsername,
      };
    },
    enabled: !!activeSearch,
    retry: 1,
  });

  // All bans
  const { data: allBans = [] } = useQuery<BanType[]>({
    queryKey: ["/api/bans"],
    enabled: !!playerData,
  });

  // Filter player bans on the client side
  const playerBans = allBans.filter((ban: BanType) => ban.robloxUserId === playerData?.id);

  // All moderator notes
  const { data: allNotes = [] } = useQuery<ModeratorNote[]>({
    queryKey: ["/api/moderator-notes"],
    enabled: !!playerData,
  });

  // Filter player notes on the client side
  const playerNotes = allNotes.filter((note: ModeratorNote) => note.robloxUserId === playerData?.id);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setActiveSearch({ type: searchType, query: searchQuery });
  };

  const activeBans = playerBans.filter((ban: BanType) => ban.isActive);
  const totalBans = playerBans.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Search</h1>
        <p className="text-muted-foreground mt-2">
          Search for Roblox users to view their moderation history, bans, and notes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search User
          </CardTitle>
          <CardDescription>
            Search by Roblox username or user ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex gap-2 flex-1">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as "username" | "userid")}
                className="px-3 py-2 rounded-md border bg-background"
                data-testid="select-search-type"
              >
                <option value="username">Username</option>
                <option value="userid">User ID</option>
              </select>
              <Input
                placeholder={searchType === "username" ? "Enter Roblox username..." : "Enter Roblox user ID..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
                data-testid="input-player-search"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              data-testid="button-search-player"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
          {searchError && (
            <div className="mt-4 p-4 rounded-lg border border-destructive/50 bg-destructive/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">Unable to find player</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(searchError as Error).message.includes("not found") 
                      ? `No Roblox player found with ${searchType === "username" ? "username" : "ID"} "${activeSearch?.query}"`
                      : "There was an error searching for this player. This might be due to:"}
                  </p>
                  {!(searchError as Error).message.includes("not found") && (
                    <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc space-y-1">
                      <li>The Roblox username or ID might be incorrect</li>
                      <li>The Bloxlink API might be temporarily unavailable</li>
                      <li>Network connectivity issues</li>
                    </ul>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retrySearch()}
                      data-testid="button-retry-search"
                    >
                      Try Again
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setActiveSearch(null);
                        setSearchQuery("");
                      }}
                      data-testid="button-clear-search"
                    >
                      Clear Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {playerData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Player Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={`https://www.roblox.com/headshot-thumbnail/image?userId=${playerData.id}&width=150&height=150&format=png`}
                    alt={playerData.name}
                  />
                  <AvatarFallback className="bg-muted text-foreground text-2xl">
                    {playerData.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-2xl font-bold">{playerData.name}</h3>
                    <p className="text-sm text-muted-foreground">User ID: {playerData.id}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    {activeBans.length > 0 ? (
                      <Badge variant="destructive" className="gap-1">
                        <Ban className="h-3 w-3" />
                        {activeBans.length} Active Ban{activeBans.length > 1 ? "s" : ""}
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                        <UserCheck className="h-3 w-3" />
                        No Active Bans
                      </Badge>
                    )}
                    
                    <Badge variant="secondary" className="gap-1">
                      <Activity className="h-3 w-3" />
                      {totalBans} Total Ban{totalBans !== 1 ? "s" : ""} Across All Servers
                    </Badge>
                    
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {playerNotes.length} Note{playerNotes.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {activeBans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-destructive" />
                  Active Bans Across All Servers
                </CardTitle>
                <CardDescription>
                  Shared ban history from all servers you have access to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeBans.map((ban: BanType) => {
                    const server = servers.find(s => s.id === ban.serverId);
                    return (
                      <div key={ban.id} className="p-4 rounded-lg border bg-card/50">
                        <div className="flex items-start justify-between mb-2 gap-3">
                          <div className="flex-1">
                            <p className="font-medium">{ban.reason}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {server?.name || "Unknown Server"}
                              </Badge>
                              {ban.metadata?.gameId && (
                                <span className="text-xs text-muted-foreground">
                                  Game ID: {ban.metadata.gameId}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="destructive">Active</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Banned: {new Date(ban.createdAt).toLocaleDateString()}
                          </span>
                          {ban.expiresAt && (
                            <span className="flex items-center gap-1">
                              Expires: {new Date(ban.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                          {ban.bannedBy && (
                            <span className="text-xs">
                              By: {ban.bannedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {playerBans.filter((b: BanType) => !b.isActive).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Ban History Across All Servers
                </CardTitle>
                <CardDescription>
                  Previous bans from all connected servers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playerBans
                    .filter((ban: BanType) => !ban.isActive)
                    .slice(0, 10)
                    .map((ban: BanType) => {
                      const server = servers.find(s => s.id === ban.serverId);
                      return (
                        <div key={ban.id} className="p-4 rounded-lg border bg-card/30">
                          <div className="flex items-start justify-between mb-2 gap-3">
                            <div className="flex-1">
                              <p className="font-medium text-muted-foreground">{ban.reason}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {server?.name || "Unknown Server"}
                                </Badge>
                                {ban.metadata?.gameId && (
                                  <span className="text-xs text-muted-foreground">
                                    Game ID: {ban.metadata.gameId}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline">Inactive</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(ban.createdAt).toLocaleDateString()}
                            </span>
                            {ban.bannedBy && (
                              <span className="text-xs">
                                By: {ban.bannedBy}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {playerBans.filter((b: BanType) => !b.isActive).length > 10 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      Showing 10 of {playerBans.filter((b: BanType) => !b.isActive).length} inactive bans
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {playerNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Moderator Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playerNotes.slice(0, 5).map((note: ModeratorNote) => (
                    <div key={note.id} className="p-4 rounded-lg border bg-card/30">
                      <p className="mb-2">{note.note}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(note.createdAt).toLocaleDateString()}
                        {note.isImportant && (
                          <Badge variant="destructive" className="ml-2">Important</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!playerData && !isSearching && !searchError && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Search for a player to view their moderation history</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
