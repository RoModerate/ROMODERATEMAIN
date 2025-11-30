import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server as ServerIcon, Users, Settings as SettingsIcon, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { Server } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function Servers() {
  const { data: servers, isLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Servers</h1>
          <p className="text-muted-foreground">
            Manage your connected Discord servers
          </p>
        </div>
        <Button onClick={() => window.location.reload()} data-testid="button-refresh-servers">
          Refresh Servers
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64">
              <div className="h-full bg-muted/50 animate-pulse rounded-lg" />
            </Card>
          ))}
        </div>
      ) : servers && servers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server) => (
            <Card key={server.id} className="hover-elevate transition-all" data-testid={`server-card-${server.id}`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {server.icon ? (
                    <img 
                      src={`https://cdn.discordapp.com/icons/${server.discordServerId}/${server.icon}.png`}
                      alt={server.name}
                      className="h-16 w-16 rounded-lg"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ServerIcon className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate mb-1">{server.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Users className="h-3 w-3" />
                      Discord Server
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {server.settings?.features && server.settings.features.length > 0 ? (
                    server.settings.features.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      No features enabled
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Link href={`/servers/${server.id}`}>
                    <Button className="w-full" data-testid={`button-manage-${server.id}`}>
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Manage Server
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`https://discord.com/channels/${server.discordServerId}`, '_blank')}
                    data-testid={`button-open-discord-${server.id}`}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Discord
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <ServerIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">No servers found</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Make sure you've granted the necessary permissions when connecting with Discord.
                  Your servers will appear here automatically.
                </p>
              </div>
              <Button onClick={() => window.location.reload()} data-testid="button-retry-servers">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
