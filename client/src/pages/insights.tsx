import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Users, Ban, FileCheck, MessageSquare, Activity, Timer, PlayCircle, StopCircle } from "lucide-react";
import type { Server } from "@shared/schema";
import { ServerSelector } from "@/components/server-selector";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ModeratorShift {
  id: string;
  serverId: string;
  userId: string;
  startTime: Date;
  endTime: Date | null;
  status: 'active' | 'completed';
  metrics: {
    actionsCount: number;
    bansIssued: number;
    appealsReviewed: number;
    ticketsHandled: number;
    reportsProcessed: number;
  };
  user?: {
    id: string;
    discordId: string;
    username: string;
    avatar: string | null;
  };
}

interface Analytics {
  totalBans: number;
  activeBans: number;
  totalAppeals: number;
  pendingAppeals: number;
  totalTickets: number;
  openTickets: number;
  trends: {
    bansLast30Days: number;
    appealsLast30Days: number;
    ticketsLast30Days: number;
  };
}

export default function Insights() {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
  });

  const { data: analytics } = useQuery<Analytics>({
    queryKey: [`/api/analytics?serverId=${selectedServer}`],
    enabled: !!selectedServer,
  });

  const { data: shifts = [], isLoading: shiftsLoading } = useQuery<ModeratorShift[]>({
    queryKey: ["/api/shifts", selectedServer],
    enabled: !!selectedServer,
  });

  const { data: activeShift } = useQuery<ModeratorShift | null>({
    queryKey: [`/api/shifts/active?serverId=${selectedServer}`],
    enabled: !!selectedServer,
  });

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id);
    }
  }, [servers, selectedServer]);

  const startShiftMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/shifts/start", { serverId: selectedServer });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts", selectedServer] });
      queryClient.invalidateQueries({ queryKey: [`/api/shifts/active?serverId=${selectedServer}`] });
      toast({
        title: "Shift Started",
        description: "Your moderation shift has begun. Good luck!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Start Shift",
        description: error.message || "Could not start shift",
        variant: "destructive",
      });
    },
  });

  const endShiftMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/shifts/end", { serverId: selectedServer });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts", selectedServer] });
      queryClient.invalidateQueries({ queryKey: [`/api/shifts/active?serverId=${selectedServer}`] });
      toast({
        title: "Shift Ended",
        description: "Your shift has been recorded. Great work!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to End Shift",
        description: error.message || "Could not end shift",
        variant: "destructive",
      });
    },
  });

  const formatShiftDuration = (startTime: Date, endTime: Date | null) => {
    const end = endTime || new Date();
    const duration = intervalToDuration({
      start: new Date(startTime),
      end: new Date(end),
    });
    return formatDuration(duration, { format: ['hours', 'minutes'] }) || '0 minutes';
  };

  const completedShifts = shifts.filter(s => s.status === 'completed');
  const activeShifts = shifts.filter(s => s.status === 'active');

  const totalShiftHours = completedShifts.reduce((acc, shift) => {
    if (shift.endTime) {
      const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
      return acc + hours;
    }
    return acc;
  }, 0);

  const totalActions = completedShifts.reduce((acc, shift) => acc + shift.metrics.actionsCount, 0);

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Activity className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Servers Found</h2>
        <p className="text-muted-foreground">Connect a Discord server to view insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shift Panel</h1>
          <p className="text-muted-foreground">
            Start your shift, track metrics, and view moderation performance
          </p>
        </div>
        <ServerSelector
          servers={servers}
          value={selectedServer}
          onChange={setSelectedServer}
          testId="select-server"
        />
      </div>

      {activeShift && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary animate-pulse" />
                <CardTitle>Active Shift</CardTitle>
              </div>
              <Button
                onClick={() => endShiftMutation.mutate()}
                disabled={endShiftMutation.isPending}
                variant="destructive"
                size="sm"
                data-testid="button-end-shift"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                End Shift
              </Button>
            </div>
            <CardDescription>
              Started {format(new Date(activeShift.startTime), 'PPp')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-bold">{formatShiftDuration(activeShift.startTime, null)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actions</p>
                <p className="text-lg font-bold">{activeShift.metrics.actionsCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bans</p>
                <p className="text-lg font-bold">{activeShift.metrics.bansIssued}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Appeals</p>
                <p className="text-lg font-bold">{activeShift.metrics.appealsReviewed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tickets</p>
                <p className="text-lg font-bold">{activeShift.metrics.ticketsHandled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!activeShift && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Not on Shift</h3>
                <p className="text-sm text-muted-foreground">Start a shift to track your moderation activities</p>
              </div>
              <Button
                onClick={() => startShiftMutation.mutate()}
                disabled={startShiftMutation.isPending}
                data-testid="button-start-shift"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Shift
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="stat-total-shifts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Total Shifts</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedShifts.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeShifts.length} currently active
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-shift-hours">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Timer className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalShiftHours)}</div>
            <p className="text-xs text-muted-foreground">
              Across all shifts
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-total-actions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActions}</div>
            <p className="text-xs text-muted-foreground">
              During shifts
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-active-bans">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">Active Bans</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeBans || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalBans || 0} total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shifts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shifts" data-testid="tab-shifts">
            Shift History
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            Server Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Shifts</CardTitle>
              <CardDescription>Moderator shift history and performance</CardDescription>
            </CardHeader>
            <CardContent>
              {shiftsLoading ? (
                <div className="text-center py-12 space-y-3">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading shifts...</p>
                </div>
              ) : completedShifts.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">No shifts recorded</p>
                    <p className="text-sm text-muted-foreground">
                      Shifts will appear here when moderators clock in and out
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="flex items-start gap-3 p-4 rounded-lg border hover-elevate"
                      data-testid={`shift-${shift.id}`}
                    >
                      <Avatar className="h-10 w-10">
                        {shift.user?.avatar ? (
                          <AvatarImage
                            src={`https://cdn.discordapp.com/avatars/${shift.user.discordId}/${shift.user.avatar}.png`}
                            alt={shift.user.username}
                          />
                        ) : null}
                        <AvatarFallback>
                          {shift.user?.username?.charAt(0).toUpperCase() || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold">{shift.user?.username || 'Unknown'}</p>
                          <Badge variant="outline" className="text-xs">
                            {formatShiftDuration(shift.startTime, shift.endTime)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground">{shift.metrics.actionsCount}</span> actions
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{shift.metrics.bansIssued}</span> bans
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{shift.metrics.appealsReviewed}</span> appeals
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{shift.metrics.ticketsHandled}</span> tickets
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{shift.metrics.reportsProcessed}</span> reports
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(shift.startTime), 'PPp')} - {shift.endTime && format(new Date(shift.endTime), 'p')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Overview</CardTitle>
                <CardDescription>Current server statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ban className="h-4 w-4 text-destructive" />
                    <span className="text-sm">Total Bans</span>
                  </div>
                  <span className="font-bold">{analytics?.totalBans || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Pending Appeals</span>
                  </div>
                  <span className="font-bold">{analytics?.pendingAppeals || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Open Tickets</span>
                  </div>
                  <span className="font-bold">{analytics?.openTickets || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>30-Day Trends</CardTitle>
                <CardDescription>Activity over the past month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm">Bans Issued</span>
                  </div>
                  <span className="font-bold">{analytics?.trends?.bansLast30Days || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm">Appeals Submitted</span>
                  </div>
                  <span className="font-bold">{analytics?.trends?.appealsLast30Days || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm">Tickets Created</span>
                  </div>
                  <span className="font-bold">{analytics?.trends?.ticketsLast30Days || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
