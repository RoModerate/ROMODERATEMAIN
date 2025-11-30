import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Server as ServerIcon, Users, Settings as SettingsIcon, ArrowLeft, Shield, Key, Zap, Copy, Eye, EyeOff, RefreshCw, Activity, Clock, BarChart3, FileText, Image, Video, CheckCircle2, XCircle, Bot } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server } from "@shared/schema";
import { useState, useEffect } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";

function ConfigurationTab({ serverId }: { serverId: string }) {
  const { data: shifts, isLoading: shiftsLoading } = useQuery<any[]>({
    queryKey: ["/api/servers", serverId, "shifts"],
  });

  const { data: moderationLogs, isLoading: logsLoading } = useQuery<any[]>({
    queryKey: ["/api/servers", serverId, "moderation-logs"],
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Shift Logs
          </CardTitle>
          <CardDescription>
            View staff shift history and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shiftsLoading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            </div>
          ) : shifts && shifts.length > 0 ? (
            <div className="space-y-3">
              {shifts.slice(0, 10).map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  data-testid={`shift-${shift.id}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{shift.user?.username || "Unknown User"}</div>
                    <div className="text-sm text-muted-foreground">
                      Started {formatDistanceToNow(new Date(shift.startTime), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {shift.status === "active" ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Completed</Badge>
                    )}
                    {shift.metrics && (
                      <div className="text-sm text-muted-foreground">
                        {shift.metrics.actionsCount || 0} actions
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No shifts recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Server Insights
          </CardTitle>
          <CardDescription>
            Recent moderation activity and logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            </div>
          ) : moderationLogs && moderationLogs.length > 0 ? (
            <div className="space-y-3">
              {moderationLogs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  data-testid={`log-${log.id}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{log.action.replace(/_/g, " ").toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">
                      by {log.moderator?.username || "Unknown"} • {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  {log.targetUsername && (
                    <div className="text-sm text-muted-foreground">
                      Target: {log.targetUsername}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No moderation logs yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function ModerationTab({ serverId }: { serverId: string }) {
  const { toast } = useToast();
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/servers", serverId, "moderation-stats"],
    refetchInterval: 30000,
  });

  const { data: activeShift } = useQuery<any>({
    queryKey: ["/api/servers", serverId, "shifts", "active"],
    refetchInterval: 5000,
  });

  const startShiftMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/servers/${serverId}/shifts/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", serverId, "shifts"] });
      toast({
        title: "Shift Started",
        description: "Your moderation shift has been started",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start shift",
        variant: "destructive",
      });
    },
  });

  const endShiftMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/servers/${serverId}/shifts/${activeShift.id}/end`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", serverId, "shifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/servers", serverId, "moderation-stats"] });
      toast({
        title: "Shift Ended",
        description: "Your moderation shift has been ended",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to end shift",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Moderation Dashboard
              </CardTitle>
              <CardDescription>
                Overview of moderation activity and statistics
              </CardDescription>
            </div>
            {activeShift ? (
              <Button
                onClick={() => endShiftMutation.mutate()}
                disabled={endShiftMutation.isPending}
                variant="destructive"
                data-testid="button-end-shift"
              >
                End Shift
              </Button>
            ) : (
              <Button
                onClick={() => startShiftMutation.mutate()}
                disabled={startShiftMutation.isPending}
                data-testid="button-start-shift"
              >
                Start Shift
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeShift && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium">Active Shift</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Started {formatDistanceToNow(new Date(activeShift.startTime), { addSuffix: true })}
                </span>
              </div>
            </div>
          )}

          {statsLoading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="text-2xl font-bold">{stats.totalActions || 0}</div>
                <div className="text-sm text-muted-foreground">Total Actions</div>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="text-2xl font-bold">{stats.totalBans || 0}</div>
                <div className="text-sm text-muted-foreground">Bans ({stats.activeBans || 0} active)</div>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="text-2xl font-bold">{stats.totalAppeals || 0}</div>
                <div className="text-sm text-muted-foreground">Appeals ({stats.pendingAppeals || 0} pending)</div>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="text-2xl font-bold">{stats.totalTickets || 0}</div>
                <div className="text-sm text-muted-foreground">Tickets ({stats.openTickets || 0} open)</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No stats available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Staff Shift Tracking
          </CardTitle>
          <CardDescription>
            Monitor and manage staff shifts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="text-2xl font-bold">{stats.totalShifts || 0}</div>
                <div className="text-sm text-muted-foreground">Total Shifts</div>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="text-2xl font-bold">{stats.totalShiftHours || 0}h</div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="text-2xl font-bold">{stats.activeShifts || 0}</div>
                <div className="text-sm text-muted-foreground">Active Shifts</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No shift data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function ServerSettings() {
  const [, params] = useRoute("/servers/:id");
  const serverId = params?.id;
  const { toast } = useToast();
  const [showBotKey, setShowBotKey] = useState(false);
  const [banAppealWebhook, setBanAppealWebhook] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [showBotToken, setShowBotToken] = useState(false);
  
  const [evidenceServices, setEvidenceServices] = useState({
    youtube: { enabled: false, whitelist: [] as string[] },
    medal: { enabled: false, whitelist: [] as string[] },
    imgur: { enabled: false, whitelist: [] as string[] },
    streamable: { enabled: false, whitelist: [] as string[] },
  });
  
  const [advancedSettings, setAdvancedSettings] = useState({
    autoModeration: false,
    requireApproval: false,
    logAllActions: true,
    webhookNotifications: true,
  });

  const { data: server, isLoading, error } = useQuery<Server>({
    queryKey: ["/api/servers", serverId],
    enabled: !!serverId,
  });

  useEffect(() => {
    if (server?.settings?.banAppealWebhook) {
      setBanAppealWebhook(server.settings.banAppealWebhook);
    }
    if (server?.settings?.evidenceServices && typeof server.settings.evidenceServices === 'object') {
      setEvidenceServices(server.settings.evidenceServices as typeof evidenceServices);
    }
    if (server && (server.settings as any)?.advancedSettings && typeof (server.settings as any).advancedSettings === 'object') {
      setAdvancedSettings((server.settings as any).advancedSettings as typeof advancedSettings);
    }
  }, [server]);

  const updateWebhookMutation = useMutation({
    mutationFn: async (webhook: string) => {
      return await apiRequest("PATCH", `/api/servers/${serverId}`, {
        settings: {
          ...server?.settings,
          banAppealWebhook: webhook,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", serverId] });
      toast({
        title: "Webhook updated",
        description: "Ban appeal webhook has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update webhook",
        variant: "destructive",
      });
    },
  });

  const resetBotKeyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/servers/${serverId}/reset-bot-key`);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", serverId] });
      setIsResetDialogOpen(false);
      toast({
        title: "Bot Key Reset",
        description: "A new bot key has been generated. Update your Discord bot with the new key.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset bot key",
        variant: "destructive",
      });
    },
  });

  const updateBotTokenMutation = useMutation({
    mutationFn: async (newToken: string) => {
      return await apiRequest("PATCH", `/api/servers/${serverId}/update-bot-token`, {
        botToken: newToken,
      });
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", serverId] });
      setBotToken("");
      toast({
        title: "Bot Token Updated",
        description: `Bot token updated successfully. ${response.botName} is now online.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update bot token",
        variant: "destructive",
      });
    },
  });

  const updateEvidenceServicesMutation = useMutation({
    mutationFn: async (services: typeof evidenceServices) => {
      return await apiRequest("PATCH", `/api/servers/${serverId}`, {
        settings: {
          ...server?.settings,
          evidenceServices: services,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", serverId] });
      toast({
        title: "Evidence Services Updated",
        description: "Evidence service settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update evidence services",
        variant: "destructive",
      });
    },
  });

  const updateAdvancedSettingsMutation = useMutation({
    mutationFn: async (settings: typeof advancedSettings) => {
      return await apiRequest("PATCH", `/api/servers/${serverId}`, {
        settings: {
          ...server?.settings,
          advancedSettings: settings,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", serverId] });
      toast({
        title: "Advanced Settings Updated",
        description: "Advanced settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update advanced settings",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-muted/50 animate-pulse rounded-lg" />
        <div className="h-96 bg-muted/50 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !server) {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <ServerIcon className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Server not found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                This server doesn't exist or you don't have permission to access it.
              </p>
            </div>
            <Link href="/servers">
              <Button data-testid="button-back-to-servers">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Servers
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/servers">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {server.icon ? (
              <img 
                src={`https://cdn.discordapp.com/icons/${server.discordServerId}/${server.icon}.png`}
                alt={server.name}
                className="h-12 w-12 rounded-lg"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ServerIcon className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{server.name}</h1>
              <p className="text-sm text-muted-foreground">Server Settings</p>
            </div>
          </div>
        </div>
        <Badge variant="secondary">Owner</Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" data-testid="tab-general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="configuration" data-testid="tab-configuration">
            <Zap className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="moderation" data-testid="tab-moderation">
            <Shield className="h-4 w-4 mr-2" />
            Moderation
          </TabsTrigger>
          <TabsTrigger value="team" data-testid="tab-team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Server Information</CardTitle>
              <CardDescription>Basic information about your server</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Discord Server ID</label>
                <p className="text-sm text-muted-foreground font-mono mt-1">{server.discordServerId}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Server Name</label>
                <p className="text-sm text-muted-foreground mt-1">{server.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Created</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(server.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Bot Key
                  </CardTitle>
                  <CardDescription>
                    Use this key with your Discord bot /linkkey command to connect
                  </CardDescription>
                </div>
                {server.settings?.botKey && (
                  <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-reset-bot-key">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Key
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Bot Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will generate a new bot key and invalidate the current one. 
                          You'll need to update your Discord bot with the new key using the /linkkey command.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => resetBotKeyMutation.mutate()}
                          disabled={resetBotKeyMutation.isPending}
                          data-testid="button-confirm-reset"
                        >
                          {resetBotKeyMutation.isPending ? "Resetting..." : "Reset Key"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {server.settings?.botKey ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm">
                      {showBotKey ? server.settings.botKey : "•".repeat(64)}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowBotKey(!showBotKey)}
                      data-testid="button-toggle-bot-key"
                    >
                      {showBotKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(server.settings?.botKey || "");
                        toast({ title: "Copied", description: "Bot key copied to clipboard" });
                      }}
                      data-testid="button-copy-bot-key"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keep this key secret. Only share it with trusted co-owners and developers.
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Complete setup to generate a bot key
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bot Token</CardTitle>
              <CardDescription>
                Update your Discord bot token if needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bot-token">Discord Bot Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="bot-token"
                    type={showBotToken ? "text" : "password"}
                    placeholder="Enter new bot token..."
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    data-testid="input-bot-token"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowBotToken(!showBotToken)}
                    data-testid="button-toggle-bot-token"
                  >
                    {showBotToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => updateBotTokenMutation.mutate(botToken)}
                    disabled={updateBotTokenMutation.isPending || !botToken}
                    data-testid="button-update-bot-token"
                  >
                    {updateBotTokenMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your bot token is encrypted and will start the bot immediately after updating
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ban Appeal Webhook</CardTitle>
              <CardDescription>
                Webhook URL for ban appeal notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Discord Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={banAppealWebhook}
                    onChange={(e) => setBanAppealWebhook(e.target.value)}
                    data-testid="input-webhook-url"
                  />
                  <Button
                    onClick={() => updateWebhookMutation.mutate(banAppealWebhook)}
                    disabled={updateWebhookMutation.isPending}
                    data-testid="button-save-webhook"
                  >
                    {updateWebhookMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ban appeals will be sent to this webhook for review
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Enabled features for this server</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {server.settings?.features && server.settings.features.length > 0 ? (
                  server.settings.features.map((feature, idx) => (
                    <Badge key={idx} variant="secondary">
                      {feature}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No features enabled yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Evidence Services
                  </CardTitle>
                  <CardDescription>
                    Configure supported evidence platforms for moderation reports
                  </CardDescription>
                </div>
                <Button
                  onClick={() => updateEvidenceServicesMutation.mutate(evidenceServices)}
                  disabled={updateEvidenceServicesMutation.isPending}
                  data-testid="button-save-evidence-services"
                >
                  {updateEvidenceServicesMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium">YouTube</div>
                      <div className="text-sm text-muted-foreground">
                        Accept YouTube video links as evidence
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={evidenceServices.youtube.enabled}
                    onCheckedChange={(checked) =>
                      setEvidenceServices({
                        ...evidenceServices,
                        youtube: { ...evidenceServices.youtube, enabled: checked },
                      })
                    }
                    data-testid="switch-youtube-enabled"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Medal.tv</div>
                      <div className="text-sm text-muted-foreground">
                        Accept Medal.tv clips as evidence
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={evidenceServices.medal.enabled}
                    onCheckedChange={(checked) =>
                      setEvidenceServices({
                        ...evidenceServices,
                        medal: { ...evidenceServices.medal, enabled: checked },
                      })
                    }
                    data-testid="switch-medal-enabled"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Image className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Imgur</div>
                      <div className="text-sm text-muted-foreground">
                        Accept Imgur images as evidence
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={evidenceServices.imgur.enabled}
                    onCheckedChange={(checked) =>
                      setEvidenceServices({
                        ...evidenceServices,
                        imgur: { ...evidenceServices.imgur, enabled: checked },
                      })
                    }
                    data-testid="switch-imgur-enabled"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Streamable</div>
                      <div className="text-sm text-muted-foreground">
                        Accept Streamable videos as evidence
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={evidenceServices.streamable.enabled}
                    onCheckedChange={(checked) =>
                      setEvidenceServices({
                        ...evidenceServices,
                        streamable: { ...evidenceServices.streamable, enabled: checked },
                      })
                    }
                    data-testid="switch-streamable-enabled"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Enable evidence platforms to allow moderators to submit reports with video/image proof.
                  Only enabled platforms will be accepted in moderation actions.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>
                    Configure advanced moderation and automation features
                  </CardDescription>
                </div>
                <Button
                  onClick={() => updateAdvancedSettingsMutation.mutate(advancedSettings)}
                  disabled={updateAdvancedSettingsMutation.isPending}
                  data-testid="button-save-advanced-settings"
                >
                  {updateAdvancedSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium">Auto Moderation</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically enforce moderation rules based on configured triggers
                    </div>
                  </div>
                  <Switch
                    checked={advancedSettings.autoModeration}
                    onCheckedChange={(checked) =>
                      setAdvancedSettings({ ...advancedSettings, autoModeration: checked })
                    }
                    data-testid="switch-auto-moderation"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium">Require Team Member Approval</div>
                    <div className="text-sm text-muted-foreground">
                      New team members must be approved before gaining access
                    </div>
                  </div>
                  <Switch
                    checked={advancedSettings.requireApproval}
                    onCheckedChange={(checked) =>
                      setAdvancedSettings({ ...advancedSettings, requireApproval: checked })
                    }
                    data-testid="switch-require-approval"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium">Log All Actions</div>
                    <div className="text-sm text-muted-foreground">
                      Record all moderation actions for audit and review purposes
                    </div>
                  </div>
                  <Switch
                    checked={advancedSettings.logAllActions}
                    onCheckedChange={(checked) =>
                      setAdvancedSettings({ ...advancedSettings, logAllActions: checked })
                    }
                    data-testid="switch-log-all-actions"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium">Webhook Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Send webhook notifications for critical moderation events
                    </div>
                  </div>
                  <Switch
                    checked={advancedSettings.webhookNotifications}
                    onCheckedChange={(checked) =>
                      setAdvancedSettings({ ...advancedSettings, webhookNotifications: checked })
                    }
                    data-testid="switch-webhook-notifications"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Advanced settings control automation, approval workflows, and notification systems for your moderation team.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage moderators and administrators for this server
                  </CardDescription>
                </div>
                <Button data-testid="button-invite-member">
                  <Users className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">You (Owner)</div>
                      <div className="text-sm text-muted-foreground">Full access to all features</div>
                    </div>
                  </div>
                  <Badge>Owner</Badge>
                </div>
                <div className="text-center py-8 text-muted-foreground border-t">
                  <p className="text-sm">No team members yet</p>
                  <p className="text-xs mt-1">Invite moderators to help manage your server</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <ConfigurationTab serverId={serverId!} />
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <ModerationTab serverId={serverId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
