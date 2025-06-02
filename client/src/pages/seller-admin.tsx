import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Property } from '@shared/schema'; // Import Property type

export default function SellerAdminPage() {
  const { user, role, supabase } = useAuth(); // Get supabase client from useAuth
  const { toast } = useToast();

  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingListings, setExistingListings] = useState<Property[]>([]);
  const [fetchingListings, setFetchingListings] = useState(true);


  // Fetch existing listings for the logged-in seller
  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        setFetchingListings(false);
        return;
      }
      setFetchingListings(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('seller_id', user.id);

      if (error) {
        console.error("Error fetching listings:", error);
        toast({
          title: "Error fetching listings",
          description: error.message,
          variant: "destructive",
        });
        setExistingListings([]);
      } else {
        setExistingListings(data || []);
      }
      setFetchingListings(false);
    };

    fetchListings();
  }, [user, supabase, toast]); // Re-run when user or supabase client changes

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Please log in to access the seller admin page.</p>
      </div>
    );
  }

  // Check if the user's role is 'seller'
  if (role !== "seller") {
     return (
       <div className="container mx-auto py-8 text-center">
         <p>You do not have permission to access this page.</p>
       </div>
     );
  }

  // Fetch existing listings for the logged-in seller
  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        setFetchingListings(false);
        return;
      }
      setFetchingListings(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id); // Corrected column name to user_id

      if (error) {
        console.error("Error fetching listings:", error);
        toast({
          title: "Error fetching listings",
          description: error.message,
          variant: "destructive",
        });
        setExistingListings([]);
      } else {
        setExistingListings(data || []);
      }
      setFetchingListings(false);
    };

    fetchListings();
  }, [user, supabase, toast]); // Re-run when user or supabase client changes





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast({
        title: "Error",
        description: "User not logged in.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Insert property data into Supabase table
    const propertyData = {
      user_id: user.id, // Corrected column name to user_id
      address: address,
      description: description,
      price: parseFloat(price), // Convert price to number
      bedrooms: parseInt(bedrooms, 10), // Convert bedrooms to integer
      bathrooms: parseInt(bathrooms, 10), // Convert bathrooms to integer
      squareFootage: parseInt(squareFootage, 10), // Convert square footage to integer
      images: [], // No photos will be uploaded
      // Add other relevant fields as needed (e.g., city, state, zip, status)
    };

    const { data, error } = await supabase
      .from('properties') // Assuming your table is named 'properties'
      .insert([propertyData]);

    if (error) {
      console.error("Error inserting property:", error);
      toast({
        title: "Error creating listing",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Property Listing Created",
        description: "Your property has been listed successfully!",
      });
      // Optionally clear the form after successful submission
      setAddress("");
      setDescription("");
      setPrice("");
      setBedrooms("");
      setBathrooms("");
      setSquareFootage("");
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Create New Listing Form */}
      <Card className="max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Property Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your property..."
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="500000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="3"
                  required
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="2"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="squareFootage">Square Footage (sq ft)</Label>
              <Input
                id="squareFootage"
                type="number"
                value={squareFootage}
                onChange={(e) => setSquareFootage(e.target.value)}
                placeholder="1500"
                required
              />
            </div>
            <Button type="submit" className="ladybug-primary w-full" disabled={loading}>
              {loading ? "Submitting..." : "Create Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Listings Section */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Your Existing Listings</h2>
        {fetchingListings ? (
          <p>Loading listings...</p>
        ) : existingListings.length === 0 ? (
          <p>You have no active listings.</p>
        ) : (
          <div className="space-y-6">
            {existingListings.map(listing => (
              <Card key={listing.id}>
                <CardHeader>
                  <CardTitle>{listing.address}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
                  <p className="text-lg font-semibold mb-4">${listing.price.toLocaleString()}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Bedrooms:</Label>
                      <p>{listing.bedrooms}</p>
                    </div>
                    <div>
                      <Label>Bathrooms:</Label>
                      <p>{listing.bathrooms}</p>
                    </div>
                    <div>
                      <Label>Square Footage:</Label>
                      <p>{listing.squareFootage} sq ft</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}