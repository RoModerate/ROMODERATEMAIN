import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import type { User } from "@shared/schema";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
  
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to Discord OAuth login
      window.location.href = '/api/auth/discord';
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
