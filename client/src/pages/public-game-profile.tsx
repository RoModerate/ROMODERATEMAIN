import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type PublicServerData = {
  id: string;
  name: string;
  icon?: string;
  settings?: {
    gameName?: string;
    vanityUrl?: string;
    shortDescription?: string;
    gameIcon?: string;
    gameBanner?: string;
  };
};

export default function PublicGameProfile() {
  const params = useParams();
  const vanityUrl = params.vanityUrl;

  const { data: server, isLoading, error } = useQuery<PublicServerData>({
    queryKey: [`/api/public/servers/by-vanity/${vanityUrl}`],
    enabled: !!vanityUrl,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Loading game profile...</p>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Game profile not found</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This vanity URL does not exist or the game profile is not publicly available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {server.settings?.gameBanner && (
        <div 
          className="w-full h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${server.settings.gameBanner})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-start gap-6 mb-8">
          {server.settings?.gameIcon && (
            <img 
              src={server.settings.gameIcon} 
              alt={server.settings.gameName || server.name}
              className="h-24 w-24 rounded-lg object-cover border-2 border-border"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              {server.settings?.gameName || server.name}
            </h1>
            {server.settings?.shortDescription && (
              <p className="text-lg text-muted-foreground">
                {server.settings.shortDescription}
              </p>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">About This Server</h2>
            <p className="text-muted-foreground">
              {server.settings?.shortDescription || "No description available"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
