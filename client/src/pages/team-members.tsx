import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Shield, Trash2, Link2, Copy, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server, ServerMember, InviteCode } from "@shared/schema";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { ServerSelector } from "@/components/server-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const createInviteSchema = z.object({
  role: z.enum(["co-owner", "admin", "moderator", "viewer"]),
  maxUses: z.string().optional(),
  expiresIn: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

type CreateInviteFormData = z.infer<typeof createInviteSchema>;

export default function TeamMembers() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const { data: servers = [], isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const { data: members = [], isLoading: membersLoading } = useQuery<Array<ServerMember & { user: any }>>({
    queryKey: ["/api/servers", selectedServer, "members"],
    enabled: !!selectedServer,
  });

  const { data: invites = [], isLoading: invitesLoading } = useQuery<InviteCode[]>({
    queryKey: ["/api/servers", selectedServer, "invites"],
    enabled: !!selectedServer,
  });

  const { data: activeShifts = [] } = useQuery<any[]>({
    queryKey: ["/api/shifts", selectedServer],
    enabled: !!selectedServer,
    select: (data: any[]) => data.filter((shift: any) => shift.status === 'active'),
  });

  const form = useForm<CreateInviteFormData>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: {
      role: "moderator",
      maxUses: "",
      expiresIn: "168",
      permissions: [],
    },
  });

  const createInviteMutation = useMutation({
    mutationFn: async (data: CreateInviteFormData) => {
      return await apiRequest("POST", `/api/servers/${selectedServer}/invites`, {
        role: data.role,
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
        expiresIn: data.expiresIn ? data.expiresIn : null,
        permissions: selectedPermissions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", selectedServer, "invites"] });
      toast({
        title: "Invitation created",
        description: "Invitation link has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
      setSelectedPermissions([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invitation",
        variant: "destructive",
      });
    },
  });

  const deleteInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      return await apiRequest("DELETE", `/api/servers/${selectedServer}/invites/${inviteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", selectedServer, "invites"] });
      toast({
        title: "Invitation deleted",
        description: "Invitation link has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invitation",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await apiRequest("DELETE", `/api/servers/${selectedServer}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", selectedServer, "members"] });
      toast({
        title: "Member removed",
        description: "Team member has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    },
  });

  const availablePermissions = [
    { id: "view_bans", label: "View Bans" },
    { id: "manage_bans", label: "Manage Bans" },
    { id: "view_appeals", label: "View Appeals" },
    { id: "manage_appeals", label: "Manage Appeals" },
    { id: "view_tickets", label: "View Support Tickets" },
    { id: "manage_tickets", label: "Manage Support Tickets" },
    { id: "view_reports", label: "View Reports" },
    { id: "manage_reports", label: "Manage Reports" },
    { id: "use_moderation_tools", label: "Use Moderation Tools" },
    { id: "manage_auto_actions", label: "Manage Auto Actions" },
  ];

  const handleCreateInvite = (data: CreateInviteFormData) => {
    createInviteMutation.mutate(data);
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", label: string }> = {
      owner: { variant: "destructive", label: "Owner" },
      "co-owner": { variant: "default", label: "Co-Owner" },
      admin: { variant: "default", label: "Administrator" },
      moderator: { variant: "secondary", label: "Moderator" },
      viewer: { variant: "outline", label: "Viewer" },
    };
    const roleConfig = config[role] || { variant: "secondary", label: role };
    return <Badge variant={roleConfig.variant}>{roleConfig.label}</Badge>;
  };

  const copyInviteLink = (code: string) => {
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/invite/${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied",
      description: "Invitation link copied to clipboard",
    });
  };

  const formatExpiryDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  if (serversLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>;
  }

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Users className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Servers Found</h2>
        <p className="text-muted-foreground">Connect a Discord server to manage team members</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">Manage moderators and administrators for your server</p>
        </div>
        <div className="flex items-center gap-3">
          <ServerSelector
            servers={servers}
            value={selectedServer}
            onChange={setSelectedServer}
            testId="select-server"
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-invite">
                <Link2 className="h-4 w-4 mr-2" />
                Create Invitation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Invitation Link</DialogTitle>
                <DialogDescription>
                  Generate an invitation link to add team members
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateInvite)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-role">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="co-owner">Co-Owner</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiresIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expires In (hours)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="168 (7 days)" 
                            {...field}
                            data-testid="input-expires-in"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxUses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Uses (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Leave empty for unlimited" 
                            {...field}
                            data-testid="input-max-uses"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <FormLabel>Permissions</FormLabel>
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto p-3 border rounded-md">
                      {availablePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              setSelectedPermissions(
                                checked
                                  ? [...selectedPermissions, permission.id]
                                  : selectedPermissions.filter((p) => p !== permission.id)
                              );
                            }}
                            data-testid={`checkbox-permission-${permission.id}`}
                          />
                          <label
                            htmlFor={permission.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
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
                      disabled={createInviteMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createInviteMutation.isPending ? "Creating..." : "Create Invitation"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members" data-testid="tab-members">Team Members</TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-invitations">
            Pending Invitations {invites.length > 0 && `(${invites.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4 mt-6">
          {membersLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : members.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <p className="text-xl font-semibold mb-2">No team members yet</p>
                <p className="text-sm text-muted-foreground mb-4">Create an invitation to add moderators and administrators</p>
                <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-invite-cta">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Invitation
                </Button>
              </CardContent>
            </Card>
          ) : (
            members.map((member) => {
              const isOnShift = activeShifts.some((shift: any) => shift.userId === member.userId);
              return (
              <Card key={member.id} className="hover-elevate transition-all group" data-testid={`member-card-${member.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-14 w-14 border-2 border-primary/20">
                          <AvatarImage src={member.user?.avatar && member.user?.discordId ? `https://cdn.discordapp.com/avatars/${member.user.discordId}/${member.user.avatar}.png` : undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-lg font-semibold">
                            {member.user?.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background bg-green-500" 
                             title="Online" 
                             data-testid={`status-online-${member.id}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {member.user?.username || "Unknown User"}
                            {member.user?.discriminator && member.user.discriminator !== "0" && `#${member.user.discriminator}`}
                          </CardTitle>
                          {isOnShift && (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-600" data-testid={`badge-on-shift-${member.id}`}>
                              On Shift
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          User ID: {member.userId}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(member.role)}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        disabled={removeMemberMutation.isPending}
                        data-testid={`button-remove-${member.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {member.permissions && member.permissions.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {member.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {availablePermissions.find((p) => p.id === perm)?.label || perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
            })
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4 mt-6">
          {invitesLoading ? (
            [...Array(2)].map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : invites.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Link2 className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No pending invitations</p>
                <p className="text-sm text-muted-foreground">Create an invitation link to invite new team members</p>
              </CardContent>
            </Card>
          ) : (
            invites.map((invite) => (
              <Card key={invite.id} className="hover-elevate transition-all" data-testid={`invite-card-${invite.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getRoleBadge(invite.role)}
                        <Badge variant="outline">
                          {invite.currentUses || 0} / {invite.maxUses || "∞"} uses
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <code className="text-sm flex-1 truncate" data-testid={`invite-code-${invite.id}`}>
                          {window.location.origin}/invite/{invite.code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyInviteLink(invite.code)}
                          data-testid={`button-copy-${invite.id}`}
                        >
                          {copiedCode === invite.code ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <CardDescription className="mt-2">
                        Expires: {formatExpiryDate(invite.expiresAt)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteInviteMutation.mutate(invite.id)}
                      disabled={deleteInviteMutation.isPending}
                      data-testid={`button-delete-invite-${invite.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                {invite.permissions && invite.permissions.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {invite.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {availablePermissions.find((p) => p.id === perm)?.label || perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
