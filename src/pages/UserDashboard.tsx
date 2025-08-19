import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Home, 
  TrendingUp, 
  Target, 
  User, 
  CreditCard,
  LogOut,
  Calendar,
  MessageSquare,
  Star,
  Loader2
} from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [tradingAnalyses, setTradingAnalyses] = useState<any[]>([]);
  const [pronostics, setPronostics] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Protection d'accès
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Charger les données utilisateur
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoadingData(true);
      
      try {
        // Charger les analyses trading de l'utilisateur
        const tradingQuery = query(
          collection(db, "tradingAnalyses"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        
        const tradingSnapshot = await getDocs(tradingQuery);
        const tradingData = tradingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTradingAnalyses(tradingData);

        // Charger les pronostics de l'utilisateur
        const pronosticQuery = query(
          collection(db, "pronostics"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        
        const pronosticSnapshot = await getDocs(pronosticQuery);
        const pronosticData = pronosticSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPronostics(pronosticData);
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos données",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [user, db, toast]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-glow mb-2">Chargement...</div>
          <div className="text-muted-foreground">Vérification de votre session</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header User */}
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">AZ</span>
                </div>
                <span className="text-xl font-bold text-glow">AZEBot</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {profile?.username || profile?.full_name || 'Utilisateur'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.role === 'admin' ? 'Administrateur' : 'Membre'}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="text-destructive hover:text-destructive/90"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation verticale */}
        <nav className="w-full md:w-64 bg-card border-r border-border p-4 hidden md:block">
          <div className="space-y-2">
            <Button
              variant={activeTab === "home" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("home")}
            >
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Button>
            <Button
              variant={activeTab === "trading" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("trading")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Mes analyses
            </Button>
            <Button
              variant={activeTab === "pronostics" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("pronostics")}
            >
              <Target className="w-4 h-4 mr-2" />
              Mes pronostics
            </Button>
            <Button
              variant={activeTab === "subscription" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("subscription")}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Mon abonnement
            </Button>
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("profile")}
            >
              <User className="w-4 h-4 mr-2" />
              Mon profil
            </Button>
          </div>
        </nav>

        {/* Navigation mobile */}
        <div className="md:hidden bg-card border-b border-border p-2 w-full">
          <div className="flex overflow-x-auto space-x-2 pb-1">
            <Button
              variant={activeTab === "home" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("home")}
            >
              <Home className="w-4 h-4 mr-1" />
              Accueil
            </Button>
            <Button
              variant={activeTab === "trading" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("trading")}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Analyses
            </Button>
            <Button
              variant={activeTab === "pronostics" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("pronostics")}
            >
              <Target className="w-4 h-4 mr-1" />
              Pronostics
            </Button>
            <Button
              variant={activeTab === "subscription" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("subscription")}
            >
              <CreditCard className="w-4 h-4 mr-1" />
              Abonnement
            </Button>
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("profile")}
            >
              <User className="w-4 h-4 mr-1" />
              Profil
            </Button>
          </div>
        </div>

        {/* Contenu principal */}
        <main className="flex-1 overflow-auto p-4">
          <div className="container mx-auto">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{tradingAnalyses.length}</p>
                    <p className="text-sm text-muted-foreground">Analyses Trading</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-secondary" />
                  <div>
                    <p className="text-2xl font-bold">{pronostics.length}</p>
                    <p className="text-sm text-muted-foreground">Pronostics</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">Premium</p>
                    <p className="text-sm text-muted-foreground">Abonnement</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Messages non lus</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contenu des onglets */}
            {activeTab === "home" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Vos dernières analyses Trading
                    </h2>
                    
                    {loadingData ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : tradingAnalyses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Vous n'avez pas encore d'analyses trading. 
                        <br />
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-normal"
                          onClick={() => setActiveTab("trading")}
                        >
                          Commencez ici
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tradingAnalyses.map((analysis) => (
                          <div key={analysis.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{analysis.asset}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {analysis.summary || analysis.technicalAnalysis?.slice(0, 100) + '...'}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {analysis.createdAt?.toDate().toLocaleDateString('fr-FR')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab("trading")}
                    >
                      Voir toutes mes analyses
                    </Button>
                  </Card>
                  
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-secondary" />
                      Vos derniers pronostics
                    </h2>
                    
                    {loadingData ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : pronostics.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Vous n'avez pas encore de pronostics. 
                        <br />
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-normal"
                          onClick={() => setActiveTab("pronostics")}
                        >
                          Commencez ici
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pronostics.map((pronostic) => (
                          <div key={pronostic.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{pronostic.match}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {pronostic.predictions?.slice(0, 100) + '...'}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {pronostic.createdAt?.toDate().toLocaleDateString('fr-FR')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab("pronostics")}
                    >
                      Voir tous mes pronostics
                    </Button>
                  </Card>
                </div>
                
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Statut de votre abonnement</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <Star className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl">Premium</h3>
                          <p className="text-muted-foreground">Abonnement actif</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                          <span>Prochain paiement</span>
                          <span className="font-medium">15 août 2024</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Statut</span>
                          <Badge className="bg-emerald-500/10 text-emerald-500">Actif</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Renouvellement</span>
                          <span className="font-medium">Automatique</span>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        Gérer mon abonnement
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Avantages Premium</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary">✓</span>
                          </div>
                          <span>Analyses trading quotidiennes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary">✓</span>
                          </div>
                          <span>Pronostics sportifs exclusifs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary">✓</span>
                          </div>
                          <span>Signaux en temps réel</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary">✓</span>
                          </div>
                          <span>Support prioritaire</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "trading" && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Mes analyses Trading</h2>
                  <Button onClick={() => navigate('/analysis-request')}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Nouvelle analyse
                  </Button>
                </div>
                
                {loadingData ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : tradingAnalyses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Aucune analyse pour le moment</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Demandez une analyse trading au bot pour suivre vos stratégies.
                    </p>
                    <Button size="lg" onClick={() => navigate('/analysis-request')}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Obtenir une analyse
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tradingAnalyses.map((analysis) => (
                      <Card key={analysis.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{analysis.asset}</h3>
                              <Badge variant="secondary">
                                {analysis.signals || 'Signal'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {analysis.summary || analysis.technicalAnalysis}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {analysis.createdAt?.toDate().toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {activeTab === "pronostics" && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Mes pronostics Sportifs</h2>
                  <Button onClick={() => navigate('/pronostic-request')}>
                    <Target className="w-4 h-4 mr-2" />
                    Nouveau pronostic
                  </Button>
                </div>
                
                {loadingData ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : pronostics.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Aucun pronostic pour le moment</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Demandez un pronostic sportif au bot.
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      onClick={() => navigate('/pronostic-request')}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Obtenir un pronostic
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pronostics.map((pronostic) => (
                      <Card key={pronostic.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{pronostic.match}</h3>
                              <Badge variant="secondary">
                                {pronostic.predictions?.split(',')[0] || 'Pronostic'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {pronostic.analysis}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {pronostic.createdAt?.toDate().toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {activeTab === "subscription" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Gestion de votre abonnement</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-subtle p-6 rounded-lg mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <Star className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl">Abonnement Premium</h3>
                          <p className="text-muted-foreground">Accès complet à toutes les fonctionnalités</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Statut</p>
                          <p className="font-medium">Actif</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Prochain paiement</p>
                          <p className="font-medium">15 août 2024</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Période</p>
                          <p className="font-medium">Mensuel</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Renouvellement</p>
                          <p className="font-medium">Automatique</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button className="flex-1 bg-background hover:bg-background/90 border border-border">
                          Modifier le paiement
                        </Button>
                        <Button className="flex-1">Gérer l'abonnement</Button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-4">Historique des paiements</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">15 juillet 2024</p>
                          <p className="text-sm text-muted-foreground">Paiement mensuel</p>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500">Réussi</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">15 juin 2024</p>
                          <p className="text-sm text-muted-foreground">Paiement mensuel</p>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500">Réussi</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">15 mai 2024</p>
                          <p className="text-sm text-muted-foreground">Paiement mensuel</p>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500">Réussi</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Card className="p-6 mb-6">
                      <h3 className="font-semibold mb-4">Avantages Premium</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary">✓</span>
                          </div>
                          <span>Analyses trading quotidiennes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary">✓</span>
                          </div>
                          <span>Pronostics sportifs exclusifs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary">✓</span>
                          </div>
                          <span>Signaux en temps réel</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary">✓</span>
                          </div>
                          <span>Support prioritaire</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary">✓</span>
                          </div>
                          <span>Accès à la communauté privée</span>
                        </li>
                      </ul>
                    </Card>
                    
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Besoin d'aide ?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Contactez notre support client pour toute question concernant votre abonnement.
                      </p>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contacter le support
                      </Button>
                    </Card>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "profile" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Mon profil</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Informations personnelles</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Nom complet</Label>
                            <Input 
                              value={profile?.full_name || ''} 
                              placeholder="Votre nom complet" 
                            />
                          </div>
                          <div>
                            <Label>Nom d'utilisateur</Label>
                            <Input 
                              value={profile?.username || ''} 
                              placeholder="Votre nom d'utilisateur" 
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Adresse email</Label>
                          <Input 
                            value={user.email || ''} 
                            disabled 
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Pays</Label>
                            <Input 
                              value={profile?.country || ''} 
                              placeholder="Votre pays" 
                            />
                          </div>
                          <div>
                            <Label>Téléphone</Label>
                            <Input 
                              value={profile?.phone || ''} 
                              placeholder="Votre numéro de téléphone" 
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Intérêt principal</Label>
                          <div className="flex gap-2">
                            <Button 
                              variant={profile?.interests?.includes('trader') ? "default" : "outline"}
                              className="flex-1"
                            >
                              Trader
                            </Button>
                            <Button 
                              variant={profile?.interests?.includes('parieur') ? "default" : "outline"}
                              className="flex-1"
                            >
                              Parieur
                            </Button>
                            <Button 
                              variant={profile?.interests?.includes('both') ? "default" : "outline"}
                              className="flex-1"
                            >
                              Les deux
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-4">Sécurité</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">Mot de passe</p>
                            <p className="text-sm text-muted-foreground">Dernière modification: il y a 2 mois</p>
                          </div>
                          <Button variant="outline">Modifier</Button>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">Authentification à deux facteurs</p>
                            <p className="text-sm text-muted-foreground">Non activé</p>
                          </div>
                          <Button variant="outline">Activer</Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="bg-gradient-primary text-primary-foreground">
                      Enregistrer les modifications
                    </Button>
                  </div>
                  
                  <div>
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 rounded-full bg-muted/30 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                        {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-semibold mb-1">
                        {profile?.full_name || profile?.username || 'Utilisateur'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Membre depuis {user.metadata?.creationTime ? new Date(user.metadata.creationTime).getFullYear() : '2024'}
                      </p>
                    </div>
                    
                    <Card className="p-6 mb-6">
                      <h3 className="font-semibold mb-4">Statistiques</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Analyses partagées</span>
                          <span className="font-medium">{tradingAnalyses.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pronostics partagés</span>
                          <span className="font-medium">{pronostics.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Messages postés</span>
                          <span className="font-medium">12</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Activité récente</span>
                          <span className="font-medium">Aujourd'hui</span>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Actions importantes</h3>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          Exporter mes données
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive/90">
                          Supprimer mon compte
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;