import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hash, Folder } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

interface ChannelSelectorProps {
  serverId: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "category";
  placeholder?: string;
  testId?: string;
}

export function ChannelSelector({
  serverId,
  value,
  onChange,
  type = "text",
  placeholder = "Select a channel",
  testId,
}: ChannelSelectorProps) {
  const { data: channels = [], isLoading, error } = useQuery<DiscordChannel[]>({
    queryKey: [`/api/servers/${serverId}/channels`],
    enabled: !!serverId,
  });

  const filteredChannels = channels.filter((channel) => {
    if (type === "text") return channel.type === 0;
    if (type === "category") return channel.type === 4;
    return true;
  });

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />;
  }

  const errorMessage = error ? (error as any).message : null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="min-h-9" data-testid={testId}>
        <SelectValue placeholder={placeholder}>
          {value && (
            <div className="flex items-center gap-2">
              {type === "category" ? (
                <Folder className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Hash className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{filteredChannels.find((c) => c.id === value)?.name || value}</span>
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
              : "Error loading channels. Please try again."}
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {channels.length === 0 
              ? "Bot is loading or not connected. Please wait..." 
              : `No ${type === "category" ? "categories" : "channels"} found`}
          </div>
        ) : (
          filteredChannels.map((channel) => (
            <SelectItem key={channel.id} value={channel.id}>
              <div className="flex items-center gap-2">
                {type === "category" ? (
                  <Folder className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Hash className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{channel.name}</span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
