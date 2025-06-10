import React, { useEffect, useState } from 'react';
import { Property } from '../../../shared/schema'; // Assuming Property type is defined here
import PropertyCard from '../components/property-card'; // Reusing existing component

const SecretPropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from('properties')
          .select('*');

        if (error) {
          throw error;
        }

        // Transform the data to match the expected Property format
        const transformedProperties = data?.map(prop => ({
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

        setProperties(transformedProperties);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return <div>Loading properties...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Secret Properties Page</h1>
      <p className="mb-4">This page displays all properties directly from the database, bypassing authentication.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {properties.length > 0 ? (
          properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        ) : (
          <p>No properties found.</p>
        )}
      </div>
    </div>
  );
};

export default SecretPropertiesPage;