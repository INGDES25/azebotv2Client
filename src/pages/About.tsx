import { NewHeader } from "@/components/NewHeader";
import { Footer } from "@/components/Footer";
import { HeroBot } from "@/components/HeroBot";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Target, Users, Zap, CheckCircle, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const About = () => {
  const { user } = useAuth();
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

  const features = [
    {
      icon: BarChart3,
      title: "Analyses Trading Forex",
      description: "Analyses techniques et fondamentales quotidiennes sur les principales paires de devises avec des setups de trading précis."
    },
    {
      icon: Target,
      title: "Pronostics Football",
      description: "Pronostics détaillés sur les matchs de football avec analyses complètes et coupons gratuits."
    },
    {
      icon: Zap,
      title: "Signaux en Temps Réel",
      description: "Notifications instantanées des meilleures opportunités de trading et de paris sportifs."
    },
    {
      icon: Users,
      title: "Communauté Active",
      description: "Échangez avec d'autres traders et parieurs dans notre espace social dédié."
    }
  ];

  const stats = [
    { value: "95%", label: "Taux de Précision" },
    { value: "500+", label: "Utilisateurs Actifs" },
    { value: "24/7", label: "Surveillance des Marchés" },
    { value: "100+", label: "Analyses Publiées" }
  ];

  const advantages = [
    "Analyses réalisées par des experts en trading",
    "Pronostics basés sur des données approfondies",
    "Interface intuitive et moderne",
    "Communauté bienveillante et active",
    "Mises à jour quotidiennes garanties",
    "Support client réactif"
  ];

  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-glow leading-tight">
                À propos d'{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  AZEBot
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                AZEBot est votre partenaire de confiance pour maximiser vos profits 
                sur les marchés financiers et les paris sportifs. Notre plateforme 
                combine expertise humaine et technologie moderne pour vous offrir 
                les meilleures analyses du marché.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                  onClick={handleStartClick}
                >
                  Commencer maintenant
                </Button>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary"
                  onClick={handleGetAnalysis}
                >
                  Obtenir une analyse
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <HeroBot size="lg" customText="Votre Assistant IA" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-glow mb-4">
              Nos Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment AZEBot peut transformer votre approche 
              du trading et des paris sportifs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover-lift">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-glow mb-6">
                Pourquoi choisir AZEBot ?
              </h2>
              <p className="text-muted-foreground mb-8">
                Nous nous distinguons par notre approche professionnelle 
                et notre engagement envers la réussite de nos utilisateurs.
              </p>
              
              <div className="space-y-4">
                {advantages.map((advantage, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{advantage}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-8 bg-gradient-subtle">
              <div className="text-center">
                <Star className="w-16 h-16 mx-auto mb-4 text-accent" />
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Excellence garantie
                </h3>
                <p className="text-muted-foreground mb-6">
                  Notre équipe d'experts travaille chaque jour pour vous fournir 
                  les analyses les plus précises et les pronostics les plus fiables.
                </p>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Satisfaction client: 98%
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Prêt à rejoindre AZEBot ?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Commencez dès aujourd'hui à maximiser vos profits avec nos analyses 
            professionnelles et nos pronostics précis.
          </p>
          <Button 
            className="bg-background text-primary hover:bg-background/90 px-8 py-3 text-lg"
            onClick={handleStartClick}
          >
            Ouvrir un compte gratuit
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
