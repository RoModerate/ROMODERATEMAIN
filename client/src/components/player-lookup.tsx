import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PlayerData {
  userId: string;
  username: string;
  avatarUrl: string;
}

interface PlayerLookupProps {
  onPlayerFound?: (player: PlayerData) => void;
}

export function PlayerLookup({ onPlayerFound }: PlayerLookupProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const { data: playerData, isLoading, error: queryError } = useQuery<PlayerData>({
    queryKey: [`/api/roblox/player/${searchQuery}`],
    enabled: searchQuery.length > 0,
    retry: false,
  });

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setError("Please enter a username or user ID");
      return;
    }
    setError("");
    setSearchQuery(searchTerm.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
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
          Search for a Roblox player by username or user ID
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter username or user ID"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setError("");
            }}
            onKeyPress={handleKeyPress}
            data-testid="input-player-search"
          />
          <Button
            onClick={handleSearch}
            disabled={isLoading || !searchTerm.trim()}
            data-testid="button-search-player"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {queryError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(queryError as any).message || "Player not found. Please check the username or ID and try again."}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        )}

        {playerData && !isLoading && (
          <div className="flex items-center justify-between gap-4 p-4 border rounded-lg hover-elevate transition-all" data-testid="player-result">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={playerData.avatarUrl || `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${playerData.userId}&size=150x150&format=Png&isCircular=false`}
                  alt={playerData.username}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold" data-testid="text-player-username">
                  {playerData.username}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="text-player-id">
                  User ID: {playerData.userId}
                </p>
              </div>
            </div>
            {onPlayerFound && (
              <Button
                onClick={() => onPlayerFound(playerData)}
                data-testid="button-select-player"
              >
                Select
              </Button>
            )}
          </div>
        )}

        {!isLoading && !playerData && searchQuery && !queryError && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Enter a player username or ID to search</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
