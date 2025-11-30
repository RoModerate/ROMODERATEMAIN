import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileCheck, Users, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server, Appeal } from "@shared/schema";
import { useState, useEffect } from "react";

export default function Appeals() {
  const { toast } = useToast();
  const { data: servers = [], isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const { data: appeals = [], isLoading: appealsLoading } = useQuery<Appeal[]>({
    queryKey: [`/api/appeals?serverId=${selectedServer}`],
    enabled: !!selectedServer,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ appealId, status, note }: { appealId: string; status: string; note?: string }) => {
      return await apiRequest("PATCH", `/api/appeals/${appealId}`, { status, reviewNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appeals?serverId=${selectedServer}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/bans?serverId=${selectedServer}`] });
      toast({ title: "Appeal reviewed successfully" });
      setReviewNote({});
    },
    onError: () => {
      toast({ title: "Failed to review appeal", variant: "destructive" });
    },
  });

  if (serversLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>;
  }

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Users className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Servers Found</h2>
        <p className="text-muted-foreground">Connect a Discord server to manage appeals</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ban Appeals</h1>
          <p className="text-muted-foreground">Review and respond to player ban appeals</p>
        </div>
        {servers.length > 1 && (
          <select
            className="px-4 py-2 rounded-lg border bg-background"
            value={selectedServer || ""}
            onChange={(e) => setSelectedServer(e.target.value)}
            data-testid="select-server"
          >
            {servers.map((server) => (
              <option key={server.id} value={server.id}>{server.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-4">
        {appealsLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)
        ) : appeals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileCheck className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No appeals yet</p>
              <p className="text-sm text-muted-foreground">Ban appeals will appear here</p>
            </CardContent>
          </Card>
        ) : (
          appeals.map((appeal) => (
            <Card key={appeal.id} className="hover-elevate transition-all bg-card/50 border-2" data-testid={`appeal-card-${appeal.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Ban Appeal</CardTitle>
                      <CardDescription>
                        Appeal ID: {appeal.id.substring(0, 12)}
                        {appeal.discordUserId && ` • Discord: ${appeal.discordUserId}`}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={
                      appeal.status === "approved" ? "default" :
                      appeal.status === "denied" ? "destructive" :
                      "secondary"
                    }
                  >
                    {appeal.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Appeal Message</p>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm whitespace-pre-wrap">{appeal.appealText}</p>
                  </div>
                </div>

                {appeal.reviewNote && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Review Note</p>
                    <div className="p-4 rounded-lg bg-primary/5 border">
                      <p className="text-sm">{appeal.reviewNote}</p>
                    </div>
                  </div>
                )}

                {appeal.status === "pending" && (
                  <div className="space-y-3 pt-4 border-t">
                    <Textarea
                      placeholder="Add a note for your review decision (optional)..."
                      value={reviewNote[appeal.id] || ""}
                      onChange={(e) => setReviewNote({ ...reviewNote, [appeal.id]: e.target.value })}
                      className="min-h-[80px]"
                      data-testid={`textarea-review-note-${appeal.id}`}
                    />
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        onClick={() => reviewMutation.mutate({
                          appealId: appeal.id,
                          status: "approved",
                          note: reviewNote[appeal.id]
                        })}
                        disabled={reviewMutation.isPending}
                        data-testid={`button-approve-${appeal.id}`}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve Appeal
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => reviewMutation.mutate({
                          appealId: appeal.id,
                          status: "denied",
                          note: reviewNote[appeal.id]
                        })}
                        disabled={reviewMutation.isPending}
                        data-testid={`button-deny-${appeal.id}`}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Deny Appeal
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
