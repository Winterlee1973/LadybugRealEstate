import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import Landing from "@/pages/landing";
import PropertyListings from "@/pages/property-listings";
import PropertyDetail from "@/pages/property-detail";
import NotFound from "@/pages/not-found";
import SellYourHome from "@/pages/sell-your-home";
import HowItWorks from "@/pages/how-it-works";
import ProfilePage from "@/pages/profile";
import SellerAdminPage from "@/pages/seller-admin";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/properties" component={PropertyListings} />
          <Route path="/property/:propertyId" component={PropertyDetail} />
          <Route path="/sell-your-home" component={SellYourHome} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/seller-admin" component={SellerAdminPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
