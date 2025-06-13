import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react"; // Import useState
import { Heart, Bed, Bath, Square } from "lucide-react";
import type { Property, Favorite } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { useQueryClient, useQuery } from "@tanstack/react-query"; // Import useQuery
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

interface PropertyCardProps {
  property: Property;
  isFavoritedProp?: boolean; // Add optional prop for favorite status
}

export default function PropertyCard({ property, isFavoritedProp }: PropertyCardProps) {
  const { user } = useAuth(); // Get user from AuthContext
  const queryClient = useQueryClient(); // Initialize useQueryClient
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false); // State for AlertDialog

  // Use useQuery to fetch favorites
  const { data: favorites = [] } = useQuery<string[]>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data?.map(fav => fav.property_id) || [];
    },
    enabled: !!user && isFavoritedProp === undefined, // Only run query if user is logged in and prop is not provided
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  const isFavorited = isFavoritedProp !== undefined ? isFavoritedProp : favorites.includes(property.propertyId);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Please log in to favorite properties.");
      return;
    }

    try {
      const { supabase } = await import("@/lib/supabase");
      
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('property_id', property.propertyId)
          .eq('user_id', user.id);

        if (!error) {
          queryClient.invalidateQueries({ queryKey: ['favorites', user.id] }); // Invalidate favorites query
          queryClient.invalidateQueries({ queryKey: ['favoriteProperties', user.id] }); // Invalidate favorite properties query
        } else {
          console.error("Failed to remove favorite:", error);
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ property_id: property.propertyId, user_id: user.id });

        if (!error) {
          queryClient.invalidateQueries({ queryKey: ['favorites', user.id] }); // Invalidate favorites query
          queryClient.invalidateQueries({ queryKey: ['favoriteProperties', user.id] }); // Invalidate favorite properties query
        } else {
          console.error("Failed to add favorite:", error);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsAlertDialogOpen(false); // Close dialog after action
    }
  };

  const toggleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) {
      setIsAlertDialogOpen(true); // Open dialog if already favorited
    } else {
      handleToggleFavorite(); // Directly toggle if not favorited
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
    <Card className="bg-white hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link href={`/property/${property.propertyId}`}>
          <img
            src={mainImage}
            alt={property.title || "Property image"}
            className="w-full h-48 object-cover rounded-t-lg cursor-pointer"
          />
        </Link>
        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full"
              onClick={toggleFavoriteClick}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorited ? "fill-red-heart text-red-heart" : "text-gray-600"
                }`}
              />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to Un-Favorite this property?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will remove this property from your favorites list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleFavorite}>Un-Favorite</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Badge className="absolute bottom-3 left-3 bg-green-500 text-white">
          For Sale
        </Badge>
      </div>

      <CardContent className="p-4">
        <Link href={`/property/${property.propertyId}`}>
          <div className="cursor-pointer">
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
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
