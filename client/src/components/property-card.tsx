import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Bed, Bath, Square } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    // TODO: Implement favorite API call
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
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
                isFavorited ? "fill-ladybug text-ladybug" : "text-gray-600"
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
              <span className="text-ladybug">LB</span>{property.searchableId}
            </Badge>
          </div>

          <p className="text-medium-gray mb-3">
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </p>

          <div className="flex items-center space-x-4 text-sm text-medium-gray mb-3">
            <span className="flex items-center">
              <Bed className="h-4 w-4 text-ladybug mr-1" />
              {property.bedrooms} Beds
            </span>
            <span className="flex items-center">
              <Bath className="h-4 w-4 text-ladybug mr-1" />
              {property.bathrooms} Baths
            </span>
            <span className="flex items-center">
              <Square className="h-4 w-4 text-ladybug mr-1" />
              {property.squareFootage.toLocaleString()} sqft
            </span>
          </div>

          <p className="text-sm text-medium-gray line-clamp-2">
            {property.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
