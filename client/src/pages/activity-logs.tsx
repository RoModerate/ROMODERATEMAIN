import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Filter, 
  Ban, 
  FileCheck, 
  MessageSquare, 
  Shield,
  UserX,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import type { Server } from "@shared/schema";
import { ServerSelector } from "@/components/server-selector";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ModerationLog {
  id: string;
  serverId: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: any;
  metadata: any;
  createdAt: Date;
  user?: {
    id: string;
    discordId: string;
    username: string;
    avatar: string | null;
  };
}

export default function ActivityLogs() {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(100);

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const { data: logs = [], isLoading } = useQuery<ModerationLog[]>({
    queryKey: ["/api/servers", selectedServer, "moderation-logs", { action: actionFilter !== "all" ? actionFilter : undefined, limit }],
    enabled: !!selectedServer,
  });

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const filteredLogs = logs.filter(log => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(query) ||
        log.user?.username.toLowerCase().includes(query) ||
        log.targetType.toLowerCase().includes(query) ||
        JSON.stringify(log.details).toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "ban_created": return <Ban className="h-4 w-4 text-destructive" />;
      case "ban_revoked": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "appeal_created": return <FileCheck className="h-4 w-4 text-yellow-500" />;
      case "appeal_approved": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "appeal_rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      case "ticket_created": return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "ticket_closed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Shield className="h-4 w-4 text-primary" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "ban_created": return "destructive";
      case "ban_revoked": return "default";
      case "appeal_created": return "secondary";
      case "appeal_approved": return "default";
      case "appeal_rejected": return "destructive";
      case "ticket_created": return "secondary";
      case "ticket_closed": return "default";
      default: return "outline";
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["Date", "Time", "User", "Action", "Target Type", "Target ID", "Details"],
      ...filteredLogs.map(log => [
        format(new Date(log.createdAt), "yyyy-MM-dd"),
        format(new Date(log.createdAt), "HH:mm:ss"),
        log.user?.username || "Unknown",
        log.action,
        log.targetType,
        log.targetId,
        JSON.stringify(log.details),
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
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
            Complete audit trail of all moderation actions
          </p>
        </div>
        <ServerSelector
          servers={servers}
          value={selectedServer}
          onChange={setSelectedServer}
          testId="select-server"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Refine your search and export results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" data-testid="label-search">Search</Label>
              <Input
                id="search"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action" data-testid="label-action">Action Type</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger id="action" data-testid="select-action">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="ban_created">Bans Created</SelectItem>
                  <SelectItem value="ban_revoked">Bans Revoked</SelectItem>
                  <SelectItem value="appeal_created">Appeals Created</SelectItem>
                  <SelectItem value="appeal_approved">Appeals Approved</SelectItem>
                  <SelectItem value="appeal_rejected">Appeals Rejected</SelectItem>
                  <SelectItem value="ticket_created">Tickets Created</SelectItem>
                  <SelectItem value="ticket_closed">Tickets Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit" data-testid="label-limit">Results Limit</Label>
              <Select value={String(limit)} onValueChange={(v) => setLimit(parseInt(v))}>
                <SelectTrigger id="limit" data-testid="select-limit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 logs</SelectItem>
                  <SelectItem value="100">100 logs</SelectItem>
                  <SelectItem value="250">250 logs</SelectItem>
                  <SelectItem value="500">500 logs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} logs
            </p>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              data-testid="button-export-csv"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Chronological log of all moderation actions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 space-y-3">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto animate-spin" />
              <p className="text-sm text-muted-foreground">Loading activity logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium">No logs found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || actionFilter !== "all" 
                    ? "Try adjusting your filters"
                    : "Activity logs will appear here as actions are taken"
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-4 rounded-lg border hover-elevate"
                  data-testid={`log-${log.id}`}
                >
                  <div className="mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={getActionColor(log.action) as any} className="text-xs">
                        {log.action.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{log.targetType}</span>
                      {log.user && (
                        <>
                          <span className="text-sm text-muted-foreground">•</span>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              {log.user.avatar && (
                                <AvatarImage
                                  src={`https://cdn.discordapp.com/avatars/${log.user.discordId}/${log.user.avatar}.png`}
                                  alt={log.user.username}
                                />
                              )}
                              <AvatarFallback className="text-xs">
                                {log.user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{log.user.username}</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {log.details && (
                      <div className="text-sm text-foreground mb-2">
                        {log.details.reason && <p><span className="font-medium">Reason:</span> {log.details.reason}</p>}
                        {log.details.robloxUsername && <p><span className="font-medium">Roblox User:</span> {log.details.robloxUsername}</p>}
                        {log.details.title && <p><span className="font-medium">Title:</span> {log.details.title}</p>}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.createdAt), "PPp")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
