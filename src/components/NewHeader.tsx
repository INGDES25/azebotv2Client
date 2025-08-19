import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, LogIn, UserPlus, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const NewHeader = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { label: "Accueil", href: "/" },
    { label: "Trading", href: "/trading" },
    { label: "Pronostic", href: "/pronostic" },
    { label: "Social", href: "/social" },
    { label: "À propos", href: "/about" },
    ...(profile?.role === 'admin' ? [{ label: "Admin", href: "/admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AZ</span>
            </div>
            <span className="text-xl font-bold text-glow">AZEBot</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Auth Buttons / User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {user && profile ? (
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8 border-2 border-primary">
                  <AvatarImage 
                    src={profile.avatar_url || undefined} 
                    alt={profile.full_name || profile.username || "User"}
                  />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                  {profile.username || profile.full_name || user.email}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-foreground hover:text-primary"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="text-foreground hover:text-primary"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Se connecter
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ouvrir un compte
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-200 px-4 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-border">
                {user && profile ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8 border-2 border-primary">
                        <AvatarImage 
                          src={profile.avatar_url || undefined} 
                          alt={profile.full_name || profile.username || "User"}
                        />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                        {profile.username || profile.full_name || user.email}
                      </Link>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="justify-start text-foreground hover:text-primary"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/auth')}
                      className="justify-start text-foreground hover:text-primary"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Se connecter
                    </Button>
                    <Button
                      onClick={() => navigate('/auth')}
                      className="justify-start bg-gradient-primary text-primary-foreground hover:opacity-90"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Ouvrir un compte
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
