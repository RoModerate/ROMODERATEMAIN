import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

export function NotificationsMenu() {
  const [, setLocation] = useLocation();
  
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("PATCH", `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/notifications/mark-all-read", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    
    if (notification.metadata?.link) {
      setLocation(notification.metadata.link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              className="h-auto p-1 text-xs"
              data-testid="button-mark-all-read"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  !notification.isRead ? "bg-muted/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
