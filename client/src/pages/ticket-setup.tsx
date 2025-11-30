import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Ticket, Plus, Trash2, Settings, MessageSquare, Send, Eye, Palette, Hash, Shield, Timer, Cog, Zap, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server } from "@shared/schema";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ServerSelector } from "@/components/server-selector";
import { Switch } from "@/components/ui/switch";
import { ChannelSelector } from "@/components/channel-selector";
import { Label } from "@/components/ui/label";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  emoji: z.string().optional(),
  channelCategoryId: z.string().optional(),
  autoResponse: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const panelSchema = z.object({
  title: z.string().min(1, "Panel title is required"),
  description: z.string().min(1, "Panel description is required"),
  color: z.string().optional(),
  channelId: z.string().min(1, "Channel is required"),
  buttons: z.array(z.object({
    label: z.string(),
    categoryId: z.string(),
    emoji: z.string().optional(),
    style: z.enum(['primary', 'secondary', 'success', 'danger']),
  })).min(1, "At least one button is required"),
});

type PanelFormData = z.infer<typeof panelSchema>;

export default function TicketSetup() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPanelDialogOpen, setIsPanelDialogOpen] = useState(false);
  const [ticketsEnabled, setTicketsEnabled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [panelButtons, setPanelButtons] = useState<Array<{ label: string; categoryId: string; emoji: string; style: 'primary' | 'secondary' | 'success' | 'danger' }>>([]);
  const [commandPrefix, setCommandPrefix] = useState("$");
  const [globalTicketLimit, setGlobalTicketLimit] = useState<number | null>(null);
  const [dashboardRoles, setDashboardRoles] = useState<string[]>(["@everyone"]);
  const [blacklistRoles, setBlacklistRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("categories");

  const { data: servers = [], isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const currentServer = servers.find(s => s.id === selectedServer);
  const serverSettings = currentServer?.settings as any;
  const ticketConfig = serverSettings?.ticketConfig || { enabled: false, categories: [] };
  const ticketCategories = (ticketConfig.categories || []) as Array<{
    id: string;
    name: string;
    description?: string;
    emoji?: string;
    autoResponse?: string;
  }>;

  useEffect(() => {
    if (currentServer && serverSettings) {
      setTicketsEnabled(!!ticketConfig.enabled);
      if (ticketConfig.commandPrefix) setCommandPrefix(ticketConfig.commandPrefix);
      if (ticketConfig.globalTicketLimit) setGlobalTicketLimit(ticketConfig.globalTicketLimit);
      if (ticketConfig.dashboardRoles) setDashboardRoles(ticketConfig.dashboardRoles);
      if (ticketConfig.blacklistRoles) setBlacklistRoles(ticketConfig.blacklistRoles);
    }
  }, [currentServer, serverSettings, ticketConfig]);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      emoji: "",
      channelCategoryId: "",
      autoResponse: "",
    },
  });

  const panelForm = useForm<PanelFormData>({
    resolver: zodResolver(panelSchema),
    defaultValues: {
      title: "",
      description: "",
      color: "#5865F2",
      channelId: "",
      buttons: [],
    },
  });

  const deployPanelMutation = useMutation({
    mutationFn: async (panelId: string) => {
      return await apiRequest("POST", `/api/servers/${selectedServer}/ticket-panels/deploy`, { panelId });
    },
    onSuccess: () => {
      toast({
        title: "Panel Deployed Successfully",
        description: "The ticket panel is now live in your Discord channel. Users can start creating tickets!",
        duration: 6000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to deploy panel",
        description: error.message || "Make sure your bot has permissions to send messages in the selected channel. Try reconnecting your bot if the problem persists.",
        variant: "destructive",
        duration: 8000,
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { settings: any }) => {
      if (!selectedServer) {
        throw new Error("No server selected");
      }
      return await apiRequest("PATCH", `/api/servers/${selectedServer}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      await queryClient.refetchQueries({ queryKey: ["/api/servers"] });
      await queryClient.invalidateQueries({ queryKey: [`/api/servers/${selectedServer}`] });
      await queryClient.refetchQueries({ queryKey: [`/api/servers/${selectedServer}`] });
      toast({
        title: "Settings Saved",
        description: "Ticket settings have been updated successfully.",
        duration: 4000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleAddCategory = (data: CategoryFormData) => {
    const newCategory = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description || "",
      emoji: data.emoji || "",
      channelCategoryId: data.channelCategoryId || "",
      autoResponse: data.autoResponse || "",
    };

    const updatedCategories = [...ticketCategories, newCategory];

    updateSettingsMutation.mutate(
      {
        settings: {
          ...currentServer?.settings,
          ticketConfig: {
            ...ticketConfig,
            enabled: ticketConfig.enabled,
            categories: updatedCategories,
            panels: ticketConfig.panels || [],
            commandPrefix,
            globalTicketLimit,
            dashboardRoles,
            blacklistRoles,
          },
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Category Added",
            description: `"${data.name}" has been added. You can now use it in ticket panels.`,
            duration: 4000,
          });
          setIsDialogOpen(false);
          form.reset();
          setSelectedCategory("");
        },
        onError: (error: any) => {
          toast({
            title: "Failed to add category",
            description: error.message || "An error occurred",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRemoveCategory = (categoryId: string) => {
    const updatedCategories = ticketCategories.filter(c => c.id !== categoryId);

    updateSettingsMutation.mutate({
      settings: {
        ...currentServer?.settings,
        ticketConfig: {
          ...ticketConfig,
          enabled: ticketConfig.enabled,
          categories: updatedCategories,
          panels: ticketConfig.panels || [],
          commandPrefix,
          globalTicketLimit,
          dashboardRoles,
          blacklistRoles,
        },
      },
    });
  };

  const handleToggleTickets = (enabled: boolean) => {
    // Update local state immediately for instant UI feedback
    setTicketsEnabled(enabled);

    // Update the server settings
    updateSettingsMutation.mutate({
      settings: {
        ...currentServer?.settings,
        ticketConfig: {
          ...ticketConfig,
          enabled: enabled,
          categories: ticketCategories,
          panels: ticketConfig.panels || [],
          commandPrefix,
          globalTicketLimit,
          dashboardRoles,
          blacklistRoles,
        },
      },
    });
  };

  const handleAddButtonToPanel = () => {
    if (!selectedCategory) {
      toast({
        title: "Select a category",
        description: "Please select a category for this button",
        variant: "destructive",
      });
      return;
    }

    const category = ticketCategories.find(c => c.id === selectedCategory);
    if (!category) return;

    const newButton = {
      label: category.name,
      categoryId: category.id,
      emoji: category.emoji || "",
      style: 'primary' as const,
    };

    setPanelButtons([...panelButtons, newButton]);
    setSelectedCategory("");
  };

  const handleRemoveButton = (index: number) => {
    setPanelButtons(panelButtons.filter((_, i) => i !== index));
  };

  const handleCreatePanel = (data: PanelFormData) => {
    if (panelButtons.length === 0) {
      toast({
        title: "No buttons added",
        description: "Please add at least one button to the panel",
        variant: "destructive",
      });
      return;
    }

    const newPanel = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      color: data.color || "#5865F2",
      channelId: data.channelId,
      buttons: panelButtons,
    };

    const updatedPanels = [...(ticketConfig.panels || []), newPanel];

    updateSettingsMutation.mutate(
      {
        settings: {
          ...currentServer?.settings,
          ticketConfig: {
            ...ticketConfig,
            enabled: ticketConfig.enabled,
            categories: ticketCategories,
            panels: updatedPanels,
            commandPrefix,
            globalTicketLimit,
            dashboardRoles,
            blacklistRoles,
          },
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Panel Created Successfully",
            description: `"${data.title}" is ready. Click "Deploy Panel" below to send it to your Discord channel and make it active.`,
            duration: 6000,
          });
          setIsPanelDialogOpen(false);
          panelForm.reset();
          setPanelButtons([]);
          setTimeout(() => setActiveTab("panels"), 100);
        },
        onError: (error: any) => {
          toast({
            title: "Failed to create panel",
            description: error.message || "An error occurred while creating the panel",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeletePanel = (panelId: string) => {
    const updatedPanels = (ticketConfig.panels || []).filter((p: any) => p.id !== panelId);

    updateSettingsMutation.mutate({
      settings: {
        ...currentServer?.settings,
        ticketConfig: {
          ...ticketConfig,
          enabled: ticketConfig.enabled,
          categories: ticketCategories,
          panels: updatedPanels,
          commandPrefix,
          globalTicketLimit,
          dashboardRoles,
          blacklistRoles,
        },
      },
    });
  };

  const handleUpdateGeneralSettings = () => {
    updateSettingsMutation.mutate({
      settings: {
        ...currentServer?.settings,
        ticketConfig: {
          ...ticketConfig,
          commandPrefix,
          globalTicketLimit,
          dashboardRoles,
          blacklistRoles,
        },
      },
    });
  };

  if (serversLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>;
  }

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Servers Found</h2>
        <p className="text-muted-foreground">Connect a Discord server to configure tickets</p>
      </div>
    );
  }

  const ticketPanels = ticketConfig.panels || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket System Setup</h1>
          <p className="text-muted-foreground">Configure support ticket categories, panels, and automation</p>
        </div>
        <ServerSelector
          servers={servers}
          value={selectedServer}
          onChange={setSelectedServer}
          testId="select-server"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" data-testid="tab-general">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">
              <Ticket className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="panels" data-testid="tab-panels">
              <MessageSquare className="h-4 w-4 mr-2" />
              Panels
            </TabsTrigger>
            <TabsTrigger value="automation" data-testid="tab-automation">
              <Cog className="h-4 w-4 mr-2" />
              Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure command prefix, limits, and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Command Prefix</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The symbol users type before commands. Example: if you set "$", users type $ticket to create a ticket.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    value={commandPrefix}
                    onChange={(e) => setCommandPrefix(e.target.value)}
                    placeholder="$"
                    className="max-w-[200px]"
                  />
                  <p className="text-sm text-muted-foreground">Prefix for ticket commands (e.g., $ticket)</p>
                </div>

                <div className="space-y-2">
                  <Label>Global Ticket Limit</Label>
                  <Input
                    type="number"
                    value={globalTicketLimit || ""}
                    onChange={(e) => setGlobalTicketLimit(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="No limit"
                    className="max-w-[200px]"
                  />
                  <p className="text-sm text-muted-foreground">Maximum number of open tickets across all panels</p>
                </div>

                <div className="space-y-2">
                  <Label>Dashboard Roles</Label>
                  <Input
                    value={dashboardRoles.join(", ")}
                    onChange={(e) => setDashboardRoles(e.target.value.split(",").map(r => r.trim()))}
                    placeholder="@everyone, Moderator, Admin"
                  />
                  <p className="text-sm text-muted-foreground">Roles that can access the ticket dashboard</p>
                </div>

                <div className="space-y-2">
                  <Label>Blacklist Roles</Label>
                  <Input
                    value={blacklistRoles.join(", ")}
                    onChange={(e) => setBlacklistRoles(e.target.value.split(",").map(r => r.trim()))}
                    placeholder="Muted, Banned"
                  />
                  <p className="text-sm text-muted-foreground">Roles that cannot use ticket commands or reactions</p>
                </div>

                <Button onClick={handleUpdateGeneralSettings} disabled={updateSettingsMutation.isPending}>
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Ticket Categories</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-category">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Ticket Category</DialogTitle>
                    <DialogDescription>
                      Create a new category for support tickets
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddCategory)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., General Support, Bug Reports" 
                                {...field}
                                data-testid="input-category-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Brief description of this category" 
                                {...field}
                                data-testid="input-category-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emoji"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon Text (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="T" 
                                maxLength={2}
                                {...field}
                                data-testid="input-category-emoji"
                              />
                            </FormControl>
                            <FormDescription>
                              A short text icon to represent this category (e.g., "T" for ticket, "B" for bug)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedServer && (
                        <FormField
                          control={form.control}
                          name="channelCategoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discord Channel Category (Optional)</FormLabel>
                              <FormControl>
                                <ChannelSelector
                                  serverId={selectedServer}
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  type="category"
                                  placeholder="Select Discord category"
                                  testId="select-channel-category"
                                />
                              </FormControl>
                              <FormDescription>
                                Tickets will be created in this category
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="autoResponse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Auto Response (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Thank you for creating a ticket. A team member will assist you shortly."
                                {...field}
                                data-testid="input-auto-response"
                              />
                            </FormControl>
                            <FormDescription>
                              Automatic message sent when a ticket is created
                            </FormDescription>
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
                          disabled={updateSettingsMutation.isPending}
                          data-testid="button-submit"
                        >
                          {updateSettingsMutation.isPending ? "Adding..." : "Add Category"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {ticketCategories.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="p-4 rounded-full bg-primary/10 mb-4">
                      <Ticket className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-xl font-semibold mb-2">No ticket categories yet</p>
                    <p className="text-sm text-muted-foreground mb-4">Create categories to organize different types of support tickets</p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      data-testid="button-add-category-cta"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Category
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                ticketCategories.map((category) => (
                  <Card key={category.id} className="hover-elevate transition-all group" data-testid={`category-card-${category.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl flex-shrink-0 border border-primary/20">
                            {category.emoji || "🎫"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            {category.description && (
                              <CardDescription className="mt-1 line-clamp-2">{category.description}</CardDescription>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {category.autoResponse && (
                                <Badge variant="secondary" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Auto-response
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCategory(category.id)}
                          disabled={updateSettingsMutation.isPending}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-remove-${category.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="panels" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Ticket Panels</h2>
                <p className="text-sm text-muted-foreground mt-1">Deploy interactive panels to Discord channels</p>
              </div>
              <Dialog open={isPanelDialogOpen} onOpenChange={setIsPanelDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-panel" disabled={ticketCategories.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Panel
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Ticket Panel</DialogTitle>
                    <DialogDescription>
                      Deploy a ticket panel to a Discord channel with customizable buttons
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...panelForm}>
                    <form onSubmit={panelForm.handleSubmit(handleCreatePanel)} className="space-y-4">
                      <FormField
                        control={panelForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Panel Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Support Tickets" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={panelForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Panel Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Click a button below to create a ticket" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={panelForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Embed Color</FormLabel>
                            <FormControl>
                              <Input type="color" {...field} className="w-24 h-10" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedServer && (
                        <FormField
                          control={panelForm.control}
                          name="channelId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deploy to Channel</FormLabel>
                              <FormControl>
                                <ChannelSelector
                                  serverId={selectedServer}
                                  value={field.value}
                                  onChange={field.onChange}
                                  type="text"
                                  placeholder="Select channel for panel"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="space-y-2">
                        <Label>Panel Buttons</Label>
                        <div className="flex gap-2">
                          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {ticketCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.emoji} {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button type="button" onClick={handleAddButtonToPanel}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-2 mt-2">
                          {panelButtons.map((button, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span>{button.emoji} {button.label}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveButton(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsPanelDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updateSettingsMutation.isPending || panelButtons.length === 0}>
                          {updateSettingsMutation.isPending ? "Creating..." : "Create Panel"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {ticketCategories.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 rounded-full bg-orange-500/10 mb-4">
                    <MessageSquare className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-xl font-semibold mb-2">Create categories first</p>
                  <p className="text-sm text-muted-foreground mb-4">You need at least one ticket category before creating panels</p>
                  <Button variant="outline" onClick={() => setActiveTab("categories")} data-testid="button-go-to-categories">
                    Go to Categories
                  </Button>
                </CardContent>
              </Card>
            ) : ticketPanels.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 rounded-full bg-blue-500/10 mb-4">
                    <MessageSquare className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xl font-semibold mb-2">No ticket panels yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Create panels to deploy interactive ticket systems to Discord channels</p>
                  <Button onClick={() => setIsPanelDialogOpen(true)} data-testid="button-create-panel-cta">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Panel
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {ticketPanels.map((panel: any) => (
                  <Card key={panel.id} className="hover-elevate transition-all" data-testid={`panel-card-${panel.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg">{panel.title}</CardTitle>
                            {panel.description && (
                              <CardDescription className="mt-1 line-clamp-1">{panel.description}</CardDescription>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary">
                                <Ticket className="h-3 w-3 mr-1" />
                                {panel.buttons?.length || 0} buttons
                              </Badge>
                              {panel.channelId && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                                  Ready to Deploy
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-preview-${panel.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => deployPanelMutation.mutate(panel.id)}
                            disabled={deployPanelMutation.isPending}
                            data-testid={`button-deploy-${panel.id}`}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {deployPanelMutation.isPending ? "Deploying..." : "Deploy"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePanel(panel.id)}
                            data-testid={`button-delete-panel-${panel.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Automation Commands</CardTitle>
                <CardDescription>Configure automated actions for tickets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Re-Open</p>
                      <p className="text-sm text-muted-foreground">For opening closed tickets</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Close</p>
                      <p className="text-sm text-muted-foreground">For closing open tickets</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Close Request</p>
                      <p className="text-sm text-muted-foreground">Send close request message on command</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Delete</p>
                      <p className="text-sm text-muted-foreground">Bypass closing and delete tickets</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Rename</p>
                      <p className="text-sm text-muted-foreground">For renaming tickets</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Transcript</p>
                      <p className="text-sm text-muted-foreground">Create transcript of last 1000 messages</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Add/Remove Users</p>
                      <p className="text-sm text-muted-foreground">Add or remove users from tickets</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Claim Ticket</p>
                      <p className="text-sm text-muted-foreground">Allow support team to claim tickets</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}