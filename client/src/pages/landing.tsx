import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Hash, MessageCircle, Home, Bot, ArrowUp } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // If it looks like a property ID, go directly to property detail
      if (searchQuery.match(/^[A-Z]{2,}\d+$/i)) {
        setLocation(`/property/${searchQuery.trim().toUpperCase()}`);
      } else {
        // Otherwise go to listings with search
        setLocation(`/properties?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    } else {
      setLocation("/properties");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const features = [
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description: "Chat instantly with sellers.",
    },
    {
      icon: Home,
      title: "Virtual House Tours",
      description: "Immersive 3D property walkthroughs.",
    },
    {
      icon: Bot,
      title: "AI-Powered Q&A",
      description: "Get smart answers about properties.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-light-gray to-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-gray mb-6">
            Connect with Sellers
          </h1>
          <p className="text-xl text-medium-gray mb-12 max-w-2xl mx-auto">
            Enter a Property ID to find the seller and unlock powerful connection tools.
          </p>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto mb-16">
            <div className="flex bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex items-center px-4 text-medium-gray">
                <Hash className="h-5 w-5" />
              </div>
              <Input
                type="text"
                placeholder="Enter Property ID (e.g. LBG12345)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border-0 focus-visible:ring-0 text-dark-gray placeholder:text-medium-gray"
              />
              <Button
                onClick={handleSearch}
                className="ladybug-primary px-8 py-4 rounded-none font-medium"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Connect & Discover
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-dark-gray mb-8">
              Powered by Advanced Technology
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-[hsl(var(--ladybug))]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-ladybug" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-gray mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-medium-gray">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12">
            <p className="text-medium-gray">
              Looking to buy or rent?{" "}
              <Link href="/properties" className="text-ladybug hover:text-[hsl(var(--ladybug-dark))] font-medium">
                Click here to search properties.
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-dark-gray mb-6">
                Ready to List Your Home?
              </h2>
              <p className="text-lg text-medium-gray mb-8">
                Choose from our flexible selling options - go solo with our FSBO plan or connect with vetted agents at industry-low 2% total commission.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-dark-gray mb-2">FSBO Plan</h3>
                    <p className="text-2xl font-bold text-ladybug mb-2">$995/month</p>
                    <ul className="text-sm text-medium-gray space-y-1">
                      <li>• Zillow & Realtor.com syndication</li>
                      <li>• AI assistant support</li>
                      <li>• Professional photography</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-dark-gray mb-2">Agent Connection</h3>
                    <p className="text-2xl font-bold text-ladybug mb-2">2% Total</p>
                    <ul className="text-sm text-medium-gray space-y-1">
                      <li>• Vetted partner agents</li>
                      <li>• Full-service support</li>
                      <li>• All FSBO benefits included</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Button className="ladybug-primary text-lg px-8 py-3">
                List Your Home Today
              </Button>
            </div>

            <div className="lg:pl-8">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Modern home with beautiful landscaping"
                className="rounded-2xl shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
