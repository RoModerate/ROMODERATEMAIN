import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ban as BanIcon, Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Server, Ban } from "@shared/schema";
import { useState, useEffect } from "react";

export default function Bans() {
  const { data: servers = [], isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const { data: bans = [], isLoading: bansLoading } = useQuery<Ban[]>({
    queryKey: [`/api/bans?serverId=${selectedServer}`],
    enabled: !!selectedServer,
  });

  if (serversLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>;
  }

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Users className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Servers Found</h2>
        <p className="text-muted-foreground">Connect a Discord server to manage bans</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ban Management</h1>
          <p className="text-muted-foreground">Manage player bans across your Roblox game</p>
        </div>
        {servers.length > 1 && (
          <select
            className="px-4 py-2 rounded-lg border bg-background"
            value={selectedServer || ""}
            onChange={(e) => setSelectedServer(e.target.value)}
            data-testid="select-server"
          >
            {servers.map((server) => (
              <option key={server.id} value={server.id}>{server.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-4">
        {bansLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : bans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BanIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No bans yet</p>
              <p className="text-sm text-muted-foreground">Bans will appear here when you create them</p>
            </CardContent>
          </Card>
        ) : (
          bans.map((ban) => (
            <Card key={ban.id} className="hover-elevate transition-all" data-testid={`ban-card-${ban.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <BanIcon className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{ban.robloxUsername}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>Roblox ID: {ban.robloxUserId}</span>
                        {ban.discordUserId && <span>• Discord: {ban.discordUserId}</span>}
                      </CardDescription>
                    </div>
                  </div>
                  {ban.isActive ? (
                    <Badge variant="destructive">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm">{ban.reason}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Banned: {new Date(ban.createdAt!).toLocaleDateString()}</span>
                  </div>
                  {ban.expiresAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Expires: {new Date(ban.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
