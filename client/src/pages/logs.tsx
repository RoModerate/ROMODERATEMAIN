import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Ban, FileCheck, MessageSquare, Shield, Server as ServerIcon, AlertCircle } from "lucide-react";
import type { Server, Ban as BanType, Appeal, Ticket } from "@shared/schema";
import { ServerSelector } from "@/components/server-selector";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RobloxAvatar } from "@/components/roblox-avatar";
import { format } from "date-fns";

export default function Logs() {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const { data: bans = [] } = useQuery<BanType[]>({
    queryKey: [`/api/bans?serverId=${selectedServer}`],
    enabled: !!selectedServer,
  });

  const { data: appeals = [] } = useQuery<Appeal[]>({
    queryKey: [`/api/appeals?serverId=${selectedServer}`],
    enabled: !!selectedServer,
  });

  const { data: tickets = [] } = useQuery<Ticket[]>({
    queryKey: [`/api/tickets?serverId=${selectedServer}`],
    enabled: !!selectedServer,
  });

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const allActivity = [
    ...bans.map(ban => ({
      id: ban.id,
      type: 'ban' as const,
      timestamp: ban.createdAt!,
      data: ban,
      description: `${ban.robloxUsername} was banned for: ${ban.reason}`,
    })),
    ...appeals.map(appeal => ({
      id: appeal.id,
      type: 'appeal' as const,
      timestamp: appeal.createdAt!,
      data: appeal,
      description: `Appeal ${appeal.status}: ${appeal.appealText.substring(0, 50)}...`,
    })),
    ...tickets.map(ticket => ({
      id: ticket.id,
      type: 'ticket' as const,
      timestamp: ticket.createdAt!,
      data: ticket,
      description: `Ticket ${ticket.status}: ${ticket.title}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const stats = {
    totalBans: bans.length,
    activeBans: bans.filter(b => b.isActive).length,
    totalAppeals: appeals.length,
    pendingAppeals: appeals.filter(a => a.status === 'pending').length,
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
  };

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <ServerIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Servers Found</h2>
        <p className="text-muted-foreground">Connect a Discord server to view activity logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground">
            Comprehensive view of all moderation activities, appeals, and support tickets
          </p>
        </div>
        <ServerSelector
          servers={servers}
          value={selectedServer}
          onChange={setSelectedServer}
          testId="select-server"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card data-testid="stat-bans">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Total Bans</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBans}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeBans} active
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-appeals">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Appeals</CardTitle>
            <FileCheck className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppeals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingAppeals} pending
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-tickets">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.openTickets} open
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">
            All Activity
          </TabsTrigger>
          <TabsTrigger value="bans" data-testid="tab-bans">
            Bans ({stats.totalBans})
          </TabsTrigger>
          <TabsTrigger value="appeals" data-testid="tab-appeals">
            Appeals ({stats.totalAppeals})
          </TabsTrigger>
          <TabsTrigger value="tickets" data-testid="tab-tickets">
            Tickets ({stats.totalTickets})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>All moderation and support activities</CardDescription>
            </CardHeader>
            <CardContent>
              {allActivity.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                    <Activity className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">No activity yet</p>
                    <p className="text-sm text-muted-foreground">
                      Activity will appear here as you moderate your server
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {allActivity.map((activity) => (
                    <div
                      key={`${activity.type}-${activity.id}`}
                      className="flex items-start gap-3 p-3 rounded-lg border hover-elevate"
                      data-testid={`activity-${activity.type}-${activity.id}`}
                    >
                      <div className="mt-1">
                        {activity.type === 'ban' && <Ban className="h-4 w-4 text-destructive" />}
                        {activity.type === 'appeal' && <FileCheck className="h-4 w-4 text-yellow-500" />}
                        {activity.type === 'ticket' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {activity.type === 'ban' && (activity.data as BanType).robloxUserId && (
                            <RobloxAvatar 
                              robloxUserId={(activity.data as BanType).robloxUserId}
                              username={(activity.data as BanType).robloxUsername}
                              size="sm"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(activity.timestamp), 'PPpp')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ban History</CardTitle>
              <CardDescription>All ban actions taken on your server</CardDescription>
            </CardHeader>
            <CardContent>
              {bans.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Ban className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No bans recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bans.map((ban) => (
                    <div
                      key={ban.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                      data-testid={`ban-log-${ban.id}`}
                    >
                      <RobloxAvatar 
                        robloxUserId={ban.robloxUserId}
                        username={ban.robloxUsername}
                        size="md"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{ban.robloxUsername}</p>
                          {ban.isActive && <Badge className="text-xs bg-destructive">Active</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{ban.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(ban.createdAt!), 'PPpp')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appeals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appeal History</CardTitle>
              <CardDescription>All ban appeals submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {appeals.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No appeals submitted</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appeals.map((appeal) => (
                    <div
                      key={appeal.id}
                      className="p-3 rounded-lg border"
                      data-testid={`appeal-log-${appeal.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={
                          appeal.status === 'approved' ? 'default' :
                          appeal.status === 'rejected' ? 'destructive' : 'secondary'
                        } className="capitalize">
                          {appeal.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(appeal.createdAt!), 'PPpp')}
                        </p>
                      </div>
                      <p className="text-sm">{appeal.appealText}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Ticket History</CardTitle>
              <CardDescription>All support tickets</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No tickets created</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3 rounded-lg border"
                      data-testid={`ticket-log-${ticket.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{ticket.title}</p>
                          <Badge variant={
                            ticket.status === 'open' ? 'default' :
                            ticket.status === 'closed' ? 'secondary' : 'outline'
                          } className="capitalize text-xs">
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(ticket.createdAt!), 'PPpp')}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
