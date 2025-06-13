import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Property } from '@shared/schema'; // Import Property type

export default function SellerAdminPage() {
  const { user, role, supabase } = useAuth(); // Get supabase client from useAuth
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [features, setFeatures] = useState("");
  const [hoaFees, setHoaFees] = useState("");
  const [propertyTax, setPropertyTax] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingListings, setExistingListings] = useState<Property[]>([]);
  const [fetchingListings, setFetchingListings] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);



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
      
      // Use direct Supabase query (required for Netlify compatibility)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('userId', user.id);

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
  }, [user, supabase, toast]);





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

    // Generate unique property ID
    const propertyId = `PROP_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const searchableId = `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}-${propertyId.toLowerCase()}`;

    // Upload images if any
    const imageUrls: string[] = [];
    if (images.length > 0) {
      for (const image of images) {
        const fileName = `${Date.now()}_${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, image);
        
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Error uploading images",
            description: uploadError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);
        
        imageUrls.push(publicUrl);
      }
    }

    // Parse features from comma-separated string
    const featuresArray = features.split(',').map(f => f.trim()).filter(f => f.length > 0);

    // Insert property data directly into Supabase (required for Netlify compatibility)
    const propertyData = {
      propertyId,
      searchableId,
      title,
      address,
      city,
      state,
      zipCode,
      description,
      price: isNaN(parseFloat(price)) ? 0 : parseFloat(price),
      bedrooms: isNaN(parseInt(bedrooms, 10)) ? 0 : parseInt(bedrooms, 10),
      bathrooms: isNaN(parseFloat(bathrooms)) ? 0 : parseFloat(bathrooms),
      squareFootage: isNaN(parseInt(squareFootage, 10)) ? 0 : parseInt(squareFootage, 10),
      propertyType,
      lotSize: lotSize || null,
      yearBuilt: yearBuilt ? (isNaN(parseInt(yearBuilt, 10)) ? 0 : parseInt(yearBuilt, 10)) : null,
      features: featuresArray,
      hoaFees: hoaFees ? (isNaN(parseFloat(hoaFees)) ? 0 : parseFloat(hoaFees)) : null,
      propertyTax: propertyTax ? (isNaN(parseFloat(propertyTax)) ? 0 : parseFloat(propertyTax)) : null,
      images: imageUrls,
      userId: user.id,
    };

    const { data, error } = await supabase
      .from('properties')
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
      
      // Clear the form after successful submission
      setTitle("");
      setAddress("");
      setCity("");
      setState("");
      setZipCode("");
      setDescription("");
      setPrice("");
      setBedrooms("");
      setBathrooms("");
      setSquareFootage("");
      setPropertyType("");
      setLotSize("");
      setYearBuilt("");
      setFeatures("");
      setHoaFees("");
      setPropertyTax("");
      setImages([]);
      // Reset file input using ref instead of DOM manipulation
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh listings
      const { data: refreshData, error: refreshError } = await supabase
        .from('properties')
        .select('*')
        .eq('userId', user.id);
      if (!refreshError) {
        setExistingListings(refreshData || []);
      }
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
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Beautiful Family Home"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="CA"
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="94102"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select value={propertyType} onValueChange={setPropertyType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-family">Single Family Home</SelectItem>
                  <SelectItem value="condo">Condominium</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="duplex">Duplex</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
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
                <Label htmlFor="price">Price ($) *</Label>
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
                <Label htmlFor="bedrooms">Bedrooms *</Label>
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
                <Label htmlFor="bathrooms">Bathrooms *</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  step="0.5"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="2.5"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="squareFootage">Square Footage (sq ft) *</Label>
                <Input
                  id="squareFootage"
                  type="number"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(e.target.value)}
                  placeholder="1500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                  placeholder="2000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lotSize">Lot Size</Label>
                <Input
                  id="lotSize"
                  type="text"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  placeholder="0.25 acres"
                />
              </div>
              <div>
                <Label htmlFor="hoaFees">HOA Fees ($/month)</Label>
                <Input
                  id="hoaFees"
                  type="number"
                  value={hoaFees}
                  onChange={(e) => setHoaFees(e.target.value)}
                  placeholder="150"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="propertyTax">Annual Property Tax ($)</Label>
              <Input
                id="propertyTax"
                type="number"
                value={propertyTax}
                onChange={(e) => setPropertyTax(e.target.value)}
                placeholder="8500"
              />
            </div>
            
            <div>
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Textarea
                id="features"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Hardwood floors, Updated kitchen, Swimming pool, Garage"
              />
            </div>
            
            <div>
              <Label htmlFor="images">Property Images</Label>
              <Input
                ref={fileInputRef}
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setImages(files);
                }}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {images.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {images.length} file(s) selected: {images.map(f => f.name).join(', ')}
                </p>
              )}
            </div>
            <Button type="submit" className="ladybug-primary w-full" disabled={loading}>
              {loading ? "Creating Listing..." : "Create Listing"}
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