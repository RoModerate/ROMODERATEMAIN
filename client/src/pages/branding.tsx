import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Palette, Upload, Save, Image as ImageIcon } from "lucide-react";
import type { Server } from "@shared/schema";
import { ServerSelector } from "@/components/server-selector";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ServerBranding {
  id?: string;
  serverId: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  customDescription: string | null;
  primaryColor: string;
  secondaryColor: string | null;
  customDomain: string | null;
  publicProfileEnabled: boolean;
  showStatistics: boolean;
  showTeamMembers: boolean;
  socialLinks: {
    website?: string;
    discord?: string;
    discordServer?: string;
    twitter?: string;
    youtube?: string;
    twitch?: string;
    tiktok?: string;
    robloxGroup?: string;
  };
}

export default function Branding() {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const { data: branding, isLoading } = useQuery<ServerBranding>({
    queryKey: ["/api/servers", selectedServer, "branding"],
    enabled: !!selectedServer,
  });

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const [formData, setFormData] = useState<Partial<ServerBranding>>({
    logoUrl: null,
    bannerUrl: null,
    customDescription: null,
    primaryColor: "#6B21A8",
    secondaryColor: null,
    customDomain: null,
    publicProfileEnabled: false,
    showStatistics: true,
    showTeamMembers: false,
    socialLinks: {},
  });

  useEffect(() => {
    if (branding) {
      setFormData(branding);
    }
  }, [branding]);

  const updateBrandingMutation = useMutation({
    mutationFn: async (data: Partial<ServerBranding>) => {
      return await apiRequest("PUT", `/api/servers/${selectedServer}/branding`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers", selectedServer, "branding"] });
      toast({
        title: "Branding Updated",
        description: "Your server branding has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update",
        description: error.message || "Could not update server branding",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandingMutation.mutate(formData);
  };

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Palette className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Servers Found</h2>
        <p className="text-muted-foreground">Connect a Discord server to customize branding</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Server Branding</h1>
          <p className="text-muted-foreground">
            Customize your server's appearance and public profile
          </p>
        </div>
        <ServerSelector
          servers={servers}
          value={selectedServer}
          onChange={setSelectedServer}
          testId="select-server"
        />
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Palette className="h-12 w-12 text-muted-foreground mx-auto animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading branding settings...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Visual Assets
              </CardTitle>
              <CardDescription>Upload custom logos and banners for your server</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl" data-testid="label-logo">Server Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl || ""}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value || null })}
                  data-testid="input-logo-url"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 256x256px PNG with transparency
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerUrl" data-testid="label-banner">Server Banner URL</Label>
                <Input
                  id="bannerUrl"
                  type="url"
                  placeholder="https://example.com/banner.png"
                  value={formData.bannerUrl || ""}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value || null })}
                  data-testid="input-banner-url"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 1920x400px for best display
                </p>
              </div>

              {formData.logoUrl && (
                <div className="mt-4 p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-2">Logo Preview</p>
                  <img 
                    src={formData.logoUrl} 
                    alt="Server logo preview" 
                    className="h-24 w-24 rounded-lg object-cover"
                    data-testid="img-logo-preview"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Scheme
              </CardTitle>
              <CardDescription>Customize your server's theme colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" data-testid="label-primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor || "#6B21A8"}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="h-10 w-20"
                      data-testid="input-primary-color"
                    />
                    <Input
                      type="text"
                      value={formData.primaryColor || "#6B21A8"}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      placeholder="#6B21A8"
                      data-testid="input-primary-color-text"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" data-testid="label-secondary-color">Secondary Color (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor || "#000000"}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="h-10 w-20"
                      data-testid="input-secondary-color"
                    />
                    <Input
                      type="text"
                      value={formData.secondaryColor || ""}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value || null })}
                      placeholder="#000000"
                      data-testid="input-secondary-color-text"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Public Profile Settings</CardTitle>
              <CardDescription>Configure how your server appears to the public</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDescription" data-testid="label-description">Custom Description</Label>
                <Textarea
                  id="customDescription"
                  placeholder="Describe your server and moderation approach..."
                  value={formData.customDescription || ""}
                  onChange={(e) => setFormData({ ...formData, customDescription: e.target.value || null })}
                  rows={4}
                  data-testid="input-custom-description"
                />
                <p className="text-xs text-muted-foreground">
                  This will be shown on your public server profile
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customDomain" data-testid="label-domain">Custom Domain (Optional)</Label>
                <Input
                  id="customDomain"
                  type="text"
                  placeholder="moderation.yourserver.com"
                  value={formData.customDomain || ""}
                  onChange={(e) => setFormData({ ...formData, customDomain: e.target.value || null })}
                  data-testid="input-custom-domain"
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="publicProfile" data-testid="label-public-profile">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow public access to your server's moderation profile
                    </p>
                  </div>
                  <Switch
                    id="publicProfile"
                    checked={formData.publicProfileEnabled || false}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, publicProfileEnabled: checked })
                    }
                    data-testid="switch-public-profile"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showStats" data-testid="label-show-stats">Show Statistics</Label>
                    <p className="text-sm text-muted-foreground">
                      Display moderation statistics on public profile
                    </p>
                  </div>
                  <Switch
                    id="showStats"
                    checked={formData.showStatistics ?? true}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, showStatistics: checked })
                    }
                    data-testid="switch-show-stats"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showTeam" data-testid="label-show-team">Show Team Members</Label>
                    <p className="text-sm text-muted-foreground">
                      Display moderator team on public profile
                    </p>
                  </div>
                  <Switch
                    id="showTeam"
                    checked={formData.showTeamMembers || false}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, showTeamMembers: checked })
                    }
                    data-testid="switch-show-team"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links & External Accounts</CardTitle>
              <CardDescription>Link your external accounts and social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={formData.socialLinks?.website || ""}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value || undefined } })}
                    data-testid="input-website"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discord">Discord Username</Label>
                  <Input
                    id="discord"
                    placeholder="yourusername"
                    value={formData.socialLinks?.discord || ""}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, discord: e.target.value || undefined } })}
                    data-testid="input-discord"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discordServer">Discord Server Invite</Label>
                  <Input
                    id="discordServer"
                    placeholder="https://discord.gg/..."
                    value={formData.socialLinks?.discordServer || ""}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, discordServer: e.target.value || undefined } })}
                    data-testid="input-discord-server"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube Channel</Label>
                  <Input
                    id="youtube"
                    placeholder="@yourchannel or URL"
                    value={formData.socialLinks?.youtube || ""}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, youtube: e.target.value || undefined } })}
                    data-testid="input-youtube"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X Handle</Label>
                  <Input
                    id="twitter"
                    placeholder="@yourhandle"
                    value={formData.socialLinks?.twitter || ""}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value || undefined } })}
                    data-testid="input-twitter"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitch">Twitch Channel</Label>
                  <Input
                    id="twitch"
                    placeholder="yourusername"
                    value={formData.socialLinks?.twitch || ""}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitch: e.target.value || undefined } })}
                    data-testid="input-twitch"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok Handle</Label>
                  <Input
                    id="tiktok"
                    placeholder="@yourhandle"
                    value={formData.socialLinks?.tiktok || ""}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, tiktok: e.target.value || undefined } })}
                    data-testid="input-tiktok"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="robloxGroup">Roblox Group URL</Label>
                  <Input
                    id="robloxGroup"
                    placeholder="https://www.roblox.com/groups/..."
                    value={formData.socialLinks?.robloxGroup || ""}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, robloxGroup: e.target.value || undefined } })}
                    data-testid="input-roblox-group"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => branding && setFormData(branding)}
              data-testid="button-reset"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={updateBrandingMutation.isPending}
              data-testid="button-save-branding"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateBrandingMutation.isPending ? "Saving..." : "Save Branding"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
