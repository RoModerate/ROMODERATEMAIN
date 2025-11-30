import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Server } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Server as ServerType } from "@shared/schema";

interface ServerSelectorProps {
  servers: ServerType[];
  value: string | null;
  onChange: (value: string | null) => void;
  testId?: string;
}

function getServerIcon(server: ServerType) {
  if (server.icon) {
    return `https://cdn.discordapp.com/icons/${server.discordServerId}/${server.icon}.png?size=64`;
  }
  return null;
}

export function ServerSelector({ servers, value, onChange, testId }: ServerSelectorProps) {
  if (servers.length === 0) {
    return null;
  }

  const selectedServer = servers.find(s => s.id === value);

  if (servers.length === 1) {
    const server = servers[0];
    const iconUrl = getServerIcon(server);
    
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50">
        {iconUrl ? (
          <img src={iconUrl} alt={server.name} className="h-5 w-5 rounded" />
        ) : (
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-xs">
              {server.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="text-sm font-medium">{server.name}</span>
      </div>
    );
  }

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]" data-testid={testId}>
        <SelectValue placeholder="Select server">
          {selectedServer && (
            <div className="flex items-center gap-2">
              {getServerIcon(selectedServer) ? (
                <img 
                  src={getServerIcon(selectedServer)!} 
                  alt={selectedServer.name}
                  className="h-5 w-5 rounded"
                />
              ) : (
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {selectedServer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <span>{selectedServer.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {servers.map((server) => {
          const iconUrl = getServerIcon(server);
          return (
            <SelectItem key={server.id} value={server.id}>
              <div className="flex items-center gap-2">
                {iconUrl ? (
                  <img src={iconUrl} alt={server.name} className="h-5 w-5 rounded" />
                ) : (
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">
                      {server.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span>{server.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
