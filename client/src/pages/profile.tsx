import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Heart, 
  Home, 
  DollarSign, 
  Star, 
  Calendar,
  Camera,
  Edit3,
  Activity,
  TrendingUp,
  Eye,
  MessageSquare
} from "lucide-react";
import type { Profile } from "@shared/schema";

export default function ProfilePage() {
  const { user, supabase, role, updateRole } = useAuth();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFirstName(user.user_metadata?.first_name || "");
      setLastName(user.user_metadata?.last_name || "");
      setPhoneNumber(user.user_metadata?.phone_number || "");
      setEmail(user.email || "");
      setProfileLoading(false);
    }
  }, [user]);


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
    setLoading(true);
    try {
      const { error } = await updateRole(newRole);

      if (error) {
        throw error;
      }

      toast({
        title: "Role updated",
        description: `Your role has been set to ${newRole}.`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  if (profileLoading || role === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ladybug mx-auto"></div>
          <p className="text-lg text-gray-600">Loading your amazing profile...</p>
        </div>
      </div>
    );
  }

  const fullName = `${firstName} ${lastName}`.trim() || "Anonymous User";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";

  // Mock stats - in a real app these would come from API
  const stats = [
    { label: "Messages Sent", value: "12", icon: MessageSquare, color: "text-green-600" },
    { label: "Profile Views", value: "156", icon: TrendingUp, color: "text-purple-600" }
  ];

  const recentActivities = [
    { action: "Favorited", item: "Beautiful 3BR Home in Downtown", time: "2 hours ago", icon: Heart },
    { action: "Viewed", item: "Luxury Condo with Ocean View", time: "5 hours ago", icon: Eye },
    { action: "Contacted", item: "Modern Townhouse Seller", time: "1 day ago", icon: MessageSquare },
    { action: "Updated", item: "Profile Information", time: "3 days ago", icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ladybug to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="relative inline-block">
              <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-2xl">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={fullName} />
                <AvatarFallback className="text-3xl font-bold bg-white text-ladybug">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <h1 className="mt-6 text-4xl font-bold text-white sm:text-5xl">
              {fullName}
            </h1>
            <p className="mt-2 text-xl text-white/90">{email}</p>
            <div className="mt-4 flex justify-center">
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 text-lg px-4 py-2"
              >
                {role === "buyer" ? "🏠 Buyer" : "🏪  Seller"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative mt-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 justify-center max-w-2xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <Icon className={`h-8 w-8 mx-auto mb-4 ${stat.color}`} />
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-ladybug" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>Your basic details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>First Name</span>
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Last Name</span>
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Address</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                      readOnly={true}
                      className="mt-2 bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone Number</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                      placeholder="(123) 456-7890"
                      className="mt-2"
                    />
                  </div>
                  <Button type="submit" className="ladybug-primary w-full" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Role & Preferences */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-ladybug" />
                  <span>Role & Preferences</span>
                </CardTitle>
                <CardDescription>Choose your role and customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">I am a:</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={handleRoleChange}
                    className="space-y-3"
                    disabled={loading}
                  >
                    <Label htmlFor="role-buyer" className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full block">
                      <RadioGroupItem value="buyer" id="role-buyer" />
                      <Home className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Buyer</div>
                        <div className="text-sm text-gray-500">Looking for properties to purchase</div>
                      </div>
                    </Label>
                    <Label htmlFor="role-seller" className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full block">
                      <RadioGroupItem value="seller" id="role-seller" />
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Seller</div>
                        <div className="text-sm text-gray-500">Selling properties</div>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
}