import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  category: z.string().min(1, "Please select a category"),
  itemType: z.string().min(1, "Please select an item type"),
  robloxAssetId: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  currency: z.string().default("robux"),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
});

type ListingFormValues = z.infer<typeof listingSchema>;

const categories = [
  { value: "limiteds", label: "Limiteds" },
  { value: "accessories", label: "Accessories" },
  { value: "game-passes", label: "Game Passes" },
  { value: "emotes", label: "Emotes" },
  { value: "ugc", label: "UGC Items" },
  { value: "other", label: "Other" },
];

const itemTypes = [
  { value: "hat", label: "Hat" },
  { value: "face", label: "Face" },
  { value: "gear", label: "Gear" },
  { value: "emote", label: "Emote" },
  { value: "gamepass", label: "Game Pass" },
  { value: "bundle", label: "Bundle" },
  { value: "other", label: "Other" },
];

export function CreateListingDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      itemType: "",
      robloxAssetId: "",
      price: 0,
      currency: "robux",
      tags: [],
      images: [],
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: ListingFormValues) => {
      return apiRequest("/api/marketplace/listings", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/listings"] });
      toast({
        title: "Listing created",
        description: "Your item has been listed successfully!",
      });
      form.reset();
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ListingFormValues) => {
    createListingMutation.mutate(data);
  };

  const addTag = () => {
    if (tagInput.trim() && form.getValues("tags").length < 10) {
      const currentTags = form.getValues("tags");
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tag: string) => {
    form.setValue("tags", form.getValues("tags").filter(t => t !== tag));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button data-testid="button-create-listing">
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
          <DialogDescription>
            List your Roblox item for sale in the marketplace
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Dominus Empyreus"
                      data-testid="input-listing-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your item, condition, and any important details..."
                      className="min-h-[100px]"
                      data-testid="input-listing-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-listing-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-listing-item-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {itemTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1000"
                        data-testid="input-listing-price"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Price in Robux</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="robloxAssetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roblox Asset ID (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456789"
                        data-testid="input-listing-asset-id"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      data-testid="input-listing-tags"
                    />
                    <Button type="button" variant="outline" onClick={addTag} data-testid="button-add-tag">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch("tags").map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover-elevate rounded-full"
                          data-testid={`button-remove-tag-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Add up to 10 tags to help buyers find your item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel-listing"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createListingMutation.isPending}
                data-testid="button-submit-listing"
              >
                {createListingMutation.isPending ? "Creating..." : "Create Listing"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
