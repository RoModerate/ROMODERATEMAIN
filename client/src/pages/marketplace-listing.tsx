import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Shield,
  TrendingUp,
  Heart,
  Share2,
  Flag,
  Store,
  Star,
  Eye,
  ShoppingCart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import type { MarketplaceListing, User } from "../../../shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MarketplaceListing() {
  const [, params] = useRoute("/marketplace/listing/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: listing, isLoading } = useQuery<MarketplaceListing>({
    queryKey: ["/api/marketplace/listings", params?.id],
    enabled: !!params?.id,
  });

  const makeOfferMutation = useMutation({
    mutationFn: async (data: { listingId: string; amount: number; message: string }) => {
      return apiRequest("POST", "/api/marketplace/offers", data);
    },
    onSuccess: () => {
      toast({
        title: "Offer Sent",
        description: "Your offer has been sent to the seller.",
      });
      setOfferAmount("");
      setOfferMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const buyNowMutation = useMutation({
    mutationFn: async (listingId: string) => {
      return apiRequest("POST", "/api/marketplace/transactions", { listingId, type: "buy" });
    },
    onSuccess: () => {
      toast({
        title: "Purchase Initiated",
        description: "Your purchase is being processed. Funds will be held in escrow.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate purchase. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
          <p className="text-muted-foreground mb-6">This item may have been sold or removed.</p>
          <Button onClick={() => setLocation("/marketplace")} data-testid="button-back-to-marketplace">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : ["/placeholder.png"];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleMakeOffer = () => {
    if (!user) {
      window.location.href = "/api/auth/discord";
      return;
    }
    
    const amount = parseFloat(offerAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid offer amount.",
        variant: "destructive",
      });
      return;
    }

    makeOfferMutation.mutate({
      listingId: listing.id,
      amount,
      message: offerMessage,
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      window.location.href = "/api/auth/discord";
      return;
    }

    buyNowMutation.mutate(listing.id);
  };

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
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" data-testid="button-favorite">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-share">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-report">
                <Flag className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 rounded-lg overflow-hidden border-2">
              <img
                src={images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover-elevate"
                    data-testid="button-prev-image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover-elevate"
                    data-testid="button-next-image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all ${
                          i === currentImageIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      i === currentImageIndex ? "border-primary" : "border-transparent"
                    }`}
                    data-testid={`button-thumbnail-${i}`}
                  >
                    <img src={img} alt={`${listing.title} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{listing.category}</Badge>
                {listing.viewCount > 100 && (
                  <Badge variant="secondary" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Trending
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {listing.viewCount} views
                </div>
              </div>
            </div>

            <Separator />

            {/* Price Section */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-5xl font-bold">
                    {listing.price.toLocaleString()}
                  </span>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {listing.currency}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full text-lg h-14"
                    onClick={handleBuyNow}
                    disabled={buyNowMutation.isPending}
                    data-testid="button-buy-now"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {buyNowMutation.isPending ? "Processing..." : "Buy Now"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder={`Make an offer (min ${Math.floor(listing.price * 0.5)})`}
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      data-testid="input-offer-amount"
                    />
                    <Textarea
                      placeholder="Add a message (optional)"
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      rows={2}
                      data-testid="input-offer-message"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleMakeOffer}
                      disabled={makeOfferMutation.isPending}
                      data-testid="button-make-offer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {makeOfferMutation.isPending ? "Sending..." : "Make Offer"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 p-3 bg-background/50 rounded-md">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm">Protected by Escrow System</span>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {(listing as any).seller?.avatar ? (
                      <AvatarImage 
                        src={`https://cdn.discordapp.com/avatars/${(listing as any).seller.id}/${(listing as any).seller.avatar}.png`} 
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-lg">
                      {(listing as any).seller?.username?.[0]?.toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">
                      {(listing as any).seller?.username || 'Unknown Seller'}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        Discord Verified
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setLocation(`/marketplace/seller/${listing.sellerId}`)}
                    data-testid="button-view-store"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    View Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description & Details */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
              </CardContent>
            </Card>

            {listing.tags && listing.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{listing.category}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition</span>
                  <Badge variant="outline">New</Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed</span>
                  <span className="font-medium">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Buyer Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Funds held in secure escrow</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Full refund if item not as described</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Dispute resolution system</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
