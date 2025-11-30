import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Hash, Save, FolderOpen, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server } from "@shared/schema";
import { RoleSelector } from "@/components/role-selector";

export default function AppealsSettings() {
  const { toast } = useToast();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [appealsCategory, setAppealsCategory] = useState("");
  const [appealLogsChannel, setAppealLogsChannel] = useState("");
  const [canAppealRoles, setCanAppealRoles] = useState<string[]>([]);
  const [canRespondToAppealsRoles, setCanRespondToAppealsRoles] = useState<string[]>([]);
  const [excludedFromAppealsRoles, setExcludedFromAppealsRoles] = useState<string[]>([]);

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const currentServer = selectedServer 
    ? servers.find(s => s.id === selectedServer) 
    : servers[0];

  useEffect(() => {
    if (currentServer?.settings) {
      setAppealsCategory(currentServer.settings.appealsCategory || "");
      setAppealLogsChannel(currentServer.settings.appealLogsChannel || "");
      setCanAppealRoles(currentServer.settings.canAppealRoles || []);
      setCanRespondToAppealsRoles(currentServer.settings.canRespondToAppealsRoles || []);
      setExcludedFromAppealsRoles(currentServer.settings.excludedFromAppealsRoles || []);
    }
  }, [currentServer]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/servers/${currentServer?.id}/settings`, {
        appealsCategory,
        appealLogsChannel,
        canAppealRoles,
        canRespondToAppealsRoles,
        excludedFromAppealsRoles,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({
        title: "Settings Saved",
        description: "Appeal channel settings have been updated successfully.",
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
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Server Selected</h2>
        <p className="text-muted-foreground">
          Please select a server to configure appeal settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <AlertCircle className="h-8 w-8" />
          Appeals Settings
        </h1>
        <p className="text-muted-foreground">
          Configure where appeal tickets and logs go
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

      <Card>
        <CardHeader>
          <CardTitle>Appeals Category</CardTitle>
          <CardDescription>
            Choose where appeal tickets will be created
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appeals-category">Category ID or Name</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="appeals-category"
                  placeholder="appeals or 123456789012345678"
                  value={appealsCategory}
                  onChange={(e) => setAppealsCategory(e.target.value)}
                  className="pl-9"
                  data-testid="input-appeals-category"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Discord category where appeal tickets will be created. Each appeal will create a new channel within this category.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appeal Logs Channel</CardTitle>
          <CardDescription>
            Choose where appeal action logs will be stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appeal-logs-channel">Channel ID or Name</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="appeal-logs-channel"
                  placeholder="appeal-logs or 123456789012345678"
                  value={appealLogsChannel}
                  onChange={(e) => setAppealLogsChannel(e.target.value)}
                  className="pl-9"
                  data-testid="input-appeal-logs-channel"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This channel will store logs of all appeal actions (accepted, rejected, etc.). Useful for audit trails.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Appeal Permissions
          </CardTitle>
          <CardDescription>
            Configure which Discord roles can submit appeals, respond to appeals, or are excluded
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Who Can Appeal Bans</Label>
            {currentServer && (
              <RoleSelector
                serverId={currentServer.id}
                value={canAppealRoles}
                onChange={setCanAppealRoles}
                multiple={true}
                placeholder="Select roles that can appeal"
                testId="select-can-appeal-roles"
              />
            )}
            <p className="text-sm text-muted-foreground">
              Users with these roles will be able to submit ban appeals
            </p>
          </div>

          <div className="space-y-2">
            <Label>Who Can Respond to Appeals</Label>
            {currentServer && (
              <RoleSelector
                serverId={currentServer.id}
                value={canRespondToAppealsRoles}
                onChange={setCanRespondToAppealsRoles}
                multiple={true}
                placeholder="Select roles that can respond"
                testId="select-can-respond-to-appeals-roles"
              />
            )}
            <p className="text-sm text-muted-foreground">
              Staff members with these roles will be able to review and respond to appeals
            </p>
          </div>

          <div className="space-y-2">
            <Label>Excluded from Appeals</Label>
            {currentServer && (
              <RoleSelector
                serverId={currentServer.id}
                value={excludedFromAppealsRoles}
                onChange={setExcludedFromAppealsRoles}
                multiple={true}
                placeholder="Select roles excluded from appeals"
                testId="select-excluded-from-appeals-roles"
              />
            )}
            <p className="text-sm text-muted-foreground">
              Users with these roles cannot submit appeals (e.g., permanently banned users)
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

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm">Pro Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use a dedicated category for appeals to keep them organized. Set category permissions so only moderators can view appeal tickets. The bot will automatically create channels in this category when users submit appeals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
