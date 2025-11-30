import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface RoleSelectorProps {
  serverId: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  testId?: string;
  multiple?: boolean;
}

export function RoleSelector({
  serverId,
  value,
  onChange,
  placeholder = "Select role(s)",
  testId,
  multiple = false,
}: RoleSelectorProps) {
  const { data: roles = [], isLoading, error } = useQuery<DiscordRole[]>({
    queryKey: [`/api/servers/${serverId}/roles`],
    enabled: !!serverId,
  });

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />;
  }

  const errorMessage = error ? (error as any).message : null;
  const sortedRoles = [...roles].sort((a, b) => b.position - a.position);

  if (multiple) {
    const selectedRoles = Array.isArray(value) ? value : [value].filter(Boolean);
    
    return (
      <div className="space-y-2">
        <Select
          value=""
          onValueChange={(roleId) => {
            if (!selectedRoles.includes(roleId)) {
              onChange([...selectedRoles, roleId]);
            }
          }}
        >
          <SelectTrigger className="min-h-9" data-testid={testId}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {errorMessage ? (
              <div className="py-6 px-2 text-center text-sm text-destructive">
                {errorMessage.includes("not online")
                  ? "Bot is offline. Please check your configuration."
                  : errorMessage.includes("not in your Discord server")
                  ? "Bot not detected in server. Please invite the bot first."
                  : "Error loading roles. Please try again."}
              </div>
            ) : sortedRoles.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Bot is loading or not connected. Please wait...
              </div>
            ) : (
              sortedRoles.map((role) => (
                <SelectItem
                  key={role.id}
                  value={role.id}
                  disabled={selectedRoles.includes(role.id)}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{role.name}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        
        {selectedRoles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map((roleId) => {
              const role = roles.find((r) => r.id === roleId);
              return (
                <Badge
                  key={roleId}
                  variant="secondary"
                  className="cursor-pointer hover-elevate"
                  onClick={() => onChange(selectedRoles.filter((id) => id !== roleId))}
                >
                  {role?.name || roleId} ×
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Select value={value as string} onValueChange={onChange as (value: string) => void}>
      <SelectTrigger className="min-h-9" data-testid={testId}>
        <SelectValue placeholder={placeholder}>
          {value && (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>{roles.find((r) => r.id === value)?.name || value}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {errorMessage ? (
          <div className="py-6 px-2 text-center text-sm text-destructive">
            {errorMessage.includes("not online")
              ? "Bot is offline. Please check your configuration."
              : errorMessage.includes("not in your Discord server")
              ? "Bot not detected in server. Please invite the bot first."
              : "Error loading roles. Please try again."}
          </div>
        ) : sortedRoles.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Bot is loading or not connected. Please wait...
          </div>
        ) : (
          sortedRoles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>{role.name}</span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
