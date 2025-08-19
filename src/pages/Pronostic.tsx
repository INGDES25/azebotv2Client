import { NewHeader } from "@/components/NewHeader";
import { Footer } from "@/components/Footer";
import { HeroBot } from "@/components/HeroBot";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Download, TrendingUp } from "lucide-react";
import { contentStore } from "@/stores/contentStore";
import { db } from "@/integrations/firebase/client";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { PronosticAnalysis } from "@/stores/contentStore";

// Interface pour les données pronostic
interface PronosticNews {
  id: string;
  match: string;
  title?: string;
  price: number;
  images?: string[];
  type: string;
  createdAt?: any;
  updatedAt?: any;
}

const Pronostic = () => {
  const [latestPronostic, setLatestPronostic] = useState<PronosticAnalysis | null>(null);
  const [forexNews, setForexNews] = useState<PronosticNews[]>([]);
  const [loadingPronostic, setLoadingPronostic] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pronostic = contentStore.getLatestPronosticAnalysis();
    setLatestPronostic(pronostic);
  }, []);

  useEffect(() => {
    const fetchPronosticNews = async () => {
      try {
        setLoadingPronostic(true);
        setError(null);
        
        const q = query(
          collection(db, 'news'),
          where('type', '==', 'football'),
          limit(6)
        );
        
        const querySnapshot = await getDocs(q);
        
        const newsItems: PronosticNews[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            match: data.match || 'Match non défini',
            title: data.title,
            price: data.price || 0,
            images: data.images || [],
            type: data.type,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          };
        });
        
        setForexNews(newsItems);
      } catch (error) {
        console.error("Error fetching pronostic news:", error);
        setError(error instanceof Error ? error.message : "Erreur lors du chargement");
      } finally {
        setLoadingPronostic(false);
      }
    };

    fetchPronosticNews();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bot Section */}
          <div className="lg:col-span-1 flex justify-center">
            <HeroBot size="md" customText="Pronostics Foot" />
          </div>

          {/* Content Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold text-glow mb-2">
                Analyses et Pronostics gratuits du jour
              </h1>
              <p className="text-muted-foreground">
                Analyses et pronostics quotidiens sur les matchs
              </p>
            </div>

            {!latestPronostic ? (
              <Card className="p-8 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Aucune analyse disponible aujourd'hui</h3>
                <p className="text-muted-foreground">Revenez demain pour de nouvelles analyses</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Match Header */}
                <Card className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{latestPronostic.match}</h2>
                      <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(latestPronostic.publishedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Images */}
                {latestPronostic.images.length > 0 && (
                  <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {latestPronostic.images.map((image, index) => (
                        <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={image} 
                            alt={`Analyse ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Analysis */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-primary">Analyse du Match</h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{latestPronostic.analysis}</p>
                </Card>

                {/* Predictions */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-secondary">Nos Pronostics</h3>
                  <div className="p-4 bg-secondary/10 rounded-lg">
                    <p className="text-foreground whitespace-pre-wrap">{latestPronostic.predictions}</p>
                  </div>
                </Card>

                {/* Free Coupon */}
                {latestPronostic.coupon && (
                  <Card className="p-6 bg-gradient-subtle">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-accent">Coupon Gratuit du Jour</h3>
                    </div>
                    
                    <div className="p-4 bg-background rounded-lg">
                      <p className="text-foreground whitespace-pre-wrap">{latestPronostic.coupon}</p>
                    </div>

                    <Button className="w-full mt-4 bg-gradient-primary text-primary-foreground">
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger le Coupon
                    </Button>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Découvrez nos analyses trading */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Découvrez nos analyses sportives</h2>
          
          {/* Affichage d'erreur si nécessaire */}
          {error && (
            <div className="text-center py-4 text-red-500">
              Erreur: {error}
            </div>
          )}
          
          {loadingPronostic ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : forexNews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {forexNews.map((news) => (
                <Card key={news.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <TrendingUp className="w-5 h-5 text-primary mr-2" />
                      <span className="font-semibold">{news.match}</span>
                    </div>
                    {news.images && news.images.length > 0 && (
                      <img 
                        src={news.images[0]} 
                        alt={news.title || news.match} 
                        className="w-full h-40 object-cover rounded mb-3" 
                      />
                    )}
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-bold text-primary">{news.price} FCFA</span>
                      <Button 
                        size="sm" 
                        className="bg-gradient-primary text-primary-foreground"
                        onClick={() => window.location.href = `/payment/${news.id}`}
                      >
                        Acheter
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">
                Aucune analyse sportive disponible pour le moment
              </div>
              <div className="text-sm text-muted-foreground">
                {!loadingPronostic && !error && "Vérifiez que des documents avec type='forex' existent dans Firebase"}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pronostic;