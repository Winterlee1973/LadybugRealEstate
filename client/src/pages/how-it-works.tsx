import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Handshake, DollarSign, Search, MessageCircle, Home } from "lucide-react";

export default function HowItWorks() {
  const sections = [
    {
      icon: Search,
      title: "1. Find Your Dream Home",
      description: "Browse our extensive listings or use a Property ID for direct access. Our intuitive search and filtering tools make it easy to narrow down your options.",
    },
    {
      icon: MessageCircle,
      title: "2. Connect & Communicate",
      description: "Once you find a property you love, use our direct communication tools to chat with sellers or agents. Get your questions answered instantly with our AI-powered assistant.",
    },
    {
      icon: Handshake,
      title: "3. Make an Offer & Close",
      description: "Submit offers directly through the platform. Our streamlined process and transparent deal pathways ensure a smooth transaction from negotiation to closing.",
    },
    {
      icon: Home,
      title: "4. List Your Property (Sellers)",
      description: "For sellers, choose between our FSBO plan or connect with vetted agents. Benefit from MLS syndication, professional photography, and AI support to sell your home efficiently.",
    },
    {
      icon: Lightbulb,
      title: "5. Leverage Advanced Technology",
      description: "Ladybug.com is powered by cutting-edge AI for property Q&A, immersive 3D virtual tours, and robust analytics to give you an edge in the market.",
    },
    {
      icon: DollarSign,
      title: "6. Transparent & Fair Pricing",
      description: "Buyers pay no commission. Sellers benefit from our low-cost FSBO plan or industry-low 2% total commission with agent connections, ensuring more value for your money.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-light-gray to-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-dark-gray text-center mb-8">
          How Ladybug.com Works
        </h1>
        <p className="text-xl text-medium-gray text-center mb-12 max-w-3xl mx-auto">
          Ladybug.com simplifies the real estate journey for both buyers and sellers with innovative technology and transparent processes.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="bg-white hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center space-x-4 p-6">
                  <div className="w-12 h-12 bg-[hsl(var(--ladybug))]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-ladybug" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-dark-gray">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-medium-gray">{section.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-dark-gray mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-medium-gray mb-8">
            Whether you're looking to buy your next home or sell your current one, Ladybug.com has you covered.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/" className="ladybug-primary px-8 py-3 text-lg rounded-md">
              Find a Home
            </a>
            <a href="/sell-your-home" className="bg-white border border-ladybug text-ladybug hover:bg-ladybug/10 px-8 py-3 text-lg rounded-md transition-colors">
              Sell Your Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}