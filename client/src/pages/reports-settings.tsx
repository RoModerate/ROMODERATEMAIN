import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileCheck, Hash, Save, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server } from "@shared/schema";
import { RoleSelector } from "@/components/role-selector";

export default function ReportsSettings() {
  const { toast } = useToast();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [reportsChannel, setReportsChannel] = useState("");
  const [reportLogsChannel, setReportLogsChannel] = useState("");
  const [canFileReportRoles, setCanFileReportRoles] = useState<string[]>([]);
  const [canViewReportRoles, setCanViewReportRoles] = useState<string[]>([]);
  const [excludedFromReportsRoles, setExcludedFromReportsRoles] = useState<string[]>([]);

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const currentServer = selectedServer 
    ? servers.find(s => s.id === selectedServer) 
    : servers[0];

  useEffect(() => {
    if (currentServer?.settings) {
      setReportsChannel(currentServer.settings.reportsChannel || "");
      setReportLogsChannel(currentServer.settings.reportLogsChannel || "");
      setCanFileReportRoles(currentServer.settings.canFileReportRoles || []);
      setCanViewReportRoles(currentServer.settings.canViewReportRoles || []);
      setExcludedFromReportsRoles(currentServer.settings.excludedFromReportsRoles || []);
    }
  }, [currentServer]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/servers/${currentServer?.id}/settings`, {
        reportsChannel,
        reportLogsChannel,
        canFileReportRoles,
        canViewReportRoles,
        excludedFromReportsRoles,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({
        title: "Settings Saved",
        description: "Report channel settings have been updated successfully.",
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
        <FileCheck className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Server Selected</h2>
        <p className="text-muted-foreground">
          Please select a server to configure report settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileCheck className="h-8 w-8" />
          Reports Settings
        </h1>
        <p className="text-muted-foreground">
          Configure where new reports and logs are sent
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
          <CardTitle>New Reports Channel</CardTitle>
          <CardDescription>
            Choose where new player reports will be posted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reports-channel">Channel ID or Name</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reports-channel"
                  placeholder="reports or 123456789012345678"
                  value={reportsChannel}
                  onChange={(e) => setReportsChannel(e.target.value)}
                  className="pl-9"
                  data-testid="input-reports-channel"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the channel ID or name where new reports should be sent. Make sure the bot has permission to send messages in this channel.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Logs Channel</CardTitle>
          <CardDescription>
            Choose where report action logs will be stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-logs-channel">Channel ID or Name</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="report-logs-channel"
                  placeholder="report-logs or 123456789012345678"
                  value={reportLogsChannel}
                  onChange={(e) => setReportLogsChannel(e.target.value)}
                  className="pl-9"
                  data-testid="input-report-logs-channel"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This channel will store logs of all report actions (accepted, rejected, etc.). Useful for audit trails.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Report Permissions
          </CardTitle>
          <CardDescription>
            Configure which Discord roles can file reports, view reports, or are excluded from being reported
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Who Can File Reports</Label>
            {currentServer && (
              <RoleSelector
                serverId={currentServer.id}
                value={canFileReportRoles}
                onChange={setCanFileReportRoles}
                multiple={true}
                placeholder="Select roles that can file reports"
                testId="select-can-file-report-roles"
              />
            )}
            <p className="text-sm text-muted-foreground">
              Users with these roles will be able to submit player reports
            </p>
          </div>

          <div className="space-y-2">
            <Label>Who Can View Reports</Label>
            {currentServer && (
              <RoleSelector
                serverId={currentServer.id}
                value={canViewReportRoles}
                onChange={setCanViewReportRoles}
                multiple={true}
                placeholder="Select roles that can view reports"
                testId="select-can-view-report-roles"
              />
            )}
            <p className="text-sm text-muted-foreground">
              Staff members with these roles will be able to view and process reports
            </p>
          </div>

          <div className="space-y-2">
            <Label>Excluded from Reports</Label>
            {currentServer && (
              <RoleSelector
                serverId={currentServer.id}
                value={excludedFromReportsRoles}
                onChange={setExcludedFromReportsRoles}
                multiple={true}
                placeholder="Select roles excluded from reports"
                testId="select-excluded-from-reports-roles"
              />
            )}
            <p className="text-sm text-muted-foreground">
              Users with these roles cannot be reported (useful for staff/moderators)
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
            Keep your report logs channel separate from the main reports channel to maintain a clean audit trail. You can also use Discord's forum channels for better organization of individual reports.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
