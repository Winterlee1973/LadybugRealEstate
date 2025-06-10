import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "@/components/property-card";
import { supabase } from "@/lib/supabase";
import type { Property } from "@shared/schema";
import type { SearchFilters } from "@/lib/types";

export default function PropertyListings() {
  const [location, setLocation] = useLocation(); // Add setLocation
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState("newest");

  // State for the input field, synchronized with URL 'q' parameter
  const [searchQuery, setSearchQuery] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q') || "";
  });


  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['properties', filters, location], // Use location directly in queryKey
    queryFn: async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('q'); // Get 'q' from window.location.search

      let query = supabase.from('properties').select('*');

      // Apply search filters
      if (q) {
        // Check if 'q' is a 5-digit zip code
        if (/^\d{5}$/.test(q)) {
          query = query.eq('zip_code', q);
        } else {
          // Search in title, description, address, or city
          query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%,city.ilike.%${q}%`);
        }
      }

      // Apply price filters
      if (filters.priceMin) {
        const priceMin = parseInt(filters.priceMin.toString().replace(/[,$]/g, ''));
        query = query.gte('price', priceMin.toString());
      }
      if (filters.priceMax) {
        const priceMax = parseInt(filters.priceMax.toString().replace(/[,$]/g, ''));
        query = query.lte('price', priceMax.toString());
      }

      // Apply other filters
      if (filters.bedrooms) query = query.eq('bedrooms', filters.bedrooms);
      if (filters.bathrooms) query = query.eq('bathrooms', filters.bathrooms);
      if (filters.city) query = query.ilike('city', `%${filters.city}%`);
      if (filters.propertyType) query = query.eq('property_type', filters.propertyType);

      const { data, error } = await query;
      
      if (error) throw new Error(`Failed to fetch properties: ${error.message}`);
      return data || [];
    },
    enabled: true, // Always enable the query - let the backend handle empty results
  });

  // No need for client-side filtering if backend handles search
  const filteredProperties = properties;

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
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

  const handleSearch = () => {
    // Update the URL's 'q' parameter directly
    const currentUrlParams = new URLSearchParams(location.split('?')[1] || '');
    if (searchQuery) {
      currentUrlParams.set('q', searchQuery);
    } else {
      currentUrlParams.delete('q');
    }
    setLocation(`/properties?${currentUrlParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "any" ? undefined : value
    }));
  };

  return (
    <section className="py-8 bg-light-gray min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-dark-gray mb-2">Available Properties</h1>
              <p className="text-medium-gray">
                {isLoading ? "Loading..." : `${sortedProperties.length} properties found`}
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Sort by: Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="bedrooms">Bedrooms</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="border-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Quick Search */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <Input
                  type="text"
                  placeholder="Enter Property ID or Zip Code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-w-64"
                />
                
                <Select onValueChange={(value) => updateFilter('priceMax', value === 'any' ? undefined : parseInt(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Price</SelectItem>
                    <SelectItem value="500000">Under $500k</SelectItem>
                    <SelectItem value="750000">$500k - $750k</SelectItem>
                    <SelectItem value="1000000">$750k - $1M</SelectItem>
                    <SelectItem value="999999999">Over $1M</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => updateFilter('bedrooms', value === 'any' ? undefined : parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Any Beds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Beds</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={handleSearch} className="ladybug-primary">
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Grid */}
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
              <h3 className="text-xl font-semibold text-dark-gray mb-2">No properties found</h3>
              <p className="text-medium-gray">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {sortedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {sortedProperties.length > 10 && (
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
