import { NewHeader } from "@/components/NewHeader";
import { Footer } from "@/components/Footer";
import { HeroBot } from "@/components/HeroBot";
import { NewsCarousel } from "@/components/NewsCarousel";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Target, Users, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleStartClick = () => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate('/');
    }
  };

  const handleGetAnalysis = () => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 scroll-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold text-glow leading-tight">
                Maximisez vos profits avec{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  AZEBot
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                L'intelligence artificielle au service de vos investissements. 
                Analyses de trading Forex quotidiennes et pronostics sportifs précis 
                pour optimiser vos gains.
              </p>
              
              {user && (
                <div className="text-center mb-4">
                  <p className="text-lg text-muted-foreground">
                    Bienvenue, <Link to="/dashboard" className="text-primary font-medium hover:underline">{profile?.full_name || profile?.username || user.email}</Link> !
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity px-8 py-3 text-lg"
                  onClick={handleStartClick}
                >
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10 px-8 py-3 text-lg"
                  onClick={handleGetAnalysis}
                >
                  Obtenir une analyse
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">Précision</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">24/7</div>
                  <div className="text-sm text-muted-foreground">Surveillance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">500+</div>
                  <div className="text-sm text-muted-foreground">Utilisateurs</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <HeroBot size="lg" customText="Votre Assistant IA" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-glow mb-4">
              Pourquoi choisir AZEBot ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Notre plateforme combine intelligence artificielle et expertise humaine 
              pour vous fournir les meilleures analyses du marché.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4 p-6 bg-card border border-border rounded-xl hover-lift">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Analyses Trading</h3>
              <p className="text-muted-foreground text-sm">
                Analyses techniques et fondamentales quotidiennes sur les principales paires de devises
              </p>
            </div>

            <div className="text-center space-y-4 p-6 bg-card border border-border rounded-xl hover-lift">
              <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Pronostics Sports</h3>
              <p className="text-muted-foreground text-sm">
                Pronostics précis sur les matchs de football avec analyses détaillées
              </p>
            </div>

            <div className="text-center space-y-4 p-6 bg-card border border-border rounded-xl hover-lift">
              <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Signaux Temps Réel</h3>
              <p className="text-muted-foreground text-sm">
                Notifications instantanées des opportunités de trading et de paris
              </p>
            </div>

            <div className="text-center space-y-4 p-6 bg-card border border-border rounded-xl hover-lift">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Communauté</h3>
              <p className="text-muted-foreground text-sm">
                Échangez avec d'autres traders et parieurs dans notre espace social
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* News Carousel */}
      <NewsCarousel />

      {/* Reviews Carousel */}
      <ReviewCarousel />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Prêt à transformer vos investissements ?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines d'utilisateurs qui font déjà confiance à AZEBot 
            pour leurs analyses de trading et pronostics sportifs.
          </p>
          <Button 
            className="bg-background text-primary hover:bg-background/90 transition-colors px-8 py-3 text-lg"
            onClick={handleStartClick}
          >
            Ouvrir un compte gratuit
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
