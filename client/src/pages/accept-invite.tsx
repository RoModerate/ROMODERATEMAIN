import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AcceptInvite() {
  const [, params] = useRoute("/invite/:code");
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const code = params?.code;

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setMessage("Invalid invitation link");
      return;
    }

    const redirectToDiscord = () => {
      const redirectUrl = `/api/auth/discord?invite=${encodeURIComponent(code)}`;
      window.location.href = redirectUrl;
    };

    redirectToDiscord();
  }, [code]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Team Invitation
          </CardTitle>
          <CardDescription>
            You've been invited to join a moderation team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                Redirecting you to Discord to accept this invitation...
              </p>
            </div>
          )}

          {status === "success" && (
            <Alert className="border-green-500/20 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {message || "This invitation link is invalid or has expired"}
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-go-home"
                >
                  Go Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
