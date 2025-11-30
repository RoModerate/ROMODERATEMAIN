import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, User, Calendar, AlertTriangle, Ban, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface RobloxPlayer {
  id: string;
  username: string;
  displayName?: string;
  joinDate: string;
  accountAge: number;
  verified: boolean;
  banned: boolean;
  lastReportDate?: string;
  totalReports?: number;
  description?: string;
  avatarUrl?: string;
}

interface PlayerSearchProps {
  onSelectPlayer: (player: RobloxPlayer) => void;
}

export function PlayerSearch({ onSelectPlayer }: PlayerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        setDebouncedSearchTerm(searchTerm.trim());
      } else {
        setDebouncedSearchTerm("");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: player, isLoading, error } = useQuery<RobloxPlayer>({
    queryKey: ["/api/roblox/player", debouncedSearchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/roblox/player/${debouncedSearchTerm}`);
      if (!response.ok) {
        throw new Error("Player not found");
      }
      return response.json();
    },
    enabled: !!debouncedSearchTerm,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setDebouncedSearchTerm(searchTerm.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Player Lookup
        </CardTitle>
        <CardDescription>
          Search for a Roblox player by username or User ID
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Enter Roblox username or User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-player-search"
          />
          <Button type="submit" data-testid="button-search-player">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        {isLoading && (
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span>Player not found. Please check the username or ID and try again.</span>
          </div>
        )}

        {player && !isLoading && (
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg bg-card">
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarImage src={player.avatarUrl} alt={player.username} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold" data-testid="text-player-username">
                    {player.username}
                  </h3>
                  {player.verified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                  {player.banned && (
                    <Badge variant="destructive" className="text-xs">
                      <Ban className="h-3 w-3 mr-1" />
                      Banned
                    </Badge>
                  )}
                </div>
                {player.displayName && player.displayName !== player.username && (
                  <p className="text-sm text-muted-foreground">@{player.displayName}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1" data-testid="text-player-id">
                  User ID: {player.id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Join Date</p>
                  <p className="font-medium">
                    {player.joinDate ? format(new Date(player.joinDate), "MMM dd, yyyy") : "Unknown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Account Age</p>
                  <p className="font-medium">{player.accountAge} days</p>
                </div>
              </div>
              {player.totalReports !== undefined && player.totalReports > 0 && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Reports</p>
                      <p className="font-medium text-yellow-500">{player.totalReports}</p>
                    </div>
                  </div>
                  {player.lastReportDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Last Report</p>
                        <p className="font-medium">
                          {format(new Date(player.lastReportDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {player.description && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Bio</p>
                <p className="text-sm">{player.description}</p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => onSelectPlayer(player)}
              data-testid="button-select-player"
            >
              Select Player for Moderation Action
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
