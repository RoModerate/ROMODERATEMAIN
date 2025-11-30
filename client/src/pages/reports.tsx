import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  User, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Users,
  Shield
} from "lucide-react";
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

interface BloxlinkResult {
  robloxId?: string;
  robloxUsername?: string;
  avatar?: string;
  discordId?: string;
  verified?: boolean;
  groups?: Array<{ id: string; name: string; role: string }>;
  flags?: string[];
}

export default function Reports() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState<"username" | "id">("username");
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [result, setResult] = useState<BloxlinkResult | null>(null);

  const { data: servers } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const searchMutation = useMutation({
    mutationFn: async (data: { query: string; queryType: string; serverId?: string }) => {
      const response = await apiRequest("POST", "/api/bloxlink/lookup", data);
      return response as BloxlinkResult;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/blox-requests/recent"] });
      toast({
        title: "Lookup successful",
        description: "Bloxlink data retrieved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lookup failed",
        description: error.message || "Failed to retrieve Bloxlink data",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a Roblox username or ID",
        variant: "destructive",
      });
      return;
    }

    searchMutation.mutate({
      query: query.trim(),
      queryType,
      serverId: selectedServer || undefined,
    });
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Bloxlink Reports</h1>
        <p className="text-muted-foreground">
          Search and verify Roblox users with Bloxlink integration
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>New Lookup</CardTitle>
          <CardDescription>
            Search for a Roblox user by username or ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="query">Roblox Username or ID</Label>
              <Input
                id="query"
                placeholder="Enter username or ID"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                data-testid="input-roblox-query"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="queryType">Search Type</Label>
              <Select value={queryType} onValueChange={(v) => setQueryType(v as "username" | "id")}>
                <SelectTrigger id="queryType" data-testid="select-query-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="username">Username</SelectItem>
                  <SelectItem value="id">User ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {servers && servers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="server">Server (Optional)</Label>
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger id="server" data-testid="select-server">
                  <SelectValue placeholder="Select a server" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (General lookup)</SelectItem>
                  {servers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            onClick={handleSearch} 
            disabled={searchMutation.isPending}
            className="w-full md:w-auto"
            data-testid="button-search"
          >
            {searchMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card data-testid="result-card">
          <CardHeader>
            <CardTitle>Verification Report</CardTitle>
            <CardDescription>
              Bloxlink data for {result.robloxUsername || query}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <Avatar className="h-16 w-16">
                <AvatarImage src={result.avatar} alt={result.robloxUsername} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {result.robloxUsername?.substring(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{result.robloxUsername || "Unknown"}</h3>
                  {result.verified ? (
                    <Badge className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Not Verified
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {result.robloxId && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="font-mono">{result.robloxId}</span>
                    </div>
                  )}
                  {result.discordId && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span className="font-mono">{result.discordId}</span>
                    </div>
                  )}
                </div>
                {result.robloxId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://www.roblox.com/users/${result.robloxId}/profile`, '_blank')}
                    data-testid="button-view-roblox-profile"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View Roblox Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Groups */}
            {result.groups && result.groups.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Roblox Groups
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.groups.map((group, idx) => (
                    <div key={idx} className="p-3 rounded-lg border">
                      <p className="font-medium text-sm">{group.name}</p>
                      <p className="text-xs text-muted-foreground">Role: {group.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flags */}
            {result.flags && result.flags.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Moderation Flags</h4>
                <div className="flex flex-wrap gap-2">
                  {result.flags.map((flag, idx) => (
                    <Badge key={idx} variant="destructive">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!result && !searchMutation.isPending && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">No results yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Enter a Roblox username or ID above to generate a verification report
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
