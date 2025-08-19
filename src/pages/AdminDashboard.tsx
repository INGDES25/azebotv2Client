import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Send, 
  Plus, 
  Eye,
  Calendar,
  Users,
  Upload,
  X,
  Loader2
} from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { 
  doc, 
  setDoc, 
  updateDoc,
  collection, 
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { uploadProfileImage } from "@/integrations/supabase/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  
  // Protection d'accès admin
  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/auth');
    }
  }, [user, profile, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-glow mb-2">AZEBot Admin</div>
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }
  
  if (!user || profile?.role !== 'admin') {
    return null;
  }

  // States pour les formulaires
  const [forexContent, setForexContent] = useState("");
  const [footballContent, setFootballContent] = useState("");
  const [tradingForm, setTradingForm] = useState({
    asset: "",
    images: [] as File[],
    technicalAnalysis: "",
    fundamentalAnalysis: "",
    signals: "",
    reasoning: "",
    summary: "",
    price: 500
  });
  const [pronosticForm, setPronosticForm] = useState({
    match: "",
    images: [] as File[],
    imageUrls: [] as string[],
    analysis: "",
    predictions: "",
    coupon: "",
    summary: "",
    price: 500
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedPronosticRequest, setSelectedPronosticRequest] = useState<any>(null);
  const [isPronosticResponseModalOpen, setIsPronosticResponseModalOpen] = useState(false);
  const [responseForm, setResponseForm] = useState({
    asset: "",
    images: [] as File[],
    technicalAnalysis: "",
    fundamentalAnalysis: "",
    signals: ""
  });
  const [pronosticResponseForm, setPronosticResponseForm] = useState({
    match: "",
    images: [] as File[],
    imageUrls: [] as string[],
    analysis: "",
    predictions: "",
    coupon: "",
    reasoning: "",
    summary: ""
  });

  // Charger les messages de contact
  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'contactMessages'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          content: data.content,
          date: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toLocaleString('fr-FR') 
            : new Date().toLocaleString('fr-FR'),
          status: data.status
        };
      });
      setMessages(messagesData);
      setLoadingMessages(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
      setLoadingMessages(false);
    });
    
    return () => unsubscribe();
  }, [db, toast]);

  // Charger les requêtes en attente
  useEffect(() => {
    setLoadingRequests(true);
    
    const requestsQuery = query(
      collection(db, 'userRequests'),
      orderBy('createdAt', 'desc')
    );
    
    const pronosticRequestsQuery = query(
      collection(db, 'userPronosticRequests'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'analysis',
          ...data,
          date: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toLocaleString('fr-FR') 
            : new Date().toLocaleString('fr-FR')
        };
      });
      
      onSnapshot(pronosticRequestsQuery, (pronosticSnapshot) => {
        const pronosticRequestsData = pronosticSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: 'pronostic',
            ...data,
            date: data.createdAt instanceof Timestamp 
              ? data.createdAt.toDate().toLocaleString('fr-FR') 
              : new Date().toLocaleString('fr-FR')
          };
        });
        
        setPendingRequests([...requestsData, ...pronosticRequestsData]);
        setLoadingRequests(false);
      });
    }, (error) => {
      console.error("Error fetching requests:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les requêtes en attente",
        variant: "destructive",
      });
      setLoadingRequests(false);
    });
    
    return () => unsubscribeRequests();
  }, [db, toast]);

  const handlePublishForex = async () => {
    if (forexContent.trim()) {
      try {
        await addDoc(collection(db, "news"), {
          type: "forex",
          title: "Actualité Forex",
          content: forexContent,
          updatedAt: new Date(),
        });
        setForexContent("");
        toast({
          title: "Actualité Forex publiée",
          description: "L'actualité Forex a été ajoutée aux actualités récentes.",
        });
      } catch (error) {
        console.error("Error publishing forex content:", error);
        toast({
          title: "Erreur",
          description: "Impossible de publier l'actualité Forex",
          variant: "destructive",
        });
      }
    }
  };

  const handlePublishFootball = async () => {
    if (footballContent.trim()) {
      try {
        await addDoc(collection(db, "news"), {
          type: "football",
          title: "Actualité Football",
          content: footballContent,
          updatedAt: new Date(),
        });
        setFootballContent("");
        toast({
          title: "Actualité Football publiée",
          description: "L'actualité Football a été ajoutée aux actualités récentes.",
        });
      } catch (error) {
        console.error("Error publishing football content:", error);
        toast({
          title: "Erreur",
          description: "Impossible de publier l'actualité Football",
          variant: "destructive",
        });
      }
    }
  };

  const handleSavePronosticDraft = () => {
    toast({
      title: "Brouillon sauvegardé",
      description: "Le pronostic a été mis en attente"
    });
  };

  const handlePublishTrading = async () => {
    if (tradingForm.asset && tradingForm.technicalAnalysis) {
      try {
        // Upload images to Supabase storage first
        const imageUrls = [];
        for (const image of tradingForm.images) {
          const url = await uploadProfileImage(image, user?.uid || 'admin');
          imageUrls.push(url);
        }
        
        // Store the trading analysis in Firebase as news item
        await addDoc(collection(db, "news"), {
          type: "forex",
          title: tradingForm.asset,
          content: tradingForm.summary || tradingForm.technicalAnalysis.substring(0, 100) + '...',
          asset: tradingForm.asset,
          price: tradingForm.price,
          signals: tradingForm.signals,
          technicalAnalysis: tradingForm.technicalAnalysis,
          fundamentalAnalysis: tradingForm.fundamentalAnalysis,
          reasoning: tradingForm.reasoning,
          summary: tradingForm.summary,
          images: imageUrls,
          updatedAt: new Date(),
        });
        
        toast({
          title: "Analyse Forex publiée",
          description: "L'analyse est maintenant visible dans le carrousel Actualités"
        });
        
        setTradingForm({
          asset: "",
          images: [],
          technicalAnalysis: "",
          fundamentalAnalysis: "",
          signals: "",
          reasoning: "",
          summary: "",
          price: 500
        });
      } catch (error) {
        console.error("Error publishing trading analysis:", error);
        toast({
          title: "Erreur",
          description: "Impossible de publier l'analyse Forex",
          variant: "destructive",
        });
      }
    }
  };

  const handlePublishPronostic = async () => {
    if (pronosticForm.match && pronosticForm.analysis) {
      try {
        // Upload images to Supabase storage first
        const imageUrls = [];
        for (const image of pronosticForm.images) {
          const url = await uploadProfileImage(image, user?.uid || 'admin');
          imageUrls.push(url);
        }
        
        // Store the pronostic in Firebase as news item
        await addDoc(collection(db, "news"), {
          type: "football",
          title: pronosticForm.match,
          content: pronosticForm.summary || pronosticForm.analysis.substring(0, 100) + '...',
          match: pronosticForm.match,
          price: pronosticForm.price,
          analysis: pronosticForm.analysis,
          predictions: pronosticForm.predictions,
          coupon: pronosticForm.coupon,
          images: imageUrls,
          updatedAt: new Date(),
        });
        
        toast({
          title: "Pronostic publié",
          description: "Le pronostic est maintenant visible dans le carrousel Actualités"
        });
        
        setPronosticForm({
          match: "",
          images: [],
          imageUrls: [],
          analysis: "",
          predictions: "",
          coupon: "",
          summary: "",
          price: 500
        });
      } catch (error) {
        console.error("Error publishing pronostic:", error);
        toast({
          title: "Erreur",
          description: "Impossible de publier le pronostic",
          variant: "destructive",
        });
      }
    }
  };

  const handleTradingImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setTradingForm({...tradingForm, images: [...tradingForm.images, ...files]});
  };

  const handlePronosticImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPronosticForm({...pronosticForm, images: [...pronosticForm.images, ...files]});
  };

  const removeTradingImage = (index: number) => {
    const newImages = tradingForm.images.filter((_, i) => i !== index);
    setTradingForm({...tradingForm, images: newImages});
  };

  const removePronosticImage = (index: number) => {
    const newImages = pronosticForm.images.filter((_, i) => i !== index);
    setPronosticForm({...pronosticForm, images: newImages});
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Admin */}
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-glow">Admin AZEBot</h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Administrateur</Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  navigate("/");
                  window.location.reload();
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir le site
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
              Trading
            </Button>
            <Button
              variant={activeTab === "pronostic" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("pronostic")}
            >
              <Target className="w-4 h-4 mr-2" />
              Pronostic
            </Button>
            <Button
              variant={activeTab === "requests" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("requests")}
            >
              <Send className="w-4 h-4 mr-2" />
              Requêtes
            </Button>
            <Button
              variant={activeTab === "messages" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("messages")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages & Avis
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
              Trading
            </Button>
            <Button
              variant={activeTab === "pronostic" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("pronostic")}
            >
              <Target className="w-4 h-4 mr-1" />
              Pronostic
            </Button>
            <Button
              variant={activeTab === "requests" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("requests")}
            >
              <Send className="w-4 h-4 mr-1" />
              Requêtes
            </Button>
            <Button
              variant={activeTab === "messages" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("messages")}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Messages
            </Button>
          </div>
        </div>

        {/* Contenu principal */}
        <main className="flex-1 overflow-auto p-4">
          <div className="container mx-auto">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">523</p>
                    <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-secondary" />
                  <div>
                    <p className="text-2xl font-bold">45</p>
                    <p className="text-sm text-muted-foreground">Analyses Trading</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">38</p>
                    <p className="text-sm text-muted-foreground">Pronostics</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Send className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{pendingRequests.length}</p>
                    <p className="text-sm text-muted-foreground">Requêtes</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{messages.length}</p>
                    <p className="text-sm text-muted-foreground">Messages</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contenu des onglets */}
            {activeTab === "home" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Actualité sur le Forex</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="asset">Élément analysé</Label>
                        <Input
                          id="asset"
                          value={tradingForm.asset}
                          onChange={(e) => setTradingForm({...tradingForm, asset: e.target.value})}
                          placeholder="ex: EUR/USD, CAC40..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="signals">Signaux (Setup)</Label>
                        <Input
                          id="signals"
                          value={tradingForm.signals}
                          onChange={(e) => setTradingForm({...tradingForm, signals: e.target.value})}
                          placeholder="ACHAT, VENTE..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="images">Images à uploader</Label>
                        <Input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setTradingForm({...tradingForm, images: [...tradingForm.images, ...files]});
                          }}
                        />
                        {tradingForm.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {tradingForm.images.map((image, index) => (
                              <div key={index} className="relative bg-muted p-2 rounded flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                <span className="text-sm truncate max-w-[120px]">{image.name}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newImages = tradingForm.images.filter((_, i) => i !== index);
                                    setTradingForm({...tradingForm, images: newImages});
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="technical">Analyse Technique</Label>
                        <Textarea
                          id="technical"
                          value={tradingForm.technicalAnalysis}
                          onChange={(e) => setTradingForm({...tradingForm, technicalAnalysis: e.target.value})}
                          placeholder="Analyse technique détaillée..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="fundamental">Analyse Fondamentale</Label>
                        <Textarea
                          id="fundamental"
                          value={tradingForm.fundamentalAnalysis}
                          onChange={(e) => setTradingForm({...tradingForm, fundamentalAnalysis: e.target.value})}
                          placeholder="Analyse fondamentale..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Prix de l'analyse (FCFA)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={tradingForm.price}
                          onChange={(e) => setTradingForm({...tradingForm, price: Number(e.target.value)})}
                          placeholder="ex: 500"
                        />
                      </div>
                      <Button onClick={handlePublishTrading} className="bg-gradient-primary text-primary-foreground w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Publier
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Actualité sur le Football</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="match">Match analysé</Label>
                        <Input
                          id="match"
                          value={pronosticForm.match}
                          onChange={(e) => setPronosticForm({...pronosticForm, match: e.target.value})}
                          placeholder="ex: PSG vs Real Madrid"
                        />
                      </div>
                      <div>
                        <Label htmlFor="predictions">Pronostics donnés</Label>
                        <Textarea
                          id="predictions"
                          value={pronosticForm.predictions}
                          onChange={(e) => setPronosticForm({...pronosticForm, predictions: e.target.value})}
                          placeholder="Liste des pronostics..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="images">Images à uploader</Label>
                        <Input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setPronosticForm({...pronosticForm, images: [...pronosticForm.images, ...files]});
                          }}
                        />
                        {pronosticForm.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {pronosticForm.images.map((image, index) => (
                              <div key={index} className="relative bg-muted p-2 rounded flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                <span className="text-sm truncate max-w-[120px]">{image.name}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newImages = pronosticForm.images.filter((_, i) => i !== index);
                                    setPronosticForm({...pronosticForm, images: newImages});
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="matchAnalysis">Analyse du match</Label>
                        <Textarea
                          id="matchAnalysis"
                          value={pronosticForm.analysis}
                          onChange={(e) => setPronosticForm({...pronosticForm, analysis: e.target.value})}
                          placeholder="Analyse détaillée du match..."
                          rows={6}
                        />
                      </div>
                      <div>
                        <Label htmlFor="coupon">Coupons gratuits</Label>
                        <Textarea
                          id="coupon"
                          value={pronosticForm.coupon}
                          onChange={(e) => setPronosticForm({...pronosticForm, coupon: e.target.value})}
                          placeholder="Détails des coupons gratuits..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Prix de l'analyse (FCFA)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={pronosticForm.price}
                          onChange={(e) => setPronosticForm({...pronosticForm, price: Number(e.target.value)})}
                          placeholder="ex: 500"
                        />
                      </div>
                      <Button onClick={handlePublishPronostic} className="bg-gradient-primary text-primary-foreground w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Publier
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "trading" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Nouvelle Analyse Trading</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="asset">Élément analysé</Label>
                      <Input
                        id="asset"
                        value={tradingForm.asset}
                        onChange={(e) => setTradingForm({...tradingForm, asset: e.target.value})}
                        placeholder="ex: EUR/USD, CAC40..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="signals">Signaux (Setup)</Label>
                      <Input
                        id="signals"
                        value={tradingForm.signals}
                        onChange={(e) => setTradingForm({...tradingForm, signals: e.target.value})}
                        placeholder="ACHAT, VENTE..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="reasoning">Justification des signaux</Label>
                      <Textarea
                        id="reasoning"
                        value={tradingForm.reasoning}
                        onChange={(e) => setTradingForm({...tradingForm, reasoning: e.target.value})}
                        placeholder="Pourquoi ces signaux..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tradingImages">Images (Upload multiple)</Label>
                      <div className="space-y-2">
                        <Input
                          id="tradingImages"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleTradingImageUpload}
                          className="cursor-pointer"
                        />
                        {tradingForm.images.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tradingForm.images.map((image, index) => (
                              <div key={index} className="relative bg-muted p-2 rounded flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                <span className="text-sm truncate max-w-[120px]">{image.name}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeTradingImage(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="technical">Analyse Technique</Label>
                      <Textarea
                        id="technical"
                        value={tradingForm.technicalAnalysis}
                        onChange={(e) => setTradingForm({...tradingForm, technicalAnalysis: e.target.value})}
                        placeholder="Analyse technique détaillée..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fundamental">Analyse Fondamentale</Label>
                      <Textarea
                        id="fundamental"
                        value={tradingForm.fundamentalAnalysis}
                        onChange={(e) => setTradingForm({...tradingForm, fundamentalAnalysis: e.target.value})}
                        placeholder="Analyse fondamentale..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="summary">Résumé</Label>
                  <Textarea
                    id="summary"
                    value={tradingForm.summary}
                    onChange={(e) => setTradingForm({...tradingForm, summary: e.target.value})}
                    placeholder="Résumé de l'analyse..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={handleSavePronosticDraft}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter (Brouillon)
                  </Button>
                  <Button onClick={handlePublishTrading} className="bg-gradient-primary text-primary-foreground">
                    <Send className="w-4 h-4 mr-2" />
                    Publier
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "pronostic" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Nouveau Pronostic</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="match">Match analysé</Label>
                      <Input
                        id="match"
                        value={pronosticForm.match}
                        onChange={(e) => setPronosticForm({...pronosticForm, match: e.target.value})}
                        placeholder="ex: PSG vs Real Madrid"
                      />
                    </div>
                    <div>
                      <Label htmlFor="predictions">Pronostics donnés</Label>
                      <Textarea
                        id="predictions"
                        value={pronosticForm.predictions}
                        onChange={(e) => setPronosticForm({...pronosticForm, predictions: e.target.value})}
                        placeholder="Liste des pronostics..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pronosticImages">Images (Upload multiple)</Label>
                      <div className="space-y-2">
                        <Input
                          id="pronosticImages"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handlePronosticImageUpload}
                          className="cursor-pointer"
                        />
                        {pronosticForm.images.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {pronosticForm.images.map((image, index) => (
                              <div key={index} className="relative bg-muted p-2 rounded flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                <span className="text-sm truncate max-w-[120px]">{image.name}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removePronosticImage(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="matchAnalysis">Analyse du match</Label>
                      <Textarea
                        id="matchAnalysis"
                        value={pronosticForm.analysis}
                        onChange={(e) => setPronosticForm({...pronosticForm, analysis: e.target.value})}
                        placeholder="Analyse détaillée du match..."
                        rows={6}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="coupon">Coupons gratuits</Label>
                  <Textarea
                    id="coupon"
                    value={pronosticForm.coupon}
                    onChange={(e) => setPronosticForm({...pronosticForm, coupon: e.target.value})}
                    placeholder="Détails des coupons gratuits..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={handleSavePronosticDraft}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter (Brouillon)
                  </Button>
                  <Button onClick={handlePublishPronostic} className="bg-gradient-primary text-primary-foreground">
                    <Send className="w-4 h-4 mr-2" />
                    Publier
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "requests" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Requêtes en attente</h2>
                
                {loadingRequests ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune requête en attente pour le moment
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <Card 
                        key={request.id} 
                        className="p-4 border-l-4 border-l-primary cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          if (request.type === 'analysis') {
                            setSelectedRequest(request);
                            setIsResponseModalOpen(true);
                          } else if (request.type === 'pronostic') {
                            setSelectedPronosticRequest(request);
                            setIsPronosticResponseModalOpen(true);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold">
                                {request.type === 'analysis' ? 'Analyse' : 'Pronostic'}
                              </span>
                              <Badge variant="outline">
                                Mode {request.mode === 'free' ? 'gratuit' : 'payant'}
                              </Badge>
                            </div>
                            <p className="text-foreground mb-2 line-clamp-2">{request.text}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {request.date}
                            </div>
                            {request.images && request.images.length > 0 && (
                              <div className="mt-2 flex gap-2">
                                {request.images.slice(0, 2).map((image: string, index: number) => (
                                  <img 
                                    key={index} 
                                    src={image} 
                                    alt="Preview" 
                                    className="w-12 h-12 object-cover rounded border" 
                                  />
                                ))}
                                {request.images.length > 2 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{request.images.length - 2} autres
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={request.mode === 'free' ? 'secondary' : 'default'}>
                              {request.mode === 'free' ? 'Gratuit' : 'Payant'}
                            </Badge>
                            {request.type === 'analysis' ? (
                              <Button size="sm" variant="outline">
                                <Send className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {activeTab === "messages" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Messages des Utilisateurs</h2>
                
                {loadingMessages ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun message reçu pour le moment
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card key={message.id} className="p-4 border-l-4 border-l-primary">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold">{message.name}</span>
                              <span className="text-sm text-muted-foreground">{message.email}</span>
                            </div>
                            <p className="text-foreground mb-2">{message.content}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {message.date}
                            </div>
                            {message.status === 'new' && (
                              <Badge variant="secondary" className="mt-2">Nouveau</Badge>
                            )}
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Modal de réponse pour les requêtes d'analyse */}
      <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Répondre à la requête d'analyse</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label>Élément analysé</Label>
                <Input
                  value={responseForm.asset}
                  onChange={(e) => setResponseForm({...responseForm, asset: e.target.value})}
                  placeholder="ex: EUR/USD"
                />
              </div>
              
              <div>
                <Label>Images à uploader</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setResponseForm({...responseForm, images: [...responseForm.images, ...files]});
                  }}
                />
                {responseForm.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {responseForm.images.map((image, index) => (
                      <div key={index} className="relative bg-muted p-2 rounded">
                        <span className="text-sm">{image.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 absolute -top-1 -right-1"
                          onClick={() => {
                            const newImages = responseForm.images.filter((_, i) => i !== index);
                            setResponseForm({...responseForm, images: newImages});
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <Label>Analyse technique</Label>
                <Textarea
                  value={responseForm.technicalAnalysis}
                  onChange={(e) => setResponseForm({...responseForm, technicalAnalysis: e.target.value})}
                  rows={4}
                  placeholder="Analyse technique détaillée..."
                />
              </div>
              
              <div>
                <Label>Analyse fondamentale</Label>
                <Textarea
                  value={responseForm.fundamentalAnalysis}
                  onChange={(e) => setResponseForm({...responseForm, fundamentalAnalysis: e.target.value})}
                  rows={4}
                  placeholder="Analyse fondamentale..."
                />
              </div>
              
              <div>
                <Label>Setup</Label>
                <Input
                  value={responseForm.signals}
                  onChange={(e) => setResponseForm({...responseForm, signals: e.target.value})}
                  placeholder="ex: ACHAT"
                />
              </div>
              
              <Button
                onClick={async () => {
                  if (!selectedRequest) return;
                  
                  try {
                    // Upload des images
                    const imageUrls = [];
                    for (const image of responseForm.images) {
                      const url = await uploadProfileImage(image, user?.uid || 'admin');
                      imageUrls.push(url);
                    }
                    
                    // Mise à jour de la requête avec la réponse
                    await updateDoc(doc(db, "userRequests", selectedRequest.id), {
                      response: {
                        asset: responseForm.asset,
                        images: imageUrls,
                        technicalAnalysis: responseForm.technicalAnalysis,
                        fundamentalAnalysis: responseForm.fundamentalAnalysis,
                        signals: responseForm.signals,
                        createdAt: new Date().toISOString()
                      },
                      status: "answered"
                    });
                    
                    toast({
                      title: "Réponse envoyée",
                      description: "La réponse a été envoyée à l'utilisateur"
                    });
                    
                    setIsResponseModalOpen(false);
                    setResponseForm({
                      asset: "",
                      images: [],
                      technicalAnalysis: "",
                      fundamentalAnalysis: "",
                      signals: ""
                    });
                  } catch (error) {
                    console.error("Error sending response:", error);
                    toast({
                      title: "Erreur",
                      description: "Impossible d'envoyer la réponse",
                      variant: "destructive"
                    });
                  }
                }}
                className="w-full bg-gradient-primary text-primary-foreground"
              >
                <Send className="w-4 h-4 mr-2" />
                Envoyer la réponse
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de réponse pour les requêtes de pronostic */}
      <Dialog open={isPronosticResponseModalOpen} onOpenChange={setIsPronosticResponseModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Répondre à la requête de pronostic</DialogTitle>
          </DialogHeader>
          
          {selectedPronosticRequest && (
            <div className="space-y-4">
              <div>
                <Label>Match analysé</Label>
                <Input
                  value={pronosticResponseForm.match}
                  onChange={(e) => setPronosticResponseForm({...pronosticResponseForm, match: e.target.value})}
                  placeholder="ex: PSG vs Real Madrid"
                />
              </div>
              
              <div>
                <Label>Images à uploader</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setPronosticResponseForm({...pronosticResponseForm, images: [...pronosticResponseForm.images, ...files]});
                  }}
                />
                {pronosticResponseForm.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pronosticResponseForm.images.map((image, index) => (
                      <div key={index} className="relative bg-muted p-2 rounded">
                        <span className="text-sm">{image.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 absolute -top-1 -right-1"
                          onClick={() => {
                            const newImages = pronosticResponseForm.images.filter((_, i) => i !== index);
                            setPronosticResponseForm({...pronosticResponseForm, images: newImages});
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <Label>Analyse du match</Label>
                <Textarea
                  value={pronosticResponseForm.analysis}
                  onChange={(e) => setPronosticResponseForm({...pronosticResponseForm, analysis: e.target.value})}
                  rows={4}
                  placeholder="Analyse détaillée du match..."
                />
              </div>
              
              <div>
                <Label>Nos pronostics</Label>
                <Textarea
                  value={pronosticResponseForm.predictions}
                  onChange={(e) => setPronosticResponseForm({...pronosticResponseForm, predictions: e.target.value})}
                  rows={3}
                  placeholder="Liste des pronostics..."
                />
              </div>
              
              <div>
                <Label>Coupon gratuit</Label>
                <Textarea
                  value={pronosticResponseForm.coupon}
                  onChange={(e) => setPronosticResponseForm({...pronosticResponseForm, coupon: e.target.value})}
                  rows={2}
                  placeholder="Détails du coupon gratuit..."
                />
              </div>
              
              <div>
                <Label>Justification</Label>
                <Textarea
                  value={pronosticResponseForm.reasoning}
                  onChange={(e) => setPronosticResponseForm({...pronosticResponseForm, reasoning: e.target.value})}
                  rows={2}
                  placeholder="Justification des pronostics..."
                />
              </div>
              
              <div>
                <Label>Résumé</Label>
                <Textarea
                  value={pronosticResponseForm.summary}
                  onChange={(e) => setPronosticResponseForm({...pronosticResponseForm, summary: e.target.value})}
                  rows={2}
                  placeholder="Résumé de l'analyse..."
                />
              </div>
              
              <Button
                onClick={async () => {
                  if (!selectedPronosticRequest) return;
                  
                  try {
                    // Upload des images
                    const imageUrls = [];
                    for (const image of pronosticResponseForm.images) {
                      const url = await uploadProfileImage(image, user?.uid || 'admin');
                      imageUrls.push(url);
                    }
                    
                    // Mise à jour de la requête avec la réponse
                    await updateDoc(doc(db, "userPronosticRequests", selectedPronosticRequest.id), {
                      response: {
                        match: pronosticResponseForm.match,
                        images: imageUrls,
                        matchAnalysis: pronosticResponseForm.analysis,
                        predictions: pronosticResponseForm.predictions.split('\n').filter(p => p.trim()),
                        freeCoupon: pronosticResponseForm.coupon,
                        reasoning: pronosticResponseForm.reasoning,
                        summary: pronosticResponseForm.summary,
                        createdAt: new Date().toISOString()
                      },
                      status: "answered"
                    });
                    
                    toast({
                      title: "Réponse envoyée",
                      description: "La réponse a été envoyée à l'utilisateur"
                    });
                    
                    setIsPronosticResponseModalOpen(false);
                    setPronosticResponseForm({
                      match: "",
                      images: [],
                      imageUrls: [],
                      analysis: "",
                      predictions: "",
                      coupon: "",
                      reasoning: "",
                      summary: ""
                    });
                  } catch (error) {
                    console.error("Error sending pronostic response:", error);
                    toast({
                      title: "Erreur",
                      description: "Impossible d'envoyer la réponse",
                      variant: "destructive"
                    });
                  }
                }}
                className="w-full bg-gradient-primary text-primary-foreground"
              >
                <Send className="w-4 h-4 mr-2" />
                Envoyer la réponse
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;