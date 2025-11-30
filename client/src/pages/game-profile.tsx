import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Palette, Upload, X, Image as ImageIcon, Save, Crown, HelpCircle } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import imageCompression from "browser-image-compression";

export default function GameProfile() {
  const { toast } = useToast();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [gameName, setGameName] = useState("");
  const [vanityUrl, setVanityUrl] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [gameIcon, setGameIcon] = useState<string | null>(null);
  const [gameBanner, setGameBanner] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const currentServer = selectedServer 
    ? servers.find(s => s.id === selectedServer) 
    : servers[0];

  useEffect(() => {
    if (currentServer?.settings) {
      const settings = currentServer.settings as any;
      setGameName(settings.gameName || "");
      setVanityUrl(settings.vanityUrl || "");
      setShortDescription(settings.shortDescription || "");
      setGameIcon(settings.gameIcon || null);
      setGameBanner(settings.gameBanner || null);
    }
  }, [currentServer]);

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let processedFile = file;
      const shouldCompress = file.size > 2 * 1024 * 1024; // Compress if > 2MB
      
      if (shouldCompress) {
        toast({
          title: "Optimizing image...",
          description: "Compressing image for optimal performance",
        });

        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          fileType: file.type as any,
        };

        processedFile = await imageCompression(file, options);
        
        toast({
          title: "Image optimized",
          description: `Reduced from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`,
        });
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setGameIcon(reader.result as string);
        setIconFile(processedFile);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error("Image compression failed:", error);
      toast({
        title: "Compression failed",
        description: "Using original image (may be larger)",
        variant: "destructive",
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setGameIcon(reader.result as string);
        setIconFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let processedFile = file;
      const shouldCompress = file.size > 3 * 1024 * 1024; // Compress if > 3MB
      
      if (shouldCompress) {
        toast({
          title: "Optimizing banner...",
          description: "Compressing image for optimal performance",
        });

        const options = {
          maxSizeMB: 3,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: file.type as any,
        };

        processedFile = await imageCompression(file, options);
        
        toast({
          title: "Banner optimized",
          description: `Reduced from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`,
        });
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setGameBanner(reader.result as string);
        setBannerFile(processedFile);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error("Banner compression failed:", error);
      toast({
        title: "Compression failed",
        description: "Using original banner (may be larger)",
        variant: "destructive",
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setGameBanner(reader.result as string);
        setBannerFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!gameName.trim()) {
        throw new Error("Game name is required");
      }
      if (!shortDescription.trim()) {
        throw new Error("Short description is required");
      }

      return await apiRequest("PATCH", `/api/servers/${currentServer?.id}/settings`, {
        gameName: gameName.trim(),
        vanityUrl: vanityUrl.trim(),
        shortDescription: shortDescription.trim(),
        gameIcon,
        gameBanner,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
      toast({
        title: "Profile Saved",
        description: "Your game profile has been updated successfully.",
        duration: 4000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    },
  });

  if (!currentServer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Palette className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Server Selected</h2>
        <p className="text-muted-foreground">
          Please select a server to configure game profile settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Palette className="h-8 w-8" />
          Game Profile & Branding
        </h1>
        <p className="text-muted-foreground">
          Customize your game's appearance and branding
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
          <CardTitle>Game Information</CardTitle>
          <CardDescription>Basic information about your game</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="game-name">
              Game Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="game-name"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter your game name"
              data-testid="input-game-name"
            />
            <p className="text-xs text-muted-foreground">
              The display name for your game on the dashboard
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="vanity-url">
                Vanity URL <Badge variant="secondary" className="ml-2">Free</Badge>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Create a short, memorable URL for your server. Example: yoursite.com/v/my-game</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">{window.location.origin}/v/</span>
              <Input
                id="vanity-url"
                value={vanityUrl}
                onChange={(e) => setVanityUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="my-game"
                data-testid="input-vanity-url"
                className="flex-1"
              />
            </div>
            {vanityUrl && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
                <p className="text-sm font-medium mb-1">Your Public URL:</p>
                <code className="text-sm text-primary">{window.location.origin}/v/{vanityUrl}</code>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Create a custom short URL for your server's public profile. This will redirect to your full dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short-description">
              Short Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="short-description"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A brief description of your game"
              maxLength={200}
              rows={3}
              data-testid="input-short-description"
            />
            <p className="text-xs text-muted-foreground">
              {shortDescription.length}/200 characters
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize your game's visual identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Game Icon</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Upload PNG, JPG, or GIF. Large files will be automatically compressed.
            </p>
            {gameIcon ? (
              <div className="relative inline-block">
                <img
                  src={gameIcon}
                  alt="Game icon"
                  className="h-32 w-32 rounded-lg object-cover border-2 border-border"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => {
                    setGameIcon(null);
                    setIconFile(null);
                    if (iconInputRef.current) iconInputRef.current.value = "";
                  }}
                  data-testid="button-remove-icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate cursor-pointer transition-all"
                onClick={() => iconInputRef.current?.click()}
                data-testid="button-upload-icon"
              >
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload game icon</p>
              </div>
            )}
            <input
              ref={iconInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={handleIconChange}
              className="hidden"
            />
          </div>

          <div className="space-y-2">
            <Label>Game Banner</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Upload PNG, JPG, or GIF (recommended 1920x400px). Large files will be automatically compressed.
            </p>
            {gameBanner ? (
              <div className="relative inline-block w-full">
                <img
                  src={gameBanner}
                  alt="Game banner"
                  className="w-full max-w-2xl h-48 rounded-lg object-cover border-2 border-border"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => {
                    setGameBanner(null);
                    setBannerFile(null);
                    if (bannerInputRef.current) bannerInputRef.current.value = "";
                  }}
                  data-testid="button-remove-banner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover-elevate cursor-pointer transition-all w-full max-w-2xl"
                onClick={() => bannerInputRef.current?.click()}
                data-testid="button-upload-banner"
              >
                <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload game banner</p>
              </div>
            )}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={handleBannerChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !gameName.trim() || !shortDescription.trim()}
          data-testid="button-save-profile"
        >
          {saveMutation.isPending ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
