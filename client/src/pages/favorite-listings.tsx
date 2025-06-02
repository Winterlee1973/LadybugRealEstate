import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "@/components/property-card";
import type { Property } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

export default function FavoriteListings() {
  const { user, loading: authLoading } = useAuth(); // Get user and authLoading from AuthContext
  const [sortBy, setSortBy] = useState("newest");

  const { data: favoriteProperties = [], isLoading, error } = useQuery<Property[]>({
    queryKey: ['favoriteProperties', user?.id],
    queryFn: async () => {
      if (!user) {
        return []; // Return empty array if no user is logged in
      }
      const response = await fetch(`/api/favorites/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch favorite properties');
      }
      const favoriteIds = await response.json();
      
      // Fetch details for each favorited property
      const propertiesPromises = favoriteIds.map(async (fav: { property_id: string }) => { // Corrected to property_id
        const propResponse = await fetch(`/api/properties/${fav.property_id}`); // Corrected to property_id
        if (!propResponse.ok) {
          console.error(`Failed to fetch property ${fav.property_id}`); // Corrected to property_id
          return null;
        }
        return propResponse.json();
      });

      const properties = await Promise.all(propertiesPromises);
      return properties.filter(Boolean) as Property[]; // Filter out nulls
    },
    enabled: !!user && !authLoading, // Only run query if user is logged in and auth is not loading
  });

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

  if (!user) {
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

        {sortedProperties.length > 0 && (
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