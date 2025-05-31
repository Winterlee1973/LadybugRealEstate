import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique filenames
import { Property } from '@shared/schema'; // Import Property type

interface PhotoPreview {
  file: File;
  url: string;
}

export default function SellerAdminPage() {
  const { user, role, supabase } = useAuth(); // Get supabase client from useAuth
  const { toast } = useToast();

  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [squareFootage, setSquareFootage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingListings, setExistingListings] = useState<Property[]>([]);
  const [fetchingListings, setFetchingListings] = useState(true);

  // Clean up preview URLs when component unmounts or photos change
  useEffect(() => {
    return () => {
      photoPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [photoPreviews]);

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
        .eq('userId', user.id); // Corrected column name to userId

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


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const selectedFiles = Array.from(files);
      setPhotos(selectedFiles);

      // Generate previews
      const previews = selectedFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
      }));

      // Clean up previous previews before setting new ones
      photoPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
      setPhotoPreviews(previews);
    } else {
      setPhotos([]);
      photoPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
      setPhotoPreviews([]);
    }
  };

  const handleRemovePreview = (indexToRemove: number) => {
    // Revoke the object URL for the photo being removed
    URL.revokeObjectURL(photoPreviews[indexToRemove].url);

    // Update photos and photoPreviews states
    setPhotos(prevPhotos => prevPhotos.filter((_, index) => index !== indexToRemove));
    setPhotoPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveImage = async (listingId: number, imageUrl: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not logged in.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Extract file path from the image URL
      const urlParts = imageUrl.split('/public/property-photos/');
      if (urlParts.length < 2) {
        throw new Error("Invalid image URL format");
      }
      const filePath = urlParts[1];

      // Delete photo from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('property-photos')
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      // Update the property record in the database
      const updatedImages = existingListings
        .find(listing => listing.id === listingId)
        ?.images.filter(url => url !== imageUrl) || [];

      const { error: updateError } = await supabase
        .from('properties')
        .update({ images: updatedImages })
        .eq('id', listingId);

      if (updateError) {
        throw updateError;
      }

      // Update state to reflect the removed image
      setExistingListings(prevListings =>
        prevListings.map(listing =>
          listing.id === listingId ? { ...listing, images: updatedImages } : listing
        )
      );

      toast({
        title: "Image Removed",
        description: "The image has been successfully removed.",
      });

    } catch (error: any) {
      console.error("Error removing image:", error);
      toast({
        title: "Error removing image",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


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

    const photoUrls: string[] = [];

    // Upload photos to Supabase Storage
    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // Store photos under user's ID

      const { data, error } = await supabase.storage
        .from('property-photos') // Assuming a bucket named 'property-photos'
        .upload(filePath, photo);

      if (error) {
        console.error("Error uploading photo:", error);
        toast({
          title: "Error uploading photos",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return; // Stop submission if any photo upload fails
      }

      // Get the public URL of the uploaded photo
      const { data: publicUrlData } = supabase.storage
        .from('property-photos')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        photoUrls.push(publicUrlData.publicUrl);
      }
    }

    // Insert property data into Supabase table
    const propertyData = {
      userId: user.id, // Corrected column name to userId
      address: address,
      description: description,
      price: parseFloat(price), // Convert price to number
      bedrooms: parseInt(bedrooms, 10), // Convert bedrooms to integer
      bathrooms: parseInt(bathrooms, 10), // Convert bathrooms to integer
      squareFootage: parseInt(squareFootage, 10), // Convert square footage to integer
      images: photoUrls, // Store array of photo URLs, corrected column name to images
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
      setPhotos([]);
      setPhotoPreviews([]);
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
            <div>
              <Label htmlFor="photos">Property Photos</Label>
              <Input
                id="photos"
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*"
                required
              />
              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative w-full h-32 overflow-hidden rounded-md group">
                      <img
                        src={preview.url}
                        alt={`Property Photo ${index + 1}`}
                        className="block w-full h-full object-cover"
                      />
                      <button
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePreview(index)}
                        aria-label="Remove image"
                      >
                        {/* X icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" className="ladybug-primary w-full" disabled={loading || photos.length === 0}>
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
                  {listing.images && listing.images.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Photos</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {listing.images.map((url: string, index: number) => (
                          <div key={index} className="relative w-full h-32 overflow-hidden rounded-md group">
                            <img
                              src={url}
                              alt={`Property Photo ${index + 1}`}
                              className="block w-full h-full object-cover"
                            />
                            <button
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(listing.id, url)}
                              aria-label="Remove image"
                            >
                              {/* Add an X icon or similar */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}