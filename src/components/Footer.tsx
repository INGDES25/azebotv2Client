import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const Footer = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    message: ""
  });
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Envoyer le message à Firebase
      await addDoc(collection(db, 'contactMessages'), {
        name: contactForm.fullName,
        email: contactForm.email,
        content: contactForm.message,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès. Nous vous répondrons bientôt."
      });
      
      setIsContactModalOpen(false);
      setContactForm({ fullName: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLinks = [
    { label: "Trading", href: "/trading" },
    { label: "Pronostic", href: "/pronostic" },
    { label: "Social", href: "/social" },
    { label: "À propos", href: "/about" }
  ];

  return (
    <footer className="bg-gradient-secondary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">AZ</span>
              </div>
              <span className="text-2xl font-bold text-glow">AZEBot</span>
            </div>
            <p className="text-muted-foreground">
              Votre partenaire intelligent pour les analyses de trading et les pronostics sportifs. 
              Des analyses quotidiennes précises pour maximiser vos opportunités.
            </p>
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center bot-float">
                <span className="text-primary font-bold">🤖</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Liens rapides</h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1"
                >
                  {link.label}
                </a>
              ))}
              <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
                <DialogTrigger asChild>
                  <button className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1">
                    Nous écrire
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold text-glow">
                      Nous contacter
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nom complet *</Label>
                      <Input
                        id="contactName"
                        value={contactForm.fullName}
                        onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                        required
                        className="bg-muted border-border"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                        className="bg-muted border-border"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactMessage">Message *</Label>
                      <Textarea
                        id="contactMessage"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                        rows={4}
                        className="bg-muted border-border resize-none"
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Envoi en cours..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cotonou, Bénin</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp:</p>
                  <a 
                    href="https://wa.me/2290196218486" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-secondary/80 transition-colors"
                  >
                    +229 01 96 21 84 86
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
                    <DialogTrigger asChild>
                      <button className="text-accent hover:text-accent/80 transition-colors text-sm">
                        Formulaire de contact
                      </button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              © 2024 AZEBot. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-muted-foreground">Powered by AI Trading Intelligence</span>
              <div className="w-6 h-6 bg-gradient-primary rounded-full animate-pulse-glow"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
