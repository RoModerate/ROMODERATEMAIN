import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { LayoutDashboard, Server, CheckCircle2, AlertCircle, Users, Ban, FileCheck, Ticket, TrendingUp, Shield, Settings, Zap, Activity, BarChart } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server as ServerType } from "@shared/schema";
import { useLocation } from "wouter";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AnalyticsData {
  totalBans?: number;
  activeBans?: number;
  totalAppeals?: number;
  pendingAppeals?: number;
  totalTickets?: number;
  openTickets?: number;
  trends?: {
    bansLast30Days?: number;
    appealsLast30Days?: number;
  };
  trendData?: Array<{
    date: string;
    bans: number;
    appeals: number;
    tickets: number;
  }>;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [setupStep, setSetupStep] = useState(0);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [botToken, setBotToken] = useState("");
  const [reportsChannel, setReportsChannel] = useState("");
  const [reportLogsChannel, setReportLogsChannel] = useState("");
  const [appealsCategory, setAppealsCategory] = useState("");
  const [appealLogsChannel, setAppealLogsChannel] = useState("");
  const [moderatorChatEnabled, setModeratorChatEnabled] = useState(false);

  const { data: servers = [], isLoading: serversLoading } = useQuery<ServerType[]>({
    queryKey: ["/api/servers"],
  });

  const currentServer = selectedServer 
    ? servers.find(s => s.id === selectedServer) || servers[0]
    : servers[0];

  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: [`/api/analytics?serverId=${selectedServer || currentServer?.id}`],
    enabled: !!(selectedServer || currentServer?.id),
  });

  const { data: recentLogs = [] } = useQuery<any[]>({
    queryKey: [`/api/servers/${currentServer?.id}/moderation-logs?limit=5`],
    enabled: !!currentServer?.id,
  });

  const setupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/servers/${selectedServer}/setup`, {
        botToken,
        reportsChannel,
        reportLogsChannel,
        appealsCategory,
        appealLogsChannel,
        moderatorChatEnabled,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({
        title: "Setup Complete!",
        description: "Your server is fully configured. You can update these settings anytime.",
      });
      setSetupStep(4);
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to complete server setup",
        variant: "destructive",
      });
    },
  });

  if (serversLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <Server className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Servers Found</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You need to have manage permissions on at least one Discord server. Make sure you're logged in with the correct account.
        </p>
        <Button onClick={() => window.location.href = "/api/auth/discord"}>
          Reconnect Discord
        </Button>
      </div>
    );
  }

  // Check if setup is complete
  const isSetupComplete = currentServer?.settings?.setupCompleted || false;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {currentServer?.icon ? (
            <img 
              src={`https://cdn.discordapp.com/icons/${currentServer.discordServerId}/${currentServer.icon}.png`}
              alt={currentServer.name}
              className="h-16 w-16 rounded-xl"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
              <Server className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {currentServer?.name || "Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Monitor your moderation activity and server health
            </p>
          </div>
        </div>
        {servers.length > 1 && (
          <Select value={selectedServer || currentServer.id} onValueChange={setSelectedServer}>
            <SelectTrigger className="w-64" data-testid="select-server">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {currentServer?.icon ? (
                    <img 
                      src={`https://cdn.discordapp.com/icons/${currentServer.discordServerId}/${currentServer.icon}.png`}
                      alt={currentServer.name}
                      className="h-5 w-5 rounded"
                    />
                  ) : (
                    <Server className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{currentServer?.name}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {servers.map((server) => (
                <SelectItem key={server.id} value={server.id}>
                  <div className="flex items-center gap-2">
                    {server.icon ? (
                      <img 
                        src={`https://cdn.discordapp.com/icons/${server.discordServerId}/${server.icon}.png`}
                        alt={server.name}
                        className="h-5 w-5 rounded"
                      />
                    ) : (
                      <Server className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{server.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate transition-all border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bans</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Ban className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-bans">{analytics?.totalBans || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics?.activeBans || 0} active bans
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appeals</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-appeals">{analytics?.totalAppeals || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics?.pendingAppeals || 0} pending review
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-total-tickets">{analytics?.totalTickets || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics?.openTickets || 0} currently open
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30-Day Activity</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="stat-30day-activity">
              {(analytics?.trends?.bansLast30Days || 0) + (analytics?.trends?.appealsLast30Days || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics?.trends?.bansLast30Days || 0} bans, {analytics?.trends?.appealsLast30Days || 0} appeals
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common moderation tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => setLocation('/moderation')}
                  data-testid="button-moderation"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Moderate Player</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Take moderation actions on specific players</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => setLocation('/bans')}
                  data-testid="button-view-bans"
                >
                  <Ban className="h-5 w-5" />
                  <span className="text-sm">View Bans</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View and manage all active and past bans</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => setLocation('/appeals')}
                  data-testid="button-review-appeals"
                >
                  <FileCheck className="h-5 w-5" />
                  <span className="text-sm">Review Appeals</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Review and process ban appeals from players</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => setLocation('/moderation')}
                  data-testid="button-moderator-portal"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Moderator Portal</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Access the full moderation dashboard</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Server Configuration
            </CardTitle>
            <CardDescription>Manage your server settings</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => setLocation('/auto-actions')}
                  data-testid="button-auto-actions"
                >
                  <Zap className="h-5 w-5" />
                  <span className="text-sm">Auto Actions</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configure automatic moderation rules and responses</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => setLocation('/api-keys')}
                  data-testid="button-api-keys"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Roblox API Keys</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Roblox Cloud API keys for game integration</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => setLocation('/reports-settings')}
                  data-testid="button-reports-settings"
                >
                  <FileCheck className="h-5 w-5" />
                  <span className="text-sm">Reports Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configure player report system and channels</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => setLocation('/servers')}
                  data-testid="button-server-settings"
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-sm">Server Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Discord server configuration and permissions</p>
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Activity Trends
          </CardTitle>
          <CardDescription>Moderation activity over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.trendData && analytics.trendData.length > 0 ? (
            <ChartContainer
              config={{
                bans: {
                  label: "Bans",
                  color: "hsl(var(--chart-1))",
                },
                appeals: {
                  label: "Appeals",
                  color: "hsl(var(--chart-2))",
                },
                tickets: {
                  label: "Tickets",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[200px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="bans"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="appeals"
                    stackId="1"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="tickets"
                    stackId="1"
                    stroke="hsl(var(--chart-3))"
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              <div className="text-center">
                <BarChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No trend data available</p>
                <p className="text-xs mt-1">Data will appear as moderation actions are recorded</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Server Status
            </CardTitle>
            <CardDescription>Current configuration for {currentServer.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Setup Completed</span>
              <Badge variant={isSetupComplete ? "default" : "secondary"} data-testid="badge-setup-status">
                {isSetupComplete ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Discord Bot</span>
              <Badge variant="outline" data-testid="badge-bot-status">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Moderator Chat</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant={currentServer.settings?.moderatorChatEnabled ? "default" : "secondary"} 
                    className="cursor-pointer hover-elevate"
                    onClick={() => setLocation('/servers')}
                    data-testid="badge-chat-status"
                  >
                    {currentServer.settings?.moderatorChatEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to {currentServer.settings?.moderatorChatEnabled ? "disable" : "enable"} in server settings</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest moderation actions</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation('/logs')}
                data-testid="button-view-all-logs"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-xs mt-1">Moderation actions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="activity-feed">
                {recentLogs.map((log: any) => (
                  <div key={log.id} className="flex gap-3 text-sm border-l-2 border-primary/20 pl-3 py-2 hover-elevate rounded-r">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {log.moderator?.username || 'Unknown'} 
                        <span className="text-muted-foreground font-normal">
                          {' '}{log.action === 'ban_created' ? 'banned' : 
                           log.action === 'ban_removed' ? 'unbanned' :
                           log.action === 'appeal_review' ? 'reviewed appeal from' :
                           log.action === 'ticket_created' ? 'created ticket for' :
                           'acted on'} {log.targetUsername || 'player'}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
