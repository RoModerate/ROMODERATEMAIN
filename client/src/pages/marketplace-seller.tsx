import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Store,
  Star,
  ShoppingBag,
  Grid3X3,
  TrendingUp,
  Shield,
  CheckCircle2,
  Flag,
  MoreVertical,
  Calendar,
  MessageCircle,
  ExternalLink
} from "lucide-react";
import type { MarketplaceListing, User as UserType } from "../../../shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MarketplaceSeller() {
  const [, params] = useRoute("/marketplace/seller/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const { data: currentUser } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: listings = [], isLoading } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/marketplace/listings", { sellerId: params?.id }],
    enabled: !!params?.id,
  });

  const sellerInfo = listings.length > 0 ? (listings[0] as any).seller : null;

  const reportMutation = useMutation({
    mutationFn: async (data: { type: string; targetId: string; reason: string }) => {
      return apiRequest("POST", "/api/marketplace/reports", data);
    },
    onSuccess: () => {
      toast({ title: "Report submitted", description: "Thank you for helping keep our marketplace safe." });
      setReportDialogOpen(false);
      setReportReason("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit report.", variant: "destructive" });
    },
  });

  const handleReport = () => {
    if (!currentUser) {
      toast({ title: "Login required", description: "Please sign in to report users.", variant: "destructive" });
      return;
    }
    setReportDialogOpen(true);
  };

  const submitReport = () => {
    if (!reportReason.trim() || !params?.id) return;
    reportMutation.mutate({
      type: 'seller',
      targetId: params.id,
      reason: reportReason,
    });
  };

  const activeListings = listings.filter(l => l.status === "active");
  const soldListings = listings.filter(l => l.status === "sold");

  const sellerAvatar = sellerInfo?.avatar 
    ? `https://cdn.discordapp.com/avatars/${sellerInfo.discordId}/${sellerInfo.avatar}.png`
    : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => setLocation("/marketplace")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>

            {currentUser && params?.id !== currentUser.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-seller-menu">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleReport} data-testid="menu-report-seller">
                    <Flag className="mr-2 h-4 w-4" />
                    Report Seller
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Seller Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={sellerAvatar} alt={sellerInfo?.username || "Seller"} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {sellerInfo?.username?.[0]?.toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{sellerInfo?.username || "Unknown Seller"}</h1>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                  {params?.id === currentUser?.id && (
                    <Badge className="gap-1">
                      This is you
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">4.9</span>
                    <span>(234 reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="h-4 w-4" />
                    <span>{activeListings.length} active listings</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Member since 2024</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Trusted seller with escrow protection</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {currentUser && params?.id !== currentUser.id && (
                    <Button variant="outline" className="gap-2" data-testid="button-message-seller">
                      <MessageCircle className="h-4 w-4" />
                      Message Seller
                    </Button>
                  )}
                  {params?.id === currentUser?.id && (
                    <Button onClick={() => setLocation("/marketplace/create")} className="gap-2" data-testid="button-new-listing">
                      <Store className="h-4 w-4" />
                      Create New Listing
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{activeListings.length}</div>
              <div className="text-sm text-muted-foreground">Active Listings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{soldListings.length}</div>
              <div className="text-sm text-muted-foreground">Items Sold</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">4.9</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Response Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Listings */}
        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active" data-testid="tab-active">
              Active Listings ({activeListings.length})
            </TabsTrigger>
            <TabsTrigger value="sold" data-testid="tab-sold">
              Sold Items ({soldListings.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">
              Reviews (234)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeListings.length === 0 ? (
              <div className="text-center py-20">
                <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No active listings</h3>
                <p className="text-muted-foreground">This seller currently has no active items for sale.</p>
                {params?.id === currentUser?.id && (
                  <Button onClick={() => setLocation("/marketplace/create")} className="mt-4" data-testid="button-create-listing">
                    Create Your First Listing
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeListings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="group overflow-hidden hover-elevate cursor-pointer transition-all border-2 hover:border-primary/50"
                    onClick={() => setLocation(`/marketplace/listing/${listing.id}`)}
                    data-testid={`card-listing-${listing.id}`}
                  >
                    <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Grid3X3 className="h-20 w-20 text-muted-foreground/30" />
                        </div>
                      )}
                      {listing.viewCount > 100 && (
                        <Badge className="absolute top-3 left-3 gap-1 bg-primary/90 backdrop-blur-sm">
                          <TrendingUp className="h-3 w-3" />
                          Trending
                        </Badge>
                      )}
                      <Badge variant="secondary" className="absolute top-3 right-3 backdrop-blur-sm">
                        {listing.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {listing.description}
                        </p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {listing.price.toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {listing.currency}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sold">
            {soldListings.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No sold items</h3>
                <p className="text-muted-foreground">Sold items will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {soldListings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="overflow-hidden opacity-75"
                    data-testid={`card-sold-${listing.id}`}
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover grayscale"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Grid3X3 className="h-20 w-20 text-muted-foreground/30" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-green-500">
                        Sold
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">{listing.price.toLocaleString()}</span>
                        <Badge variant="outline" className="text-xs">{listing.currency}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <div className="text-center py-20">
              <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Reviews coming soon</h3>
              <p className="text-muted-foreground">Buyer reviews will be displayed here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Seller</DialogTitle>
            <DialogDescription>
              Reporting: {sellerInfo?.username || "Unknown Seller"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Please describe why you're reporting this seller..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              data-testid="input-report-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)} data-testid="button-cancel-report">
              Cancel
            </Button>
            <Button 
              onClick={submitReport} 
              disabled={!reportReason.trim() || reportMutation.isPending}
              data-testid="button-submit-report"
            >
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
