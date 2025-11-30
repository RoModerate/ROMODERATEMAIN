import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, Sparkles, Image as ImageIcon, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertMarketplaceListingSchema, type User } from "../../../shared/schema";
import imageCompression from 'browser-image-compression';
import { TosAcceptanceModal } from "@/components/tos-acceptance-modal";

const createListingSchema = insertMarketplaceListingSchema.omit({ sellerId: true });

export default function MarketplaceCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showTosModal, setShowTosModal] = useState(false);
  const [tosJustAccepted, setTosJustAccepted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  useEffect(() => {
    if (user && !user.tosAcceptedAt && !tosJustAccepted) {
      setShowTosModal(true);
    }
  }, [user, tosJustAccepted]);

  const form = useForm<z.infer<typeof createListingSchema>>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      currency: "robux",
      category: "ugc",
      itemType: "ugc-item",
      tags: [],
      images: [],
      status: "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createListingSchema>) => {
      return apiRequest("POST", "/api/marketplace/listings", { ...data, tags });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success!",
        description: "Your listing has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/listings"] });
      setLocation(`/marketplace/listing/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag) && tags.length < 10) {
      setTags([...tags, currentTag]);
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const maxImages = 5;
    const maxSizeMB = 5;

    if (uploadedImages.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can upload a maximum of ${maxImages} images.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const newImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          continue;
        }

        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds ${maxSizeMB}MB. Compressing...`,
          });
        }

        // Compress image
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);

        // Check post-compression size
        if (compressedFile.size > maxSizeMB * 1024 * 1024) {
          toast({
            title: "Compression failed",
            description: `${file.name} is still too large after compression. Please use a smaller image.`,
            variant: "destructive",
          });
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            newImages.push(base64);
            resolve(null);
          };
          reader.onerror = () => {
            toast({
              title: "Read error",
              description: `Failed to read ${file.name}.`,
              variant: "destructive",
            });
            reject();
          };
          reader.readAsDataURL(compressedFile);
        }).catch(() => {
          // Continue with next file on error
        });
      }

      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      form.setValue('images', updatedImages);

      // Reset file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (newImages.length > 0) {
        toast({
          title: "Images uploaded!",
          description: `${newImages.length} image(s) added successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    form.setValue('images', updatedImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const onSubmit = (data: z.infer<typeof createListingSchema>) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            Create a Listing
          </h1>
          <p className="text-muted-foreground">
            List your item on the marketplace and reach thousands of potential buyers.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Provide details about your item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a catchy title..."
                          {...field}
                          data-testid="input-title"
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
                          placeholder="Describe your item in detail..."
                          rows={6}
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormDescription>
                        Include details about features, condition, and what makes your item special.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ugc">UGC Items</SelectItem>
                            <SelectItem value="game-passes">Game Passes</SelectItem>
                            <SelectItem value="plugins">Plugins & Tools</SelectItem>
                            <SelectItem value="models">3D Models</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-item-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ugc-item">UGC Item</SelectItem>
                            <SelectItem value="game-pass">Game Pass</SelectItem>
                            <SelectItem value="plugin">Plugin</SelectItem>
                            <SelectItem value="model">Model</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="robux">Robux</SelectItem>
                            <SelectItem value="usd">USD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          data-testid="input-price"
                        />
                      </FormControl>
                      <FormDescription>
                        Set a competitive price based on similar items.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags to help buyers find your item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    data-testid="input-tag"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    data-testid="button-add-tag"
                  >
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                          data-testid={`button-remove-tag-${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Images
                </CardTitle>
                <CardDescription>Upload up to 5 images (max 5MB each)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  data-testid="input-images"
                />
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border hover:border-primary/50 hover-elevate"
                  }`}
                >
                  {isUploading ? (
                    <div className="space-y-3">
                      <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                      <p className="text-sm text-muted-foreground">Uploading and compressing images...</p>
                    </div>
                  ) : uploadedImages.length >= 5 ? (
                    <div className="space-y-3">
                      <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium">Maximum images reached</p>
                      <p className="text-xs text-muted-foreground">Remove an image to upload more</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          Drop images here or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 5MB each
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2"
                        data-testid="button-upload-images"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  )}
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {uploadedImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-lg overflow-hidden border hover-elevate"
                        data-testid={`image-preview-${index}`}
                      >
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeImage(index)}
                            data-testid={`button-remove-image-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {index === 0 && (
                          <Badge className="absolute top-2 left-2 bg-primary">
                            Primary
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {uploadedImages.length} of 5 images uploaded. First image will be the primary thumbnail.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={createMutation.isPending}
                data-testid="button-create-listing"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Creating..." : "Create Listing"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setLocation("/marketplace")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <TosAcceptanceModal
        open={showTosModal}
        onOpenChange={(open) => {
          if (!open && user && !user.tosAcceptedAt && !tosJustAccepted) {
            toast({
              title: "Terms Required",
              description: "You must accept the Terms of Service to create marketplace listings.",
              variant: "destructive",
            });
            setLocation("/marketplace");
          }
          setShowTosModal(open);
        }}
        onAccepted={() => {
          setTosJustAccepted(true);
          toast({
            title: "Welcome to the Marketplace!",
            description: "You can now create listings and make purchases.",
          });
        }}
      />
    </div>
  );
}
