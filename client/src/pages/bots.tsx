import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, ExternalLink, Copy, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BotRegistration, Server } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Bots() {
  const { toast } = useToast();
  const [botId, setBotId] = useState("");
  const [botName, setBotName] = useState("");
  const [selectedServer, setSelectedServer] = useState("");
  const [registrationSecret, setRegistrationSecret] = useState<string | null>(null);
  const [deleteBot, setDeleteBot] = useState<BotRegistration | null>(null);

  const { data: bots, isLoading } = useQuery<BotRegistration[]>({
    queryKey: ["/api/bots"],
  });

  const { data: servers } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { botId: string; botName: string; serverId: string }) => {
      const response = await apiRequest("POST", "/api/bots/register", data);
      return await response.json();
    },
    onSuccess: (data: { secret: string }) => {
      setRegistrationSecret(data.secret);
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Bot registered",
        description: "Your bot has been registered successfully. Save the secret shown below.",
      });
      setBotId("");
      setBotName("");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register bot",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/bots/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Bot removed",
        description: "Bot registration has been removed",
      });
      setDeleteBot(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove bot",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleRegister = () => {
    if (!botId.trim() || !botName.trim() || !selectedServer) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      botId: botId.trim(),
      botName: botName.trim(),
      serverId: selectedServer,
    });
  };

  const copySecret = () => {
    if (registrationSecret) {
      navigator.clipboard.writeText(registrationSecret);
      toast({
        title: "Copied",
        description: "Secret copied to clipboard",
      });
    }
  };

  const officialBotUrl = `https://discord.com/api/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_CLIENT_ID || 'YOUR_CLIENT_ID'}&permissions=8&scope=bot%20applications.commands`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Bot Management</h1>
        <p className="text-muted-foreground">
          Connect Discord bots to your servers for moderation automation
        </p>
      </div>

      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-blue-500" />
            Two Ways to Connect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card/50">
              <h4 className="font-semibold mb-2">Option 1: Official Bot (Easiest)</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Use our pre-configured bot - no hosting required. Just invite it to your server and it works immediately.
              </p>
              <Badge variant="default">Recommended for most users</Badge>
            </div>
            <div className="p-4 rounded-lg border bg-card/50">
              <h4 className="font-semibold mb-2">Option 2: Self-Hosted Bot</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Register and host your own Discord bot. You provide the bot token and run the bot yourself. Full control and customization.
              </p>
              <Badge variant="secondary">For advanced users</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Official Bot */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Official Bot</CardTitle>
                <CardDescription>Invite our pre-configured bot</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span>Click the invite link below</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span>Select your Discord server</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span>Authorize the required permissions</span>
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={() => window.open(officialBotUrl, '_blank')}
              data-testid="button-invite-official-bot"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Invite Official Bot
            </Button>
            
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-muted-foreground">
                ✓ No setup required • ✓ Instantly works • ✓ Automatic updates
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Register Your Bot */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/50 flex items-center justify-center">
                <Bot className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Register Your Bot</CardTitle>
                <CardDescription>Connect your own Discord bot</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="botName">Bot Name</Label>
                <Input
                  id="botName"
                  placeholder="My Bot"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  data-testid="input-bot-name"
                />
              </div>

              <div>
                <Label htmlFor="botId">Bot Client ID</Label>
                <Input
                  id="botId"
                  placeholder="1234567890123456789"
                  value={botId}
                  onChange={(e) => setBotId(e.target.value)}
                  className="font-mono"
                  data-testid="input-bot-id"
                />
              </div>

              <div>
                <Label htmlFor="server">Server</Label>
                <Select value={selectedServer} onValueChange={setSelectedServer}>
                  <SelectTrigger id="server" data-testid="select-bot-server">
                    <SelectValue placeholder="Select a server" />
                  </SelectTrigger>
                  <SelectContent>
                    {servers?.map((server) => (
                      <SelectItem key={server.id} value={server.id}>
                        {server.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleRegister}
              disabled={registerMutation.isPending}
              className="w-full"
              data-testid="button-register-bot"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Bot"
              )}
            </Button>

            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs font-medium mb-1">⚠️ Important: You Must Host the Bot</p>
              <p className="text-xs text-muted-foreground">
                After registration, you receive a secret token. You must run your own Discord bot instance with this token. The dashboard does NOT host or run your bot for you.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Secret Display */}
      {registrationSecret && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Bot Registered Successfully
            </CardTitle>
            <CardDescription>
              Save this secret - it won't be shown again
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between gap-4">
                <code className="text-sm font-mono break-all flex-1">
                  {registrationSecret}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copySecret}
                  data-testid="button-copy-secret"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Copy the secret above and store it securely</li>
                <li>Configure your bot with this secret in the environment variables</li>
                <li>Start your bot and it will connect to the dashboard</li>
              </ol>
            </div>
            <Button
              variant="outline"
              onClick={() => setRegistrationSecret(null)}
              data-testid="button-close-secret"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Registered Bots List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Bots</CardTitle>
          <CardDescription>
            Bots connected to your servers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : bots && bots.length > 0 ? (
            <div className="space-y-3">
              {bots.map((bot) => (
                <div 
                  key={bot.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border"
                  data-testid={`bot-${bot.id}`}
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{bot.botName}</p>
                    <p className="text-sm text-muted-foreground font-mono truncate">
                      {bot.botId}
                    </p>
                  </div>
                  <Badge variant={bot.status === "active" ? "default" : "secondary"}>
                    {bot.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteBot(bot)}
                    data-testid={`button-delete-${bot.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No bots registered</p>
                <p className="text-sm text-muted-foreground">
                  Register a bot using the forms above
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteBot} onOpenChange={() => setDeleteBot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Bot Registration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the bot registration for <strong>{deleteBot?.botName}</strong>.
              The bot will no longer be able to connect to the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBot && deleteMutation.mutate(deleteBot.id)}
              data-testid="button-confirm-delete"
            >
              Remove Bot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
