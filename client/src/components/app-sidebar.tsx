import { Shield, FileCheck, Users, Settings, AlertCircle, Ban, Search, UserCog, Zap, Key, Ticket, TrendingUp, Activity, Terminal, HelpCircle, Palette, ShoppingBag, Bell } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import type { User, Server } from "@shared/schema";

const romoderateIcon = "/romoderate-icon.png";

const menuItems = [
  {
    title: "Moderation Panel",
    url: "/moderation",
    icon: Shield,
  },
  {
    title: "User Search",
    url: "/user-search",
    icon: Search,
  },
  {
    title: "Bans",
    url: "/bans",
    icon: Ban,
  },
  {
    title: "Appeals",
    url: "/appeals",
    icon: AlertCircle,
  },
  {
    title: "Support Tickets",
    url: "/tickets",
    icon: Ticket,
  },
  {
    title: "Shift Panel",
    url: "/insights",
    icon: TrendingUp,
  },
  {
    title: "Team Members",
    url: "/team-members",
    icon: UserCog,
  },
  {
    title: "Auto Actions",
    url: "/auto-actions",
    icon: Zap,
  },
];

const marketplaceItems = [
  {
    title: "Browse Marketplace",
    url: "/marketplace",
    icon: ShoppingBag,
  },
];

const settingsItems = [
  {
    title: "Bot Commands",
    url: "/bot-commands",
    icon: Terminal,
    ownerOnly: false,
  },
  {
    title: "Help & FAQ",
    url: "/help",
    icon: HelpCircle,
    ownerOnly: false,
  },
  {
    title: "Activity Logs",
    url: "/logs",
    icon: Activity,
    ownerOnly: false,
  },
  {
    title: "Changelog Manager",
    url: "/changelog",
    icon: Bell,
    ownerOnly: true,
  },
  {
    title: "Reports Settings",
    url: "/reports-settings",
    icon: FileCheck,
    ownerOnly: true,
  },
  {
    title: "Appeals Settings",
    url: "/appeals-settings",
    icon: AlertCircle,
    ownerOnly: true,
  },
  {
    title: "Ticket Setup",
    url: "/ticket-setup",
    icon: Ticket,
    ownerOnly: true,
  },
  {
    title: "Roblox API Keys",
    url: "/api-keys",
    icon: Key,
    ownerOnly: true,
  },
  {
    title: "Game Profile",
    url: "/game-profile",
    icon: Palette,
    ownerOnly: true,
  },
  {
    title: "Server Settings",
    url: "/servers",
    icon: Settings,
    ownerOnly: true,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
    enabled: !!user,
  });

  const currentServer = servers[0];
  const isOwner = currentServer && user && currentServer.ownerId === user.id;
  
  const visibleSettingsItems = settingsItems.filter(item => 
    !item.ownerOnly || isOwner
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 hover-elevate active-elevate-2 p-2 rounded-lg transition-all cursor-pointer">
            <img 
              src={romoderateIcon} 
              alt="RoModerate" 
              className="h-9 w-9 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight">Ro Moderate</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Moderation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url || location.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Marketplace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {marketplaceItems.map((item) => {
                const isActive = location === item.url || location.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleSettingsItems.map((item) => {
                const isActive = location === item.url || location.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
            <Avatar className="h-9 w-9">
              <AvatarImage 
                src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : undefined} 
                alt={user.username} 
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground">Discord User</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to logout? You'll need to reconnect with Discord to access your dashboard again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-logout">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => window.location.href = '/api/auth/logout'}
                    data-testid="button-confirm-logout"
                  >
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
