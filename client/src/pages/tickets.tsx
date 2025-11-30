import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Users, Clock, UserCheck, X, RefreshCcw, ArrowUp, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server, Ticket } from "@shared/schema";
import { useState, useEffect } from "react";
import { ServerSelector } from "@/components/server-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tickets() {
  const { toast } = useToast();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const { data: servers = [], isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: [`/api/tickets?serverId=${selectedServer}`],
    enabled: !!selectedServer,
  });

  const claimMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return await apiRequest("PATCH", `/api/tickets/${ticketId}`, {
        assignedTo: "current_user"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/tickets');
        }
      });
      toast({
        title: "Ticket claimed",
        description: "You are now assigned to this ticket",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim ticket",
        variant: "destructive",
      });
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ ticketId, priority }: { ticketId: string; priority: string }) => {
      return await apiRequest("PATCH", `/api/tickets/${ticketId}`, { priority });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/tickets');
        }
      });
      toast({
        title: "Priority updated",
        description: "Ticket priority has been changed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update priority",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/tickets/${ticketId}`, { 
        status,
        closedAt: status === "closed" ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/tickets');
        }
      });
      toast({
        title: "Status updated",
        description: "Ticket status has been changed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
    if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;
    return true;
  });

  const openTickets = filteredTickets.filter(t => t.status === "open");
  const closedTickets = filteredTickets.filter(t => t.status === "closed");

  if (serversLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>;
  }

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Users className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Servers Found</h2>
        <p className="text-muted-foreground">Connect a Discord server to manage tickets</p>
      </div>
    );
  }

  const renderTicket = (ticket: Ticket) => (
    <Card key={ticket.id} className="hover-elevate transition-all" data-testid={`ticket-card-${ticket.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{ticket.title}</CardTitle>
              <CardDescription className="mt-1">
                {ticket.discordUsername} • {ticket.category}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  ticket.status === "open" ? "default" :
                  ticket.status === "closed" ? "secondary" :
                  "outline"
                }
                data-testid={`badge-status-${ticket.id}`}
              >
                {ticket.status}
              </Badge>
              <Badge
                variant={
                  ticket.priority === "high" ? "destructive" :
                  ticket.priority === "medium" ? "default" :
                  "secondary"
                }
                className="text-xs"
                data-testid={`badge-priority-${ticket.id}`}
              >
                {ticket.priority}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          {!ticket.assignedTo && ticket.status === "open" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => claimMutation.mutate(ticket.id)}
              disabled={claimMutation.isPending}
              data-testid={`button-claim-${ticket.id}`}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Claim
            </Button>
          )}
          
          {ticket.status === "open" && (
            <Select
              value={ticket.priority}
              onValueChange={(priority) => updatePriorityMutation.mutate({ ticketId: ticket.id, priority })}
            >
              <SelectTrigger className="w-32" data-testid={`select-priority-${ticket.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {ticket.status === "open" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatusMutation.mutate({ ticketId: ticket.id, status: "closed" })}
              disabled={updateStatusMutation.isPending}
              data-testid={`button-close-${ticket.id}`}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatusMutation.mutate({ ticketId: ticket.id, status: "open" })}
              disabled={updateStatusMutation.isPending}
              data-testid={`button-reopen-${ticket.id}`}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Reopen
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
          <Clock className="h-4 w-4" />
          <span>Created {new Date(ticket.createdAt!).toLocaleString()}</span>
          {ticket.closedAt && (
            <>
              <span>•</span>
              <span>Closed {new Date(ticket.closedAt).toLocaleString()}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">Manage player support requests</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40" data-testid="select-priority-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {servers.length > 1 && (
            <ServerSelector
              servers={servers}
              value={selectedServer}
              onChange={setSelectedServer}
              testId="select-server"
            />
          )}
        </div>
      </div>

      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open" data-testid="tab-open">
            Open ({openTickets.length})
          </TabsTrigger>
          <TabsTrigger value="closed" data-testid="tab-closed">
            Closed ({closedTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4 mt-6">
          {ticketsLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-48" />)
          ) : openTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No open tickets</p>
                <p className="text-sm text-muted-foreground">All tickets have been resolved</p>
              </CardContent>
            </Card>
          ) : (
            openTickets.map(renderTicket)
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4 mt-6">
          {ticketsLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-48" />)
          ) : closedTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No closed tickets</p>
                <p className="text-sm text-muted-foreground">Closed tickets will appear here</p>
              </CardContent>
            </Card>
          ) : (
            closedTickets.map(renderTicket)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
