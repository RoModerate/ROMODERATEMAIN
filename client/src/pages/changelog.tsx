import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Bell, CheckCircle2, Calendar, Tag, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Changelog } from "@shared/schema";

const changelogFormSchema = z.object({
  serverId: z.string().min(1, "Please select a server"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  version: z.string().min(1, "Version is required (e.g., Oct 30, 2025)"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  category: z.string().default("general"),
  emoji: z.string().optional(),
});

type ChangelogFormData = z.infer<typeof changelogFormSchema>;
type Server = { id: string; name: string; icon?: string };

const emojiOptions = [
  { value: "<:Check:1396399812697391114>", label: "Check" },
  { value: "<:Settings:1396005045962539069>", label: "Settings" },
  { value: "<:web:1403650430436900926>", label: "Web" },
  { value: "<:star:1403650777733664780>", label: "Star" },
  { value: "<:Refresh:1396004984944070686>", label: "Refresh" },
  { value: "<:Maintenance:1405434464368197753>", label: "Maintenance" },
];

export default function Changelog() {
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string>("");

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const { data: changelogs = [], isLoading } = useQuery<Changelog[]>({
    queryKey: ["/api/changelogs", selectedServerId],
    enabled: !!selectedServerId,
  });

  const form = useForm<ChangelogFormData>({
    resolver: zodResolver(changelogFormSchema),
    defaultValues: {
      serverId: "",
      title: "",
      version: "",
      content: "",
      category: "general",
      emoji: emojiOptions[0].value,
    },
  });

  // Auto-select first server when servers load
  if (servers.length > 0 && !selectedServerId) {
    const firstServerId = servers[0].id;
    setSelectedServerId(firstServerId);
    form.setValue("serverId", firstServerId);
  }

  const publishMutation = useMutation({
    mutationFn: async (data: ChangelogFormData) => {
      return apiRequest("POST", "/api/changelogs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/changelogs", selectedServerId] });
      toast({
        title: "Changelog Published",
        description: "Your changelog has been posted to Discord successfully!",
      });
      form.reset();
      form.setValue("serverId", selectedServerId);
      setIsPublishing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to publish changelog",
        variant: "destructive",
      });
      setIsPublishing(false);
    },
  });

  const onSubmit = (data: ChangelogFormData) => {
    setIsPublishing(true);
    publishMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Changelog Manager
        </h1>
        <p className="text-muted-foreground mt-2">
          Post updates to your Discord server automatically with beautiful purple embeds
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Post New Changelog
            </CardTitle>
            <CardDescription>
              Create and publish a changelog entry to Discord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bot panel redesigned for easier use"
                          {...field}
                          data-testid="input-changelog-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version / Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Oct 30, 2025"
                          {...field}
                          data-testid="input-changelog-version"
                        />
                      </FormControl>
                      <FormDescription>
                        Displayed as "Changelog – {field.value || "Oct 30, 2025"}"
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emoji"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emoji</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-changelog-emoji">
                            <SelectValue placeholder="Select an emoji" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emojiOptions.map((emoji) => (
                            <SelectItem key={emoji.value} value={emoji.value}>
                              {emoji.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Used sparingly in the Discord embed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Changes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="- Bot panel redesigned for easier use.&#10;- Ticket support system added.&#10;- Small fixes and stability upgrades."
                          className="min-h-32"
                          {...field}
                          data-testid="input-changelog-content"
                        />
                      </FormControl>
                      <FormDescription>
                        Use bullet points with "-" for each change
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-changelog-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="feature">New Feature</SelectItem>
                          <SelectItem value="bugfix">Bug Fix</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isPublishing}
                  data-testid="button-publish-changelog"
                >
                  {isPublishing ? (
                    <>Publishing...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Publish to Discord
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Discord Embed Preview
              </CardTitle>
              <CardDescription>
                How your changelog will appear in Discord
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Discord-style message container */}
              <div className="bg-[#2b2d31] rounded-md p-4 space-y-3 font-['gg_sans',_'Noto_Sans',_sans-serif]">
                {/* Bot avatar and name */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">RoModerate</span>
                    <Badge className="bg-[#5865f2] text-white text-xs h-4 px-1.5">BOT</Badge>
                    <span className="text-[#b5bac1] text-xs">
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Discord embed */}
                <div className="border-l-4 border-[#5865f2] bg-[#2b2d31] rounded-r-md overflow-hidden">
                  <div className="bg-[#202225] p-4 space-y-3">
                    {/* Embed title */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{form.watch("emoji") || emojiOptions[0].value}</span>
                      <h3 className="font-semibold text-white text-base">
                        {form.watch("title") || "Bot panel redesigned for easier use"}
                      </h3>
                    </div>
                    
                    {/* Embed description */}
                    <div className="text-sm text-[#dbdee1] whitespace-pre-wrap leading-relaxed">
                      {form.watch("content") || "- Bot panel redesigned for easier use.\n- Ticket support system added.\n- Small fixes and stability upgrades."}
                    </div>

                    {/* Embed footer */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#3e4147]">
                      <span className="text-xs text-[#b5bac1]">
                        Changelog – {form.watch("version") || "Oct 30, 2025"}
                      </span>
                      <span className="text-xs text-[#b5bac1]">•</span>
                      <Badge variant="secondary" className="bg-[#2b2d31] text-[#b5bac1] text-xs h-5">
                        {form.watch("category") || "general"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Reactions preview (optional) */}
                <div className="flex items-center gap-2 pl-14">
                  <div className="flex items-center gap-1 bg-[#202225] hover:bg-[#36373d] rounded-md px-2 py-1 cursor-pointer border border-transparent hover:border-[#4e5058]">
                    <span className="text-sm">✅</span>
                    <span className="text-xs text-[#b5bac1]">3</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#202225] hover:bg-[#36373d] rounded-md px-2 py-1 cursor-pointer border border-transparent hover:border-[#4e5058]">
                    <span className="text-sm">👀</span>
                    <span className="text-xs text-[#b5bac1]">1</span>
                  </div>
                </div>
              </div>

              {/* Helper text */}
              <p className="text-xs text-muted-foreground mt-4 text-center">
                This preview shows how your changelog will appear in Discord with purple accents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Changelogs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : changelogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No changelogs yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {changelogs.slice(0, 10).map((changelog) => (
                    <div
                      key={changelog.id}
                      className="border rounded-md p-3 space-y-2"
                      data-testid={`changelog-${changelog.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{changelog.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {changelog.version}
                          </p>
                        </div>
                        {changelog.postedToDiscord && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            Posted
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {changelog.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        {changelog.category}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
