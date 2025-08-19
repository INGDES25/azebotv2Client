import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Menu, X, User, LogIn, UserPlus, LogOut } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { user: authUser, profile, signOut } = useAuth();

  const isLoggedIn = !!authUser;
  const user = authUser ? {
    name: profile?.full_name || profile?.username || authUser.email || 'Utilisateur',
    avatar: profile?.avatar_url || authUser.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    isAdmin: profile?.role === 'admin' || authUser.email === "admin@azebot.com",
    email: authUser.email
  } : null;

  const handleAuthClick = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navItems = [
    { label: "Accueil", href: "/" },
    { label: "Trading", href: "/trading" },
    { label: "Pronostic", href: "/pronostic" },
    { label: "Social", href: "/social" },
    { label: "À propos", href: "/about" },
    ...(user?.isAdmin ? [{ label: "Admin", href: "/admin" }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">AZ</span>
                </div>
                <span className="text-xl font-bold text-glow">AZEBot</span>
              </Link>
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
              {isLoggedIn && user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-primary"
                    />
                    <span className="text-foreground">{user.name}</span>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleAuthClick("login")}
                    className="text-foreground hover:text-primary"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </Button>
                  <Button
                    onClick={() => handleAuthClick("register")}
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
                  {isLoggedIn && user ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full border-2 border-primary"
                        />
                        <span className="text-foreground">{user.name}</span>
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
                        onClick={() => handleAuthClick("login")}
                        className="justify-start text-foreground hover:text-primary"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Se connecter
                      </Button>
                      <Button
                        onClick={() => handleAuthClick("register")}
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onLogin={(user) => {
          setAuthModalOpen(false);
        }}
      />
    </>
  );
};
