import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Zap, Plus, Trash2, Power, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server, AutoAction } from "@shared/schema";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const autoActionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  trigger: z.enum(["report_threshold", "trusted_mod_vote", "repeat_offender"]),
  action: z.enum(["auto_ban", "auto_tempban", "auto_warn", "notify_admins"]),
  reportCount: z.string().optional(),
  trustedModCount: z.string().optional(),
  timeWindow: z.string().optional(),
  duration: z.string().optional(),
  reason: z.string().optional(),
});

type AutoActionFormData = z.infer<typeof autoActionSchema>;

export default function AutoActions() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: servers = [], isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const { data: actions = [], isLoading: actionsLoading } = useQuery<AutoAction[]>({
    queryKey: [`/api/servers/${selectedServer}/auto-actions`],
    enabled: !!selectedServer,
  });

  const form = useForm<AutoActionFormData>({
    resolver: zodResolver(autoActionSchema),
    defaultValues: {
      name: "",
      trigger: "report_threshold",
      action: "notify_admins",
      reportCount: "3",
      trustedModCount: "2",
      timeWindow: "7",
      duration: "7",
      reason: "Automated action triggered",
    },
  });

  const createActionMutation = useMutation({
    mutationFn: async (data: AutoActionFormData) => {
      const conditions: any = {};
      const actionParams: any = {};
      
      if (data.reportCount) conditions.reportCount = parseInt(data.reportCount);
      if (data.trustedModCount) conditions.trustedModCount = parseInt(data.trustedModCount);
      if (data.timeWindow) conditions.timeWindow = parseInt(data.timeWindow);
      if (data.duration) actionParams.duration = parseInt(data.duration);
      if (data.reason) actionParams.reason = data.reason;
      
      return await apiRequest("POST", `/api/servers/${selectedServer}/auto-actions`, {
        name: data.name,
        trigger: data.trigger,
        conditions,
        action: data.action,
        actionParams,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${selectedServer}/auto-actions`] });
      toast({
        title: "Auto action created",
        description: "The automation rule has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create auto action",
        variant: "destructive",
      });
    },
  });

  const toggleActionMutation = useMutation({
    mutationFn: async ({ actionId, isActive }: { actionId: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/servers/${selectedServer}/auto-actions/${actionId}`, {
        isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${selectedServer}/auto-actions`] });
      toast({
        title: "Auto action updated",
        description: "The automation rule has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update auto action",
        variant: "destructive",
      });
    },
  });

  const deleteActionMutation = useMutation({
    mutationFn: async (actionId: string) => {
      return await apiRequest("DELETE", `/api/servers/${selectedServer}/auto-actions/${actionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${selectedServer}/auto-actions`] });
      toast({
        title: "Auto action deleted",
        description: "The automation rule has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete auto action",
        variant: "destructive",
      });
    },
  });

  const triggerLabels: Record<string, string> = {
    report_threshold: "Report Threshold",
    trusted_mod_vote: "Trusted Moderator Vote",
    repeat_offender: "Repeat Offender",
  };

  const actionLabels: Record<string, string> = {
    auto_ban: "Automatic Ban",
    auto_tempban: "Automatic Temp Ban",
    auto_warn: "Automatic Warning",
    notify_admins: "Notify Administrators",
  };

  if (serversLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>;
  }

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Zap className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Servers Found</h2>
        <p className="text-muted-foreground">Connect a Discord server to manage auto actions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auto Actions</h1>
          <p className="text-muted-foreground">Automate moderation tasks based on reports and moderator votes</p>
        </div>
        <div className="flex items-center gap-3">
          {servers.length > 1 && (
            <select
              className="px-4 py-2 rounded-lg border bg-background min-h-9"
              value={selectedServer || ""}
              onChange={(e) => setSelectedServer(e.target.value)}
              data-testid="select-server"
            >
              {servers.map((server) => (
                <option key={server.id} value={server.id}>{server.name}</option>
              ))}
            </select>
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-action">
                <Plus className="h-4 w-4 mr-2" />
                Create Auto Action
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Auto Action</DialogTitle>
                <DialogDescription>
                  Set up an automation rule to handle moderation tasks
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createActionMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Auto-ban after 3 reports" 
                            {...field}
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="trigger"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trigger</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-trigger">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="report_threshold">Report Threshold</SelectItem>
                            <SelectItem value="trusted_mod_vote">Trusted Moderator Vote</SelectItem>
                            <SelectItem value="repeat_offender">Repeat Offender</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-action">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="auto_ban">Automatic Ban</SelectItem>
                            <SelectItem value="auto_tempban">Automatic Temp Ban</SelectItem>
                            <SelectItem value="auto_warn">Automatic Warning</SelectItem>
                            <SelectItem value="notify_admins">Notify Administrators</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="reportCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Count</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="3" 
                              {...field}
                              data-testid="input-report-count"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="trustedModCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trusted Mod Votes</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2" 
                              {...field}
                              data-testid="input-mod-count"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="timeWindow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Window (days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="7" 
                              {...field}
                              data-testid="input-time-window"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ban Duration (days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="7" 
                              {...field}
                              data-testid="input-duration"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Automated action triggered" 
                            {...field}
                            data-testid="input-reason"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createActionMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createActionMutation.isPending ? "Creating..." : "Create Auto Action"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {actionsLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : actions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Zap className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No auto actions yet</p>
              <p className="text-sm text-muted-foreground">Create automation rules to streamline your moderation workflow</p>
            </CardContent>
          </Card>
        ) : (
          actions.map((action) => (
            <Card key={action.id} className="hover-elevate transition-all" data-testid={`action-card-${action.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      action.isActive ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Zap className={`h-6 w-6 ${action.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <span>{triggerLabels[action.trigger]}</span>
                        <span>→</span>
                        <span>{actionLabels[action.action]}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={action.isActive}
                      onCheckedChange={(checked) => {
                        toggleActionMutation.mutate({ actionId: action.id, isActive: checked });
                      }}
                      data-testid={`switch-active-${action.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteActionMutation.mutate(action.id)}
                      disabled={deleteActionMutation.isPending}
                      data-testid={`button-delete-${action.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {action.conditions?.reportCount && (
                    <div>
                      <p className="text-muted-foreground mb-1">Report Threshold</p>
                      <p className="font-medium">{action.conditions.reportCount} reports</p>
                    </div>
                  )}
                  {action.conditions?.trustedModCount && (
                    <div>
                      <p className="text-muted-foreground mb-1">Trusted Mod Votes</p>
                      <p className="font-medium">{action.conditions.trustedModCount} votes</p>
                    </div>
                  )}
                  {action.conditions?.timeWindow && (
                    <div>
                      <p className="text-muted-foreground mb-1">Time Window</p>
                      <p className="font-medium">{action.conditions.timeWindow} days</p>
                    </div>
                  )}
                </div>
                {action.actionParams?.reason && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reason</p>
                    <p className="text-sm">{action.actionParams.reason}</p>
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
