import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup components
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@shared/schema"; // Import Profile type

export default function ProfilePage() {
  const { user, supabase } = useAuth();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState<"buyer" | "seller">("buyer"); // State for user role
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.first_name || "");
      setLastName(user.user_metadata?.last_name || "");
      setPhoneNumber(user.user_metadata?.phone_number || "");
      setEmail(user.email || "");
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    setProfileLoading(true);
    try {
      const response = await fetch(`/api/profile/${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data: Profile = await response.json();
      setRole(data.role);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile.",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
      },
      email: email,
    });

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been saved.",
      });
    }
    setLoading(false);
  };

  const handleRoleChange = async (newRole: "buyer" | "seller") => {
    const originalRole = role; // Store the current role
    setLoading(true);
    try {
      const response = await fetch(`/api/profile/${user?.id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      setRole(newRole);
      toast({
        title: "Role updated",
        description: `Your role has been set to ${newRole}.`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      setRole(originalRole); // Revert to original role on error
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

 // Function to format phone number as (XXX) XXX-XXXX
 const formatPhoneNumber = (value: string) => {
   // Remove all non-digit characters
   const digits = value.replace(/\D/g, '');

   // Apply formatting based on the number of digits
   if (digits.length <= 3) {
     return digits;
   } else if (digits.length <= 6) {
     return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
   } else if (digits.length <= 10) {
     return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
   } else {
     // Truncate to 10 digits and format
     return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
   }
 };

 if (profileLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
          <CardDescription>Manage your personal information and role.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                disabled={true}
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="(123) 456-7890"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Select Your Role</Label>
              <RadioGroup
                value={role}
                onValueChange={handleRoleChange}
                className="flex space-x-4"
                disabled={loading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buyer" id="role-buyer" />
                  <Label htmlFor="role-buyer">Buyer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="seller" id="role-seller" />
                  <Label htmlFor="role-seller">Seller</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="ladybug-primary w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}