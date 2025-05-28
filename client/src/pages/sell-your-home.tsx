import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function SellYourHome() {
  const [plan, setPlan] = useState("fsbo");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", { ...formData, plan });
    alert(`Thank you for your interest in the ${plan.toUpperCase()} plan! We'll be in touch.`);
    // In a real application, you would send this data to your backend
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-light-gray to-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-dark-gray text-center mb-8">
          Sell Your Home with Ladybug.com
        </h1>
        <p className="text-xl text-medium-gray text-center mb-12 max-w-2xl mx-auto">
          Choose the selling option that's right for you and connect with buyers or vetted agents.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-dark-gray">FSBO Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-ladybug mb-4">$995/month</p>
              <ul className="text-medium-gray space-y-2 mb-6">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Zillow & Realtor.com syndication</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> AI assistant support</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Professional photography</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Direct buyer communication</li>
              </ul>
              <RadioGroup value={plan} onValueChange={setPlan} className="flex justify-center">
                <Label htmlFor="fsbo" className="flex items-center cursor-pointer">
                  <RadioGroupItem value="fsbo" id="fsbo" className="mr-2" />
                  Select FSBO Plan
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-dark-gray">Agent Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-ladybug mb-4">2% Total Commission</p>
              <ul className="text-medium-gray space-y-2 mb-6">
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Vetted partner agents</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Full-service support</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> All FSBO benefits included</li>
                <li className="flex items-center"><CheckCircle className="h-5 w-5 text-green-500 mr-2" /> Expert negotiation & closing</li>
              </ul>
              <RadioGroup value={plan} onValueChange={setPlan} className="flex justify-center">
                <Label htmlFor="agent" className="flex items-center cursor-pointer">
                  <RadioGroupItem value="agent" id="agent" className="mr-2" />
                  Select Agent Connection
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto p-8 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-dark-gray">Sign Up to Sell</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-dark-gray">Full Name</Label>
                <Input type="text" id="name" value={formData.name} onChange={handleChange} required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email" className="text-dark-gray">Email Address</Label>
                <Input type="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone" className="text-dark-gray">Phone Number</Label>
                <Input type="tel" id="phone" value={formData.phone} onChange={handleChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="address" className="text-dark-gray">Property Address</Label>
                <Input type="text" id="address" value={formData.address} onChange={handleChange} required className="mt-1" />
              </div>
              <Button type="submit" className="ladybug-primary w-full text-lg py-3">
                Get Started
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}