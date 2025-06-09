import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Bug, LogOut, User, Heart, Tag } from "lucide-react"; // Import Tag icon
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import { Badge } from "@/components/ui/badge"; // Import Badge component

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, loading, role } = useAuth(); // Get role from useAuth

  const navigationLinks = [
    { href: "/", label: "Find A Home" },
    { href: "/sell-your-home", label: "Sell Your Home" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/secret-properties", label: "Secret" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 justify-between">
          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center space-x-2">
              <Bug className="h-8 w-8 text-ladybug" />
              <span className="text-xl font-bold text-dark-gray">ladybug.com</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex-1 hidden md:flex justify-center items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-dark-gray hover:text-ladybug transition-colors font-medium ${
                  location === link.href ? "underline underline-offset-4" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex-1 hidden md:flex justify-end">
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full" />
              ) : user ? (
                <>
                  {role && (
                    <Badge variant="secondary" className="text-xs">
                      {role === "buyer" || role === "seller" ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
                    </Badge>
                  )}
                  {user && role === "seller" && (
                    <Link href="/seller-admin" className="flex items-center space-x-2 text-dark-gray hover:text-ladybug transition-colors font-medium">
                      <Tag className="h-5 w-5" />
                      <span>Seller Admin</span>
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                          <AvatarFallback>
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.email}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.user_metadata?.full_name || 'User'}
                          </p>
                        </div>
                      </DropdownMenuItem>
                      <Link href="/profile">
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      {user && role === "seller" && (
                        <Link href="/seller-admin">
                          <DropdownMenuItem>
                            <Tag className="mr-2 h-4 w-4" />
                            <span>Seller Admin</span>
                          </DropdownMenuItem>
                        </Link>
                      )}
                      <Link href="/favorites"> {/* Add Link to favorites page */}
                        <DropdownMenuItem>
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Favorites</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <AuthModal>
                  <Button className="ladybug-primary">
                    Login
                  </Button>
                </AuthModal>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col items-center space-y-4 mt-8">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-dark-gray hover:text-ladybug transition-colors font-medium py-2 ${
                      location === link.href ? "underline underline-offset-4" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {user && role === "seller" && (
                  <Link
                    href="/seller-admin"
                    className={`text-dark-gray hover:text-ladybug transition-colors font-medium py-2 ${
                      location === "/seller-admin" ? "underline underline-offset-4" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Seller Admin
                  </Link>
                )}
                <Button className="ladybug-primary mt-4">
                  Login
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
