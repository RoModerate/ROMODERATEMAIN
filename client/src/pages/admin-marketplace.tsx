import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  Trash2,
  Ban,
  CheckCircle,
  MoreVertical,
  Eye,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import type { MarketplaceListing } from "../../../shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  suspendedListings: number;
  totalValue: number;
}

export default function AdminMarketplace() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'suspend' | 'activate'>('delete');
  const [actionReason, setActionReason] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<MarketplaceStats>({
    queryKey: ["/api/admin/marketplace/stats"],
  });

  const { data: listings = [], isLoading, refetch } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/admin/marketplace/listings", statusFilter !== 'all' ? { status: statusFilter } : {}],
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return apiRequest("DELETE", `/api/admin/marketplace/listings/${id}`, { reason });
    },
    onSuccess: () => {
      toast({ title: "Listing deleted", description: "The listing has been removed and the seller notified." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketplace/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketplace/stats"] });
      setActionDialogOpen(false);
      setActionReason("");
      setSelectedListing(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete listing.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason: string }) => {
      return apiRequest("PATCH", `/api/admin/marketplace/listings/${id}`, { status, reason });
    },
    onSuccess: () => {
      toast({ title: "Listing updated", description: "The listing status has been updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketplace/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketplace/stats"] });
      setActionDialogOpen(false);
      setActionReason("");
      setSelectedListing(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update listing.", variant: "destructive" });
    },
  });

  const handleAction = (listing: MarketplaceListing, type: 'delete' | 'suspend' | 'activate') => {
    setSelectedListing(listing);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const executeAction = () => {
    if (!selectedListing || !actionReason.trim()) return;
    
    if (actionType === 'delete') {
      deleteMutation.mutate({ id: selectedListing.id, reason: actionReason });
    } else {
      const newStatus = actionType === 'suspend' ? 'suspended' : 'active';
      updateMutation.mutate({ id: selectedListing.id, status: newStatus, reason: actionReason });
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = 
      searchQuery === "" ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'sold':
        return <Badge variant="secondary">Sold</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/admin-panel/dashboard")}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Marketplace Admin</h1>
              </div>
            </div>
            <Button variant="outline" onClick={() => refetch()} className="gap-2" data-testid="button-refresh">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                  <p className="text-2xl font-bold">{stats?.totalListings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats?.activeListings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sold</p>
                  <p className="text-2xl font-bold">{stats?.soldListings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Ban className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                  <p className="text-2xl font-bold">{stats?.suspendedListings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{(stats?.totalValue || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48" data-testid="select-status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              All Listings ({filteredListings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading listings...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search" : "No marketplace listings yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Listing</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListings.map((listing) => {
                      const seller = (listing as any).seller;
                      const sellerAvatar = seller?.avatar 
                        ? `https://cdn.discordapp.com/avatars/${seller.discordId}/${seller.avatar}.png`
                        : undefined;
                      
                      return (
                        <TableRow key={listing.id} data-testid={`row-listing-${listing.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {listing.images && listing.images.length > 0 ? (
                                <img 
                                  src={listing.images[0]} 
                                  alt={listing.title}
                                  className="h-12 w-12 rounded-md object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium line-clamp-1">{listing.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {listing.description.substring(0, 50)}...
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={sellerAvatar} />
                                <AvatarFallback>{seller?.username?.[0]?.toUpperCase() || 'S'}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{seller?.username || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{listing.price.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-1">{listing.currency}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{listing.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(listing.status)}
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">{listing.viewCount}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(listing.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-actions-${listing.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => setLocation(`/marketplace/listing/${listing.id}`)}
                                  data-testid={`action-view-${listing.id}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Listing
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setLocation(`/marketplace/seller/${listing.sellerId}`)}
                                  data-testid={`action-view-seller-${listing.id}`}
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Seller
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {listing.status === 'active' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleAction(listing, 'suspend')}
                                    className="text-yellow-600"
                                    data-testid={`action-suspend-${listing.id}`}
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspend Listing
                                  </DropdownMenuItem>
                                )}
                                {listing.status === 'suspended' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleAction(listing, 'activate')}
                                    className="text-green-600"
                                    data-testid={`action-activate-${listing.id}`}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Reactivate Listing
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => handleAction(listing, 'delete')}
                                  className="text-destructive focus:text-destructive"
                                  data-testid={`action-delete-${listing.id}`}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Listing
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'delete' && <Trash2 className="h-5 w-5 text-destructive" />}
              {actionType === 'suspend' && <Ban className="h-5 w-5 text-yellow-600" />}
              {actionType === 'activate' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {actionType === 'delete' && 'Delete Listing'}
              {actionType === 'suspend' && 'Suspend Listing'}
              {actionType === 'activate' && 'Reactivate Listing'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'delete' && 'This action cannot be undone. The listing will be permanently removed.'}
              {actionType === 'suspend' && 'The listing will be hidden from the marketplace until reactivated.'}
              {actionType === 'activate' && 'The listing will be visible again on the marketplace.'}
            </DialogDescription>
          </DialogHeader>
          {selectedListing && (
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="font-semibold">{selectedListing.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedListing.price.toLocaleString()} {selectedListing.currency}
              </p>
            </div>
          )}
          <div className="space-y-4">
            <Textarea
              placeholder="Provide a reason for this action (will be sent to Discord)..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
              data-testid="input-action-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              variant={actionType === 'delete' ? 'destructive' : actionType === 'suspend' ? 'default' : 'default'}
              onClick={executeAction}
              disabled={!actionReason.trim() || deleteMutation.isPending || updateMutation.isPending}
              data-testid="button-confirm-action"
            >
              {(deleteMutation.isPending || updateMutation.isPending) ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
