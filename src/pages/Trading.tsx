import { NewHeader } from "@/components/NewHeader";
import { Footer } from "@/components/Footer";
import { HeroBot } from "@/components/HeroBot";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { contentStore } from "@/stores/contentStore";
import { Button } from "@/components/ui/button";
import { db } from "@/integrations/firebase/client";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { TradingAnalysis } from "@/stores/contentStore";

// Interface pour les données Forex
interface ForexNews {
  id: string;
  asset: string;
  title?: string;
  price: number;
  images?: string[];
  type: string;
  createdAt?: any;
  updatedAt?: any;
}

const Trading = () => {
  const [latestAnalysis, setLatestAnalysis] = useState<TradingAnalysis | null>(null);
  const [forexNews, setForexNews] = useState<ForexNews[]>([]);
  const [loadingForex, setLoadingForex] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analysis = contentStore.getLatestTradingAnalysis();
    setLatestAnalysis(analysis);
  }, []);

  useEffect(() => {
    const fetchForexNews = async () => {
      try {
        setLoadingForex(true);
        setError(null);
        
        const q = query(
          collection(db, 'news'),
          orderBy('updatedAt', 'desc'),
          where('type', '==', 'forex'),
          limit(6)
        );
        
        const querySnapshot = await getDocs(q);
        
        const newsItems: ForexNews[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            asset: data.asset || 'Elément non défini',
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
        console.error("Error fetching forex news:", error);
        setError(error instanceof Error ? error.message : "Erreur lors du chargement");
      } finally {
        setLoadingForex(false);
      }
    };

    fetchForexNews();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bot Section */}
          <div className="lg:col-span-1 flex justify-center">
            <HeroBot size="md" customText="Analyses Trading" />
          </div>

          {/* Content Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold text-glow mb-2">
                Analyses Trading gratuites du jour
              </h1>
              <p className="text-muted-foreground">
                Analyses techniques et fondamentales quotidiennes
              </p>
            </div>

            {!latestAnalysis ? (
              <Card className="p-8 text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Aucune analyse disponible aujourd'hui</h3>
                <p className="text-muted-foreground">Revenez demain pour de nouvelles analyses</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Asset Header */}
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">{latestAnalysis.asset}</h2>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {latestAnalysis.signals.includes("ACHAT") || latestAnalysis.signals.includes("BUY") ? (
                        <><TrendingUp className="w-4 h-4 mr-2" />ACHAT</>
                      ) : (
                        <><TrendingDown className="w-4 h-4 mr-2" />VENTE</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    Publié le {new Date(latestAnalysis.publishedAt).toLocaleDateString('fr-FR')}
                  </p>
                </Card>

                {/* Images Carousel */}
                {latestAnalysis.images.length > 0 && (
                  <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {latestAnalysis.images.map((image, index) => (
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

                {/* Technical Analysis */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-primary">Analyse Technique</h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{latestAnalysis.technicalAnalysis}</p>
                </Card>

                {/* Fundamental Analysis */}
                {latestAnalysis.fundamentalAnalysis && (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-secondary">Analyse Fondamentale</h3>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{latestAnalysis.fundamentalAnalysis}</p>
                  </Card>
                )}

                {/* Signals */}
                <Card className="p-6 bg-gradient-subtle">
                  <h3 className="text-xl font-semibold mb-4 text-accent">Setup de Trading</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Signal:</Badge>
                      <span className="font-semibold text-lg">{latestAnalysis.signals}</span>
                    </div>
                    {latestAnalysis.reasoning && (
                      <div>
                        <Badge variant="outline" className="mb-2">Justification:</Badge>
                        <p className="text-foreground whitespace-pre-wrap">{latestAnalysis.reasoning}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Summary */}
                {latestAnalysis.summary && (
                  <Card className="p-6 border-primary/20 bg-primary/5">
                    <h3 className="text-xl font-semibold mb-3 text-primary">Résumé</h3>
                    <p className="text-foreground font-medium whitespace-pre-wrap">{latestAnalysis.summary}</p>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Section Découvrez d'autres analyses trading */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Découvrez d'autres analyses trading</h2>
          
          {/* Affichage d'erreur si nécessaire */}
          {error && (
            <div className="text-center py-4 text-red-500">
              Erreur: {error}
            </div>
          )}
          
          {loadingForex ? (
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
                      <span className="font-semibold">{news.asset}</span>
                    </div>
                    {news.images && news.images.length > 0 && (
                      <img 
                        src={news.images[0]} 
                        alt={news.title || news.asset} 
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
                Aucune analyse trading disponible pour le moment
              </div>
              <div className="text-sm text-muted-foreground">
                {!loadingForex && !error && "Vérifiez que des documents avec type='forex' existent dans Firebase"}
              </div>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Trading;