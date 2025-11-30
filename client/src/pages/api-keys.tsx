import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Save, ExternalLink, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiRoblox } from "react-icons/si";

export default function ApiKeys() {
  const { toast } = useToast();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [robloxApiKey, setRobloxApiKey] = useState("");
  const [universeId, setUniverseId] = useState("");

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const currentServer = selectedServer 
    ? servers.find(s => s.id === selectedServer) 
    : servers[0];

  useEffect(() => {
    if (currentServer?.settings) {
      setRobloxApiKey(currentServer.settings.robloxApiKey || "");
      setUniverseId(currentServer.settings.robloxUniverseId || "");
    }
  }, [currentServer]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!robloxApiKey || !universeId) {
        throw new Error("Both API Key and Universe ID are required for ban enforcement to work");
      }
      return await apiRequest("PATCH", `/api/servers/${currentServer?.id}/settings`, {
        robloxApiKey,
        robloxUniverseId: universeId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({
        title: "Settings Saved",
        description: "Roblox API settings have been saved. Bans will now be enforced in your Roblox game.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  if (!currentServer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Server Selected</h2>
        <p className="text-muted-foreground">
          Please select a server to configure Roblox API keys.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SiRoblox className="h-8 w-8" />
          Roblox API Keys
        </h1>
        <p className="text-muted-foreground">
          Configure Roblox Open Cloud API for ban management integration
        </p>
      </div>

      {servers.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Server</CardTitle>
            <CardDescription>Choose which server to configure</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedServer || currentServer.id} onValueChange={setSelectedServer}>
              <SelectTrigger data-testid="select-server">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {servers.map((server) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SiRoblox className="h-5 w-5" />
            What is Roblox Open Cloud?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Roblox Open Cloud allows you to programmatically manage bans in your Roblox games. When you ban a player through RoModerate, the ban will be automatically applied to your Roblox game using the Open Cloud API.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://create.roblox.com/dashboard/credentials', '_blank')}
            data-testid="button-create-api-key"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Create API Key on Roblox
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roblox API Key</CardTitle>
          <CardDescription>
            Your Roblox Open Cloud API key with ban permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roblox-api-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="roblox-api-key"
                  type="password"
                  placeholder="Enter your Roblox Open Cloud API key"
                  value={robloxApiKey}
                  onChange={(e) => setRobloxApiKey(e.target.value)}
                  className="pl-9"
                  data-testid="input-roblox-api-key"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Make sure your API key has permissions for user restriction (bans) in your universe.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Universe ID</CardTitle>
          <CardDescription>
            The Universe ID of your Roblox game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="universe-id">Universe ID</Label>
            <Input
              id="universe-id"
              placeholder="123456789"
              value={universeId}
              onChange={(e) => setUniverseId(e.target.value)}
              data-testid="input-universe-id"
            />
            <p className="text-sm text-muted-foreground">
              You can find your Universe ID in the Roblox Creator Dashboard under your game's settings.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          data-testid="button-save"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How to Get Your API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Go to <a href="https://create.roblox.com/dashboard/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Roblox Creator Dashboard</a></li>
            <li>Click "Create API Key"</li>
            <li>Select your experience (game)</li>
            <li>Add permissions: <strong>User Restrictions</strong> (for bans)</li>
            <li>Copy the API key and paste it above</li>
            <li>Enter your Universe ID (found in your game's settings)</li>
          </ol>
        </CardContent>
      </Card>

      {currentServer.settings?.robloxApiKey && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-green-600 dark:text-green-400">
              <Shield className="h-4 w-4" />
              API Integration Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your Roblox API is configured. Bans created in RoModerate will be automatically applied to your Roblox game.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
