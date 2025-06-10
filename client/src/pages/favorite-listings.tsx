import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Import useQueryClient
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "@/components/property-card";
import type { Property, Favorite } from "@shared/schema"; // Import Favorite type
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FavoriteListings() {
  const { user, loading: authLoading } = useAuth(); // Get user and authLoading from AuthContext
  const [sortBy, setSortBy] = useState("newest");
  const queryClient = useQueryClient(); // Initialize useQueryClient

  const { data: favoriteProperties = [], isLoading, error, refetch } = useQuery<Property[]>({ // Add refetch
    queryKey: ['favorites', user?.id], // Changed queryKey to 'favorites'
    queryFn: async () => {
      if (!user) {
        return []; // Return empty array if no user is logged in
      }
      
      const { supabase } = await import("@/lib/supabase");
      
      // First get the favorite property IDs
      const { data: favoriteData, error: favError } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (favError) {
        throw favError;
      }

      if (!favoriteData || favoriteData.length === 0) {
        return [];
      }

      // Get the property IDs
      const propertyIds = favoriteData.map(fav => fav.property_id);

      // Fetch the properties
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .in('property_id', propertyIds);

      if (propError) {
        throw propError;
      }

      // Transform the data to match the expected Property format
      const transformedProperties = properties?.map(prop => ({
        id: prop.id,
        propertyId: prop.property_id,
        searchableId: prop.searchable_id,
        title: prop.title,
        description: prop.description,
        price: prop.price,
        address: prop.address,
        city: prop.city,
        state: prop.state,
        zipCode: prop.zip_code,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        squareFootage: prop.square_footage,
        lotSize: prop.lot_size,
        yearBuilt: prop.year_built,
        propertyType: prop.property_type,
        status: prop.status,
        images: prop.images,
        features: prop.features,
        hoaFees: prop.hoa_fees,
        propertyTax: prop.property_tax,
        agentName: prop.agent_name,
        agentPhone: prop.agent_phone,
        agentEmail: prop.agent_email,
        agentPhoto: prop.agent_photo,
        agentRating: prop.agent_rating,
        agentReviews: prop.agent_reviews,
        createdAt: prop.created_at,
        userId: prop.user_id
      })) || [];

      console.log('Favorite properties fetched:', transformedProperties);
      return transformedProperties;
    },
    enabled: !!user && !authLoading, // Only run query if user is logged in and auth is not loading
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  useEffect(() => {
   if (user && !authLoading) {
     refetch(); // Refetch when user is available and auth is not loading
   }
 }, [user, authLoading, refetch]);

  // Sort properties (reusing logic from PropertyListings)
  const sortedProperties = [...favoriteProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'bedrooms':
        return b.bedrooms - a.bedrooms;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (authLoading) {
    return (
      <section className="py-8 bg-light-gray min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-dark-gray mb-2">Your Favorite Properties</h1>
          <p className="text-medium-gray">Loading user session...</p>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <div className="flex space-x-4 mb-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!authLoading && !user) {
    return (
      <section className="py-8 bg-light-gray min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold text-dark-gray mb-2">Please log in to view your favorite properties.</h3>
              <p className="text-medium-gray">Sign in or create an account to save your favorite homes.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-light-gray min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-2">Your Favorite Properties</h1>
            <p className="text-medium-gray">
              {isLoading ? "Loading..." : `${sortedProperties.length} properties found`}
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Select onValueChange={setSortBy} defaultValue={sortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="bedrooms">Bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-white">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <div className="flex space-x-4 mb-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedProperties.length === 0 ? (
          <Card className="bg-white text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold text-dark-gray mb-2">No favorite properties found</h3>
              <p className="text-medium-gray">Start favoriting properties to see them here!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {sortedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {sortedProperties.length >= 10 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button className="ladybug-primary">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}