import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Server as ServerIcon, Settings, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server } from "@shared/schema";
import { ChannelSelector } from "@/components/channel-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SetupWizardProps {
  serverId: string;
}

const STORAGE_KEY_PREFIX = 'romoderate_setup_';

export default function ServerSetup({ serverId }: SetupWizardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Load setup progress from localStorage
  const loadProgress = () => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${serverId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  };

  const savedProgress = loadProgress();
  const [step, setStep] = useState(savedProgress.step || 1);
  const [botToken, setBotToken] = useState("");
  const [reportsChannel, setReportsChannel] = useState(savedProgress.reportsChannel || "");
  const [reportLogsChannel, setReportLogsChannel] = useState(savedProgress.reportLogsChannel || "");
  const [appealsCategory, setAppealsCategory] = useState(savedProgress.appealsCategory || "");
  const [appealLogsChannel, setAppealLogsChannel] = useState(savedProgress.appealLogsChannel || "");
  const [checkingBotStatus, setCheckingBotStatus] = useState(false);
  const [newBotToken, setNewBotToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Save progress whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${serverId}`, JSON.stringify({
      step,
      reportsChannel,
      reportLogsChannel,
      appealsCategory,
      appealLogsChannel,
    }));
  }, [serverId, step, reportsChannel, reportLogsChannel, appealsCategory, appealLogsChannel]);

  const { data: server, isLoading } = useQuery<Server>({
    queryKey: ["/api/servers", serverId],
    enabled: !!serverId,
  });

  const { data: botStatus, refetch: refetchBotStatus } = useQuery<{
    botOnline: boolean;
    botInServer: boolean;
    botTag?: string;
    serverName?: string;
    message: string;
  }>({
    queryKey: [`/api/servers/${serverId}/bot-status`],
    enabled: !!serverId && step >= 2,
    refetchInterval: step === 2 ? 5000 : false,
  });

  const botTokenMutation = useMutation({
    mutationFn: async (data: { botToken: string }) => {
      console.log('[Setup] Bot token mutation starting...', { serverId, tokenLength: data.botToken.length });
      const result = await apiRequest("PATCH", `/api/servers/${serverId}/update-bot-token`, data);
      console.log('[Setup] Bot token mutation response:', result);
      return result;
    },
    onSuccess: async (response) => {
      console.log('[Setup] Bot token mutation succeeded!', response);
      await queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      await queryClient.refetchQueries({ queryKey: ["/api/servers"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/servers/${serverId}/bot-status`] });
      await queryClient.refetchQueries({ queryKey: [`/api/servers/${serverId}/bot-status`] });
      toast({
        title: "✅ Bot Activated!",
        description: "Your Discord bot is now online and ready to moderate your server.",
      });
      setStep(2);
    },
    onError: (error: any) => {
      console.error('[Setup] Bot token mutation failed:', error);
      toast({
        title: "Bot Activation Failed",
        description: error.message || "Failed to start bot. Please verify your bot token is correct and has proper permissions.",
        variant: "destructive",
      });
    },
  });

  const restartBotMutation = useMutation({
    mutationFn: async (data: { botToken?: string }) => {
      return await apiRequest("POST", "/api/bot/restart", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
      toast({
        title: "Bot Restarted",
        description: "The bot has been restarted successfully and should be online shortly.",
      });
      setNewBotToken("");
      setShowTokenInput(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Restart Bot",
        description: error.message || "Failed to restart the bot. Please check your token and try again.",
        variant: "destructive",
      });
    },
  });

  const channelSetupMutation = useMutation({
    mutationFn: async (data: {
      reportsChannel?: string;
      reportLogsChannel?: string;
      appealsCategory?: string;
      appealLogsChannel?: string;
    }) => {
      return apiRequest("PATCH", `/api/servers/${serverId}/complete-setup`, data);
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      await queryClient.refetchQueries({ queryKey: ["/api/servers"] });
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${serverId}`);
      console.log('[Setup Complete] Server configuration saved:', response);
      toast({
        title: "✅ Setup Complete!",
        description: "Your Discord channels have been configured. Reports, appeals, and tickets are now active.",
      });
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1500);
    },
    onError: (error: any) => {
      console.error('[Setup Error]:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to configure server. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBotTokenSubmit = () => {
    console.log('[Setup] handleBotTokenSubmit called');
    console.log('[Setup] Bot token length:', botToken.length);
    console.log('[Setup] Server ID:', serverId);
    
    if (!botToken.trim()) {
      toast({
        title: "Bot Token Required",
        description: "Please enter your Discord bot token.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('[Setup] Submitting bot token to server...');
    botTokenMutation.mutate({ botToken: botToken.trim() });
  };

  const handleChannelSetup = () => {
    channelSetupMutation.mutate({
      reportsChannel,
      reportLogsChannel,
      appealsCategory,
      appealLogsChannel,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Query global bot status
  const { data: globalBotStatus } = useQuery<{
    online: boolean;
    botTag?: string;
    botId?: string;
  }>({
    queryKey: ["/api/bot/status"],
    refetchInterval: 10000, // Check every 10 seconds
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        {globalBotStatus && !globalBotStatus.online && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <strong>RoModerate Bot: Offline</strong>
                <p className="text-sm">The bot is currently offline. You can update the bot token and restart it here.</p>
                
                <Collapsible open={showTokenInput} onOpenChange={setShowTokenInput}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      data-testid="button-toggle-token-input"
                    >
                      {showTokenInput ? "Hide Token Input" : "Update Bot Token"}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="bot-token" className="text-sm">Discord Bot Token</Label>
                      <Input
                        id="bot-token"
                        type="password"
                        value={newBotToken}
                        onChange={(e) => setNewBotToken(e.target.value)}
                        placeholder="Paste your Discord bot token here"
                        data-testid="input-bot-token"
                      />
                      <p className="text-xs text-muted-foreground">
                        Get your token from the <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="underline">Discord Developer Portal</a>
                      </p>
                    </div>
                    <Button
                      onClick={() => restartBotMutation.mutate({ botToken: newBotToken })}
                      disabled={!newBotToken.trim() || restartBotMutation.isPending}
                      size="sm"
                      className="w-full"
                      data-testid="button-restart-bot"
                    >
                      {restartBotMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Restarting Bot...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Update Token & Restart Bot
                        </>
                      )}
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {globalBotStatus && globalBotStatus.online && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>RoModerate Bot: Online</strong> ({globalBotStatus.botTag})
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to RoModerate</h1>
          <p className="text-muted-foreground">
            Let's get your server {server?.name} set up and running!
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s <= step ? "w-16 bg-primary" : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <Card data-testid="card-bot-invite">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ServerIcon className="h-5 w-5" />
                Step 1: Invite RoModerate Bot
              </CardTitle>
              <CardDescription>
                Invite the RoModerate bot to your Discord server to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-sm">Before you continue:</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Click the invite button below</li>
                    <li>Select <strong>{server?.name}</strong> from the dropdown</li>
                    <li>Grant the requested permissions</li>
                    <li>Come back here and click Continue</li>
                  </ol>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  asChild
                  data-testid="button-invite-bot"
                >
                  <a
                    href={`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_BOT_CLIENT_ID}&permissions=8&integration_type=0&scope=bot+applications.commands`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ServerIcon className="mr-2 h-5 w-5" />
                    Invite RoModerate Bot to Discord
                  </a>
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  The bot needs permissions to manage roles, channels, and send messages.
                </div>
              </div>

              <Button
                className="w-full"
                onClick={async () => {
                  setCheckingBotStatus(true);
                  setStep(2);
                  await queryClient.invalidateQueries({ queryKey: [`/api/servers/${serverId}/channels`] });
                  await refetchBotStatus();
                  setTimeout(() => setCheckingBotStatus(false), 2000);
                }}
                variant="outline"
                disabled={checkingBotStatus}
                data-testid="button-continue-after-invite"
              >
                {checkingBotStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking bot connection...
                  </>
                ) : (
                  "I've invited the bot, Continue"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card data-testid="card-reports-setup">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Step 2: Configure Reports
              </CardTitle>
              <CardDescription>
                Choose where new reports and their logs will be sent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {botStatus && (
                <Alert variant={botStatus.botInServer ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {botStatus.message}
                    {!botStatus.botInServer && (
                      <a
                        href={`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_BOT_CLIENT_ID}&permissions=8&integration_type=0&scope=bot+applications.commands`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-sm underline hover:no-underline"
                      >
                        Invite Bot
                      </a>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="reports-channel">New Reports Channel</Label>
                <ChannelSelector
                  serverId={serverId}
                  value={reportsChannel}
                  onChange={setReportsChannel}
                  type="text"
                  placeholder="Select a channel for new reports"
                  testId="input-reports-channel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-logs-channel">Report Logs Channel</Label>
                <ChannelSelector
                  serverId={serverId}
                  value={reportLogsChannel}
                  onChange={setReportLogsChannel}
                  type="text"
                  placeholder="Select a channel for report logs"
                  testId="input-report-logs-channel"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  data-testid="button-back-to-bot"
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                  data-testid="button-continue-to-appeals"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card data-testid="card-appeals-setup">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Step 3: Set Up Appeals
              </CardTitle>
              <CardDescription>
                Choose a category for new appeal tickets and a channel to store their logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appeals-category">Appeals Category</Label>
                <ChannelSelector
                  serverId={serverId}
                  value={appealsCategory}
                  onChange={setAppealsCategory}
                  type="category"
                  placeholder="Select a category for appeals"
                  testId="input-appeals-category"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appeal-logs-channel">Appeal Logs Channel</Label>
                <ChannelSelector
                  serverId={serverId}
                  value={appealLogsChannel}
                  onChange={setAppealLogsChannel}
                  type="text"
                  placeholder="Select a channel for appeal logs"
                  testId="input-appeal-logs-channel"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  data-testid="button-back-to-reports"
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleChannelSetup}
                  disabled={channelSetupMutation.isPending}
                  data-testid="button-complete-setup"
                >
                  {channelSetupMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {channelSetupMutation.isSuccess && step === 3 && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">All Set!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your server is fully configured. You can update these settings anytime.
                  </p>
                </div>
                <Button onClick={() => setLocation("/dashboard")} data-testid="button-go-to-dashboard">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
