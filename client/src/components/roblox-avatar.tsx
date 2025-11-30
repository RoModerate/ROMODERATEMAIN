import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface RobloxAvatarProps {
  robloxUserId: string;
  username?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  avatarUrl?: string | null;
}

export function RobloxAvatar({ robloxUserId, username, className, size = "md", avatarUrl: providedAvatarUrl }: RobloxAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const avatarUrl = providedAvatarUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxUserId}&width=150&height=150&format=png`;

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ""}`}>
      <AvatarImage 
        src={avatarUrl} 
        alt={username || `Roblox User ${robloxUserId}`}
      />
      <AvatarFallback>
        <User className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );
}
