import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ChevronLeft, 
  Share2, 
  Heart, 
  Bed, 
  Bath, 
  Square, 
  Phone, 
  Calendar,
  MessageSquare,
  ChevronRight,
  Play,
  Box,
  Video,
  Star,
  Check
} from "lucide-react";
import AIChat from "@/components/ai-chat";
import type { Property } from "@shared/schema";
import type { ContactFormData } from "@/lib/types";

export default function PropertyDetail() {
  const [, params] = useRoute("/property/:propertyId");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    inquiryType: "general"
  });

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${params?.propertyId}`],
    enabled: !!params?.propertyId,
  });

  const { data: favorites, refetch: refetchFavorites } = useQuery<any[]>({
    queryKey: ["favoriteProperties", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/favorites/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch favorites");
      return response.json();
    },
    enabled: !!user?.id, // Only run if user is logged in
  });

  useEffect(() => {
    console.log("useEffect triggered. Favorites:", favorites, "Property ID:", params?.propertyId);
    if (favorites && params?.propertyId) {
      const isCurrentlyFavorited = favorites.some((fav: any) => fav.property_id === params.propertyId);
      setIsFavorited(isCurrentlyFavorited);
      console.log("Is Favorited set to:", isCurrentlyFavorited);
    } else {
      setIsFavorited(false); // Ensure it's false if no favorites or propertyId
    }
  }, [favorites, params?.propertyId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to favorite properties.",
        variant: "destructive",
      });
      return;
    }

    if (!params?.propertyId) {
      toast({
        title: "Error",
        description: "Property ID not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${params.propertyId}/${user.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIsFavorited(false);
          toast({
            title: "Removed from favorites",
            description: "This property has been removed from your favorites.",
          });
          refetchFavorites(); // Re-fetch favorites after removal
          queryClient.invalidateQueries({
            queryKey: ["favoriteProperties", user.id],
          });
        } else {
          console.error("Failed to remove favorite:", await response.text());
          toast({
            title: "Error",
            description: "Failed to remove from favorites. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Add to favorites
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ propertyId: params.propertyId, userId: user.id }),
        });
        if (response.ok) {
          setIsFavorited(true);
          toast({
            title: "Added to favorites",
            description: "This property has been added to your favorites.",
          });
          refetchFavorites(); // Re-fetch favorites after addition
          queryClient.invalidateQueries({
            queryKey: ["favoriteProperties", user.id],
          });
        } else {
          console.error("Failed to add favorite:", await response.text());
          toast({
            title: "Error",
            description: "Failed to add to favorites. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };


  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contactForm,
          propertyId: params?.propertyId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send inquiry");

      toast({
        title: "Inquiry sent!",
        description: "The agent will get back to you soon.",
      });

      setIsContactDialogOpen(false);
      setContactForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        inquiryType: "general"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-96 w-full rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="py-6 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12">
            <CardContent>
              <h1 className="text-2xl font-bold text-dark-gray mb-2">Property Not Found</h1>
              <p className="text-medium-gray mb-4">
                The property you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/properties">
                <Button className="ladybug-primary">Browse Properties</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <section className="py-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button & Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/properties">
            <Button variant="ghost" className="text-medium-gray hover:text-dark-gray">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
-------
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative">
                <img
                  src={property.images[selectedImageIndex]}
                  alt={property.title ?? "Property Image"}
                  className="w-full h-96 object-cover rounded-xl"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-white rounded-full"
                  onClick={toggleFavorite}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isFavorited ? "fill-red-heart text-red-heart" : "text-gray-600"
                    }`}
                  />
                </Button>

                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 text-dark-gray px-3 py-1 rounded-full text-sm font-medium">
                  {selectedImageIndex + 1} / {property.images.length}
                </div>

                {property.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {property.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {property.images.slice(0, 5).map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Property view ${index + 1}`}
                      className={`w-full h-20 object-cover rounded-lg cursor-pointer transition-opacity ${
                        selectedImageIndex === index ? "opacity-100 ring-2 ring-ladybug" : "opacity-80 hover:opacity-100"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-dark-gray">
                  {formatPrice(property.price)}
                </h1>
                <Badge className="bg-green-100 text-green-800">For Sale</Badge>
              </div>

              <p className="text-lg text-medium-gray mb-4">
                {property.address}, {property.city}, {property.state} {property.zipCode}
              </p>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 text-ladybug mr-2" />
                  <span className="font-medium text-dark-gray">{property.bedrooms} Beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 text-ladybug mr-2" />
                  <span className="font-medium text-dark-gray">{property.bathrooms} Baths</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-5 w-5 text-ladybug mr-2" />
                  <span className="font-medium text-dark-gray">{property.squareFootage.toLocaleString()} sqft</span>
                </div>
              </div>

              <p className="text-medium-gray leading-relaxed mb-6">
                {property.description}
              </p>

              {/* Key Features */}
              <Card className="bg-red-50 border border-red-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-dark-gray mb-4">Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {property.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <Check className="h-4 w-4 text-ladybug mr-2" />
                        <span className="text-medium-gray">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Local Information */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-dark-gray mb-6">Local Information</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-dark-gray mb-2">Schools</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-medium-gray">Lincoln Elementary</span>
                        <span className="text-dark-gray font-medium">9/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-medium-gray">Jefferson Middle</span>
                        <span className="text-dark-gray font-medium">8/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-medium-gray">Washington High</span>
                        <span className="text-dark-gray font-medium">9/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-dark-gray mb-2">Transit</h4>
                    <div className="space-y-2 text-sm text-medium-gray">
                      <div>Bus Stop - 0.2 miles</div>
                      <div>Metro Station - 1.5 miles</div>
                      <div>Airport - 15 miles</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-dark-gray mb-2">Amenities</h4>
                    <div className="space-y-2 text-sm text-medium-gray">
                      <div>Park - 0.3 miles</div>
                      <div>Shopping Center - 0.8 miles</div>
                      <div>Hospital - 2.1 miles</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-3">
                      <img
                        src={property.agentPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                        alt={property.agentName ?? "Agent Photo"}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-dark-gray">{property.agentName}</h3>
                    <p className="text-sm text-medium-gray">Listing Agent</p>
                    <div className="flex items-center justify-center mt-2">
                      <div className="flex text-yellow-400 text-sm mr-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < Math.floor(parseFloat(property.agentRating || "0")) ? "fill-current" : ""}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-medium-gray">
                        {property.agentRating} ({property.agentReviews} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full ladybug-primary">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Connect with Seller
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Contact Agent</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={contactForm.name}
                              onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={contactForm.email}
                              onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone (optional)</Label>
                            <Input
                              id="phone"
                              value={contactForm.phone}
                              onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                              id="message"
                              value={contactForm.message}
                              onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                              placeholder="I'm interested in this property..."
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full ladybug-primary">
                            Send Inquiry
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <AIChat propertyId={property.propertyId} />

                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Call {property.agentPhone}
                    </Button>

                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Tour
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Property Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-dark-gray mb-4">Property Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-medium-gray">Property ID</span>
                      <span className="text-dark-gray font-medium">
                        {property.searchableId ? `LB${property.searchableId}` : property.propertyId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-medium-gray">Property Type</span>
                      <span className="text-dark-gray font-medium">{property.propertyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-medium-gray">Year Built</span>
                      <span className="text-dark-gray font-medium">{property.yearBuilt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-medium-gray">Lot Size</span>
                      <span className="text-dark-gray font-medium">{property.lotSize}</span>
                    </div>
                    {property.hoaFees && (
                      <div className="flex justify-between">
                        <span className="text-medium-gray">HOA Fees</span>
                        <span className="text-dark-gray font-medium">${property.hoaFees}/month</span>
                      </div>
                    )}
                    {property.propertyTax && (
                      <div className="flex justify-between">
                        <span className="text-medium-gray">Property Tax</span>
                        <span className="text-dark-gray font-medium">${property.propertyTax}/year</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Virtual Tour */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-dark-gray mb-4">Virtual Experience</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Virtual Tour
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Box className="h-4 w-4 mr-2" />
                      3D Walkthrough
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Video className="h-4 w-4 mr-2" />
                      Video Tour
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
