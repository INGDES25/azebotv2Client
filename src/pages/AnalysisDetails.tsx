import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/integrations/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, ShoppingCart, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadScript } from "@/lib/utils";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: "forex" | "football";
  asset?: string;
  match?: string;
  price: number;
  technicalAnalysis?: string;
  fundamentalAnalysis?: string;
  analysis?: string;
  predictions?: string;
  coupon?: string;
  images?: string[];
  signals?: string;
  reasoning?: string;
  summary?: string;
  updatedAt: any;
}

const AnalysisDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsItem = async () => {
      if (!id) return;
      
      try {
        const newsDoc = await getDoc(doc(db, "news", id));
        if (newsDoc.exists()) {
          setNewsItem({ id: newsDoc.id, ...newsDoc.data() } as NewsItem);
        } else {
          toast({
            title: "Erreur",
            description: "L'analyse n'a pas été trouvée",
            variant: "destructive"
          });
          navigate('/'); // Rediriger vers la page d'accueil si l'analyse n'existe pas
        }
      } catch (error) {
        console.error("Error fetching news item:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de l'analyse",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNewsItem();
  }, [id, navigate, toast]);

  const handleBuy = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    toast({
      title: "Achat en cours",
      description: "Vous allez être redirigé vers le paiement"
    });
    // Ici vous intégreriez votre système de paiement
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    toast({
      title: "Ajouté au panier",
      description: "L'analyse a été ajoutée à votre panier"
    });
    // Ici vous géreriez le panier
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 text-muted-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {newsItem.asset || newsItem.match || newsItem.title}
                  </h1>
                  <p className="text-muted-foreground">
                    {newsItem.type === 'forex' ? 'Analyse Trading' : 'Pronostic Sportif'}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <span>Prix: <span className="text-primary font-medium">{newsItem.price} FCFA</span></span>
                </div>
                
                {newsItem.images && newsItem.images.length > 0 && (
                  <div className="mb-6">
                    <img 
                      src={newsItem.images[0]} 
                      alt="Analyse" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-3">Résumé</h3>
                  <p className="text-muted-foreground mb-4">{newsItem.summary || newsItem.content}</p>
                  
                  {newsItem.type === 'forex' && (
                    <>
                      {newsItem.technicalAnalysis && (
                        <>
                          <h3 className="text-xl font-semibold mb-3">Analyse Technique</h3>
                          <p className="text-muted-foreground mb-4">{newsItem.technicalAnalysis}</p>
                        </>
                      )}
                      
                      {newsItem.fundamentalAnalysis && (
                        <>
                          <h3 className="text-xl font-semibold mb-3">Analyse Fondamentale</h3>
                          <p className="text-muted-foreground mb-4">{newsItem.fundamentalAnalysis}</p>
                        </>
                      )}
                      
                      {newsItem.reasoning && (
                        <>
                          <h3 className="text-xl font-semibold mb-3">Justification</h3>
                          <p className="text-muted-foreground mb-4">{newsItem.reasoning}</p>
                        </>
                      )}
                    </>
                  )}

                  {newsItem.type === 'football' && (
                    <>
                      {newsItem.analysis && (
                        <>
                          <h3 className="text-xl font-semibold mb-3">Analyse du Match</h3>
                          <p className="text-muted-foreground mb-4">{newsItem.analysis}</p>
                        </>
                      )}
                      
                      {newsItem.predictions && (
                        <>
                          <h3 className="text-xl font-semibold mb-3">Pronostics</h3>
                          <p className="text-muted-foreground mb-4">{newsItem.predictions}</p>
                        </>
                      )}
                      
                      {newsItem.coupon && (
                        <>
                          <h3 className="text-xl font-semibold mb-3">Coupon Gratuit</h3>
                          <p className="text-muted-foreground mb-4">{newsItem.coupon}</p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-4">
                <Button 
                  className="w-full bg-gradient-primary text-primary-foreground py-6 text-lg"
                  onClick={handleBuy}
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Acheter l'analyse - {newsItem.price} FCFA
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full py-6 text-lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Ajouter au panier
                </Button>
              </div>
            </Card>

            {newsItem.signals && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">Signal</h3>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-primary font-medium text-lg">{newsItem.signals}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetails;
