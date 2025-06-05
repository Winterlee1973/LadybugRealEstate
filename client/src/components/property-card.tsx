import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Bed, Bath, Square } from "lucide-react";
import type { Property, Favorite } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { useQueryClient, useQuery } from "@tanstack/react-query"; // Import useQuery

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { user } = useAuth(); // Get user from AuthContext
  const queryClient = useQueryClient(); // Initialize useQueryClient

  // Use useQuery to fetch favorites
  const { data: favorites = [] } = useQuery<Favorite[]>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/favorites/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return response.json();
    },
    enabled: !!user, // Only run query if user is logged in
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  const isFavorited = favorites.some((fav) => fav.propertyId === property.propertyId);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please log in to favorite properties.");
      return;
    }

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${property.propertyId}/${user.id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ['favorites', user.id] }); // Invalidate favorites query
        } else {
          console.error("Failed to remove favorite:", await response.text());
        }
      } else {
        // Add to favorites
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ propertyId: property.propertyId, userId: user.id }),
        });
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ['favorites', user.id] }); // Invalidate favorites query
        } else {
          console.error("Failed to add favorite:", await response.text());
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const formatPrice = (price: string | number | undefined) => {
    if (price === undefined || price === null) {
      return "$0"; // Default to $0 or a placeholder if price is undefined/null
    }
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) {
      return "$0"; // Handle cases where parseFloat results in NaN
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  const mainImage = property.images?.[0] || "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";

  return (
    <Link href={`/property/${property.propertyId}`}>
      <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full"
            onClick={toggleFavorite}
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorited ? "fill-red-heart text-red-heart" : "text-gray-600"
              }`}
            />
          </Button>
          <Badge className="absolute bottom-3 left-3 bg-green-500 text-white">
            For Sale
          </Badge>
        </div>

        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-dark-gray">
              {formatPrice(property.price)}
            </h3>
            <Badge variant="secondary" className="text-xs bg-gray-100">
              <span className="text-ladybug">LB</span>{property.searchableId || 'N/A'}
            </Badge>
          </div>

          <p className="text-medium-gray mb-3">
            {[property.address, property.city, property.state, property.zipCode]
              .filter(Boolean)
              .join(', ') || 'N/A'}
          </p>

          <div className="flex items-center space-x-4 text-sm text-medium-gray mb-3">
            <span className="flex items-center">
              <Bed className="h-4 w-4 text-ladybug mr-1" />
              {property.bedrooms ?? 'N/A'} Beds
            </span>
            <span className="flex items-center">
              <Bath className="h-4 w-4 text-ladybug mr-1" />
              {property.bathrooms ?? 'N/A'} Baths
            </span>
            <span className="flex items-center">
              <Square className="h-4 w-4 text-ladybug mr-1" />
              {(property.squareFootage ?? 0).toLocaleString()} sqft
            </span>
          </div>

          <p className="text-sm text-medium-gray line-clamp-2">
            {property.description || 'No description available.'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
