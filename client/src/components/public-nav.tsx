import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import type { User } from "@shared/schema";

const romoderateIcon = "/romoderate-icon.png";

export function PublicNav() {
  const [, setLocation] = useLocation();
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover-elevate active-elevate-2 p-2 rounded-lg transition-all"
            onClick={() => setLocation('/')}
          >
            <img 
              src={romoderateIcon} 
              alt="RoModerate" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold">RoModerate</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost"
              onClick={() => setLocation('/')}
              data-testid="link-home"
            >
              Home
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setLocation('/pricing')}
              data-testid="link-pricing"
            >
              Pricing
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setLocation('/docs')}
              data-testid="link-docs"
            >
              Docs
            </Button>
            {user ? (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/dashboard')}
                  data-testid="button-dashboard"
                >
                  Dashboard
                </Button>
                <UserAvatarMenu user={user} />
              </>
            ) : (
              <Button 
                variant="default" 
                onClick={() => setLocation('/login')}
                data-testid="button-login"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
