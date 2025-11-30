import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  ShoppingBag,
  Users,
  AlertTriangle,
  BarChart3,
  LogOut,
  Package,
  CheckCircle2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Admin {
  id: string;
  username: string;
}

interface AdminStats {
  pendingListings: number;
  totalUsers: number;
  completedTransactions: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if admin is authenticated
  const { data: admin, isLoading, error } = useQuery<Admin>({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!admin,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && (error || !admin)) {
      setLocation("/admin-panel");
    }
  }, [isLoading, error, admin, setLocation]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout", {});
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      setLocation("/admin-panel");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    { 
      label: "Pending Listings", 
      value: stats?.pendingListings?.toString() || "0", 
      icon: Package, 
      color: "text-yellow-500" 
    },
    { 
      label: "Total Users", 
      value: stats?.totalUsers?.toString() || "0", 
      icon: Users, 
      color: "text-blue-500" 
    },
    { 
      label: "Completed Transactions", 
      value: stats?.completedTransactions?.toString() || "0", 
      icon: CheckCircle2, 
      color: "text-green-500" 
    },
    { 
      label: "Total Revenue", 
      value: `${stats?.totalRevenue?.toLocaleString() || "0"} Robux`, 
      icon: BarChart3, 
      color: "text-primary" 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {admin?.username}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} data-testid="button-admin-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, i) => (
              <Card key={i} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Additional Features - Coming Soon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Pending Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-2xl font-bold mb-2">{stats?.pendingListings || 0}</p>
                <p className="text-sm text-muted-foreground">
                  Listing approval UI coming soon
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-2xl font-bold mb-2">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-muted-foreground">
                  User ban system coming soon
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Disputes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-2xl font-bold mb-2">0</p>
                <p className="text-sm text-muted-foreground">
                  Dispute resolution UI coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
