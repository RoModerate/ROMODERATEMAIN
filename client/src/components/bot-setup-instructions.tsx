import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, ExternalLink } from "lucide-react";

export function BotSetupInstructions() {
  return (
    <Card data-testid="card-bot-instructions">
      <CardHeader>
        <CardTitle className="text-lg">How to Set Up Your Discord Bot</CardTitle>
        <CardDescription>
          Follow these steps to create and configure your bot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-primary">1</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Create a Discord Application</p>
              <p className="text-sm text-muted-foreground">
                Go to the{" "}
                <a 
                  href="https://discord.com/developers/applications" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Discord Developer Portal
                  <ExternalLink className="h-3 w-3" />
                </a>
                {" "}and click "New Application"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-primary">2</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Get Your Bot Credentials</p>
              <p className="text-sm text-muted-foreground mb-2">
                In your application, go to the "Bot" tab and copy:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                <li>Bot Token (click "Reset Token" if needed)</li>
                <li>Application ID (found in the "General Information" tab)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-primary">3</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">Enable Required Intents</p>
              <Alert className="mb-2">
                <AlertDescription className="text-sm">
                  <strong>Important:</strong> In the "Bot" tab, scroll down to "Privileged Gateway Intents" and enable:
                </AlertDescription>
              </Alert>
              <div className="space-y-2 ml-2">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Presence Intent</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Server Members Intent</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Message Content Intent</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Without these intents, your bot won't go online or function properly
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-semibold text-primary">4</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Invite Bot to Your Server</p>
              <p className="text-sm text-muted-foreground">
                Go to "OAuth2" → "URL Generator", select "bot" scope and the necessary permissions, 
                then use the generated URL to invite your bot to your Discord server
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
