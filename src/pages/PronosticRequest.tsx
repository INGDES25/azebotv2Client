import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NewHeader } from "@/components/NewHeader";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Send, 
  Upload, 
  X, 
  Target, 
  Trophy,
  Activity,
  ChevronLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { uploadProfileImage } from "@/integrations/supabase/storage";
import { db } from "@/integrations/firebase/client";
import { addDoc, collection, onSnapshot, doc } from "firebase/firestore";

const PronosticRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requestText, setRequestText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [botResponse, setBotResponse] = useState<any>(null);  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Protection d'accès
  if (!user) {
    navigate('/auth');
    return null;
  }

  // Nettoyer l'abonnement lors du démontage du composant
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (selectedMode: "free" | "premium") => {
    if (!requestText.trim() && images.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // Upload des images vers Supabase
      const imageUrls = [];
      for (const image of images) {
        const url = await uploadProfileImage(image, user.uid);
        imageUrls.push(url);
      }
      
      // Stockage de la requête dans Firebase
      await addDoc(collection(db, "userPronosticRequests"), {
        userId: user.uid,
        text: requestText,
        images: imageUrls,
        createdAt: new Date(),
        status: "pending",
        mode: selectedMode
      });
      
      // Stocker la référence du document créé
      const requestDoc = await addDoc(collection(db, "userPronosticRequests"), {
        userId: user.uid,
        text: requestText,
        images: imageUrls,
        createdAt: new Date(),
        status: "pending",
        mode: selectedMode
      });

      // Écouter les mises à jour de la requête
      const unsubscribe = onSnapshot(doc(db, "userPronosticRequests", requestDoc.id), (doc) => {
        const data = doc.data();
        if (data?.response) {
          setBotResponse(data.response);
          setIsLoading(false);
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }
        }
      });

      // Stocker la fonction de désabonnement
      unsubscribeRef.current = unsubscribe;
      
    } catch (error) {
      console.error("Error submitting request:", error);
      setIsLoading(false);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Partie Requête au bot */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Requête au bot</h2>
            
            <div className="space-y-6">
              <Textarea
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Décrivez votre demande de pronostic... (ex: Pronostic pour le match PSG vs Real Madrid, Analyse du match Barcelone vs Bayern)"
                className="min-h-[200px] resize-none"
              />
              
              {/* Zone d'upload d'images */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Images (optionnel)</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative bg-muted p-2 rounded">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-20 object-cover rounded"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-primary-foreground py-4 text-base"
                  onClick={() => handleSubmit("free")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      Envoyer en mode gratuit (Réponse lente)
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                
                <Button 
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 text-base"
                  onClick={() => handleSubmit("premium")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      Envoyer en mode payant (Réponse rapide)
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Partie Réponse du bot */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Réponse du bot</h2>
            
            {!botResponse ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4" />
                <p>{isLoading ? "En attente de la réponse de l'admin..." : "Aucun pronostic disponible"}</p>
                <p className="text-sm mt-2">
                  {isLoading 
                    ? "L'admin traitera votre requête dès que possible" 
                    : "Envoyez une requête pour obtenir un pronostic"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Match Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">{botResponse.match}</h2>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    <Trophy className="w-4 h-4 mr-2" />MATCH
                  </Badge>
                </div>
                
                {/* Images */}
                {botResponse.images && botResponse.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {botResponse.images.map((image: string, index: number) => (
                      <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Analyse ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Analyse du match */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-primary">Analyse du match</h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {botResponse.matchAnalysis}
                  </p>
                </div>
                
                {/* Nos pronostics */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-secondary">Nos pronostics</h3>
                  <div className="space-y-3">
                    {botResponse.predictions.map((prediction: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span>{prediction}</span>
                        <Badge variant="outline">Cote: {(1.75 + index * 0.1).toFixed(2)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Coupon Gratuit du Jour */}
                <div className="bg-gradient-subtle p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-accent">Coupon Gratuit</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-background border border-border rounded-lg">
                      <p className="text-foreground font-medium whitespace-pre-wrap">
                        {botResponse.freeCoupon}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="secondary">Cote: 3.20</Badge>
                        <Button size="sm" variant="outline">
                          Copier
                        </Button>
                      </div>
                    </div>
                    {botResponse.reasoning && (
                      <div className="mt-2">
                        <Badge variant="outline" className="mb-2">Justification:</Badge>
                        <p className="text-foreground whitespace-pre-wrap">{botResponse.reasoning}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Résumé */}
                {botResponse.summary && (
                  <div className="border-l-4 border-primary pl-4 py-2">
                    <h3 className="text-xl font-semibold mb-2 text-primary">Résumé</h3>
                    <p className="text-foreground font-medium whitespace-pre-wrap">{botResponse.summary}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PronosticRequest;
