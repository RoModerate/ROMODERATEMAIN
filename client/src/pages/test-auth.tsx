// Quick test page to verify authentication
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import type { User } from "@shared/schema";

export default function TestAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Status:</p>
            {isLoading ? (
              <p className="text-yellow-600">Loading...</p>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                <span>Not authenticated</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Authenticated</span>
              </div>
            ) : null}
          </div>

          {user && (
            <div className="space-y-2">
              <p className="text-sm"><strong>Username:</strong> {user.username}</p>
              <p className="text-sm"><strong>Discord ID:</strong> {user.discordId}</p>
              <p className="text-sm"><strong>Email:</strong> {user.email || 'N/A'}</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm">
              <p className="font-medium text-red-900 dark:text-red-200">Error:</p>
              <p className="text-red-700 dark:text-red-300">{(error as Error).message}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <a href="/api/auth/discord" className="text-sm text-primary hover:underline">
              → Login with Discord
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
