import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User, Server } from "@shared/schema";
import { PlayerSearch } from "@/components/player-search";
import { BanActionForm } from "@/components/ban-action-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Search, FileCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RobloxPlayer {
  id: string;
  username: string;
  displayName?: string;
  joinDate: string;
  accountAge: number;
  verified: boolean;
  banned: boolean;
}

export default function Moderation() {
  const { data: user } = useQuery<User>({ queryKey: ["/api/auth/me"] });
  const { data: servers = [], isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<RobloxPlayer | null>(null);

  const handleSelectPlayer = (player: RobloxPlayer) => {
    setSelectedPlayer(player);
  };

  const handleActionSuccess = () => {
    setSelectedPlayer(null);
  };

  if (serversLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Servers Found</h2>
        <p className="text-muted-foreground max-w-md">
          You need to have manage permissions on at least one Discord server to use moderation tools.
        </p>
      </div>
    );
  }

  const currentServer = selectedServer
    ? servers.find((s) => s.id === selectedServer) || servers[0]
    : servers[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Moderation Panel
          </h1>
          <p className="text-muted-foreground">
            Search and manage player bans for your Roblox games
          </p>
        </div>
        {servers.length > 1 && (
          <select
            className="px-4 py-2 rounded-lg border bg-background"
            value={currentServer.id}
            onChange={(e) => setSelectedServer(e.target.value)}
            data-testid="select-server"
          >
            {servers.map((server) => (
              <option key={server.id} value={server.id}>
                {server.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" data-testid="tab-search">
            <Search className="h-4 w-4 mr-2" />
            Player Search
          </TabsTrigger>
          <TabsTrigger value="action" disabled={!selectedPlayer} data-testid="tab-action">
            <FileCheck className="h-4 w-4 mr-2" />
            Moderation Action
            {selectedPlayer && <span className="ml-2 text-xs">(1)</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <PlayerSearch onSelectPlayer={handleSelectPlayer} />

          {selectedPlayer && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm">Player Selected</CardTitle>
                <CardDescription>
                  {selectedPlayer.username} is ready for moderation action. Switch to the "Moderation Action" tab to proceed.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="action" className="space-y-4">
          {selectedPlayer ? (
            <BanActionForm
              player={selectedPlayer}
              serverId={currentServer.id}
              onSuccess={handleActionSuccess}
              onCancel={() => setSelectedPlayer(null)}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No player selected</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
          <CardDescription>Simple moderation workflow in 3 steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Search Player</h4>
                <p className="text-sm text-muted-foreground">
                  Enter Roblox username or User ID to look up player information
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Choose Action</h4>
                <p className="text-sm text-muted-foreground">
                  Select ban type, add reason, and optionally attach evidence
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Execute & Log</h4>
                <p className="text-sm text-muted-foreground">
                  Action is logged and can notify your Discord channel automatically
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
