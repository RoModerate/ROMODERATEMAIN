import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ShoppingBag, Tag, TrendingUp, Users, Filter, Plus } from "lucide-react";
import type { MarketplaceListing } from "@shared/schema";
import { CreateListingDialog } from "@/components/create-listing-dialog";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const { data: listings = [], isLoading } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/marketplace/listings", { search: searchQuery, category: selectedCategory, sort: sortBy }],
  });

  const categories = [
    { value: "all", label: "All Items", icon: ShoppingBag },
    { value: "limiteds", label: "Limiteds", icon: Tag },
    { value: "accessories", label: "Accessories", icon: Users },
    { value: "game-passes", label: "Game Passes", icon: TrendingUp },
  ];

  const filteredAndSortedListings = listings
    .filter((listing) => {
      const matchesSearch =
        searchQuery === "" ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "popular":
          return b.viewCount - a.viewCount;
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Browse and trade Roblox items safely with the community
          </p>
        </div>
        <CreateListingDialog>
          <Button data-testid="button-create-listing">
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </CreateListingDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-marketplace"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-[200px]" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="md:w-[180px]" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              data-testid={`tab-${cat.value}`}
            >
              <cat.icon className="h-4 w-4 mr-2" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.value} value={cat.value} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-muted animate-pulse" />
                    <CardHeader>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : filteredAndSortedListings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No listings found</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filters"
                      : "Be the first to list an item in the marketplace!"}
                  </p>
                  <CreateListingDialog>
                    <Button className="mt-4" data-testid="button-create-listing-empty">
                      Create Listing
                    </Button>
                  </CreateListingDialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedListings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="overflow-hidden hover-elevate cursor-pointer"
                    onClick={() => window.location.href = `/marketplace/listing/${listing.id}`}
                    data-testid={`card-listing-${listing.id}`}
                  >
                    <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-500 relative">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="h-16 w-16 text-white/50" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2">{listing.category}</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {listing.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">
                            {listing.price.toLocaleString()}
                          </span>
                          <Badge variant="secondary">{listing.currency}</Badge>
                        </div>
                      </div>
                      {listing.tags && listing.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {listing.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/marketplace/listing/${listing.id}`;
                        }}
                        data-testid={`button-view-${listing.id}`}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`button-offer-${listing.id}`}
                      >
                        Make Offer
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
