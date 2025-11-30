import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, Shield } from "lucide-react";
import type { User } from "@shared/schema";
import { useLocation } from "wouter";

interface UserAvatarMenuProps {
  user: User;
}

export function UserAvatarMenu({ user }: UserAvatarMenuProps) {
  const [, navigate] = useLocation();

  const getDiscordAvatarUrl = (discordId: string, avatar: string | null) => {
    if (!avatar) return null;
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png?size=256`;
  };

  const getUserInitials = (username: string) => {
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = getDiscordAvatarUrl(user.discordId, user.avatar);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          data-testid="button-user-avatar"
        >
          <Avatar className="h-9 w-9 cursor-pointer hover-elevate transition-all">
            <AvatarImage src={avatarUrl || undefined} alt={user.username} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {getUserInitials(user.username)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || undefined} alt={user.username} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getUserInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium" data-testid="text-username">
              {user.username}
            </span>
            {user.discriminator && user.discriminator !== "0" && (
              <span className="text-xs text-muted-foreground">
                #{user.discriminator}
              </span>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/dashboard")}
          data-testid="link-dashboard"
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/moderation")}
          data-testid="link-moderation"
        >
          <Shield className="mr-2 h-4 w-4" />
          Moderator Portal
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => (window.location.href = "/api/auth/logout")}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
