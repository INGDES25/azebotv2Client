import { useState, useRef, useEffect } from "react";
import { NewHeader } from "@/components/NewHeader";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { db } from "@/integrations/firebase/client";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: Date;
}

const Social = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(true);
  const { user: authUser, profile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!authUser;
  const currentUser = authUser ? {
    name: profile?.full_name || profile?.username || authUser.email || 'Utilisateur',
    avatar: profile?.avatar_url || authUser.photoURL || "/placeholder.svg"
  } : null;

  // Charger les messages du chat depuis Firebase
  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'chatMessages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          username: data.username,
          avatar: data.avatar,
          content: data.content,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toDate() 
            : new Date()
        };
      });
      setMessages(messagesData);
      setLoading(false);
      scrollToBottom();
    }, (error) => {
      console.error("Error fetching chat messages:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages du chat",
        variant: "destructive",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isLoggedIn) return;

    try {
      await addDoc(collection(db, 'chatMessages'), {
        username: currentUser?.name || "Utilisateur",
        avatar: currentUser?.avatar || "/placeholder.svg",
        content: newMessage,
        timestamp: serverTimestamp()
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <NewHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-glow mb-4">
              Espace Social
            </h1>
            <p className="text-muted-foreground">
              Échangez avec la communauté des traders et parieurs
            </p>
          </div>

          {/* Stats */}
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{messages.length} messages • {Math.floor(Math.random() * 50) + 10} utilisateurs en ligne</span>
            </div>
          </Card>

          {/* Chat Container */}
          <Card className="p-6">
            {/* Messages */}
            <div className="h-96 overflow-y-auto mb-4 space-y-4 border rounded-lg p-4 bg-muted/10">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun message pour le moment. Soyez le premier à écrire !
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3">
                    <img 
                      src={message.avatar}
                      alt={message.username}
                      className="w-8 h-8 rounded-full border-2 border-primary/20"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-primary">
                          {message.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {isLoggedIn ? (
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground mb-2">
                  Vous devez être connecté pour participer au chat
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAuthMode("login");
                    setAuthModalOpen(true);
                  }}
                >
                  Se connecter
                </Button>
              </div>
            )}
          </Card>

          {/* Rules */}
          <Card className="p-4 mt-6 bg-muted/30">
            <h3 className="font-semibold mb-2 text-foreground">Règles du chat</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Respectez les autres membres de la communauté</li>
              <li>• Partagez vos expériences de trading et de paris</li>
              <li>• Évitez le spam et les messages répétitifs</li>
              <li>• Les conseils financiers personnels sont interdits</li>
            </ul>
          </Card>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onLogin={() => setAuthModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default Social;
