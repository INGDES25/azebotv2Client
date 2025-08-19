import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Upload } from "lucide-react";
import { auth, db, storage } from "@/integrations/firebase/client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Liste complète des pays
const COUNTRIES = [
  { value: "afghanistan", label: "Afghanistan" },
  { value: "albania", label: "Albanie" },
  { value: "algeria", label: "Algérie" },
  { value: "andorra", label: "Andorre" },
  { value: "angola", label: "Angola" },
  { value: "argentina", label: "Argentine" },
  { value: "armenia", label: "Arménie" },
  { value: "australia", label: "Australie" },
  { value: "austria", label: "Autriche" },
  { value: "azerbaijan", label: "Azerbaïdjan" },
  { value: "bahrain", label: "Bahreïn" },
  { value: "bangladesh", label: "Bangladesh" },
  { value: "belarus", label: "Biélorussie" },
  { value: "belgium", label: "Belgique" },
  { value: "benin", label: "Bénin" },
  { value: "bolivia", label: "Bolivie" },
  { value: "bosnia", label: "Bosnie-Herzégovine" },
  { value: "botswana", label: "Botswana" },
  { value: "brazil", label: "Brésil" },
  { value: "brunei", label: "Brunei" },
  { value: "bulgaria", label: "Bulgarie" },
  { value: "burkina", label: "Burkina Faso" },
  { value: "burundi", label: "Burundi" },
  { value: "cambodia", label: "Cambodge" },
  { value: "cameroon", label: "Cameroun" },
  { value: "canada", label: "Canada" },
  { value: "chad", label: "Tchad" },
  { value: "chile", label: "Chili" },
  { value: "china", label: "Chine" },
  { value: "colombia", label: "Colombie" },
  { value: "congo", label: "Congo" },
  { value: "costa_rica", label: "Costa Rica" },
  { value: "croatia", label: "Croatie" },
  { value: "cuba", label: "Cuba" },
  { value: "cyprus", label: "Chypre" },
  { value: "czech", label: "République tchèque" },
  { value: "denmark", label: "Danemark" },
  { value: "djibouti", label: "Djibouti" },
  { value: "ecuador", label: "Équateur" },
  { value: "egypt", label: "Égypte" },
  { value: "estonia", label: "Estonie" },
  { value: "ethiopia", label: "Éthiopie" },
  { value: "finland", label: "Finlande" },
  { value: "france", label: "France" },
  { value: "gabon", label: "Gabon" },
  { value: "gambia", label: "Gambie" },
  { value: "georgia", label: "Géorgie" },
  { value: "germany", label: "Allemagne" },
  { value: "ghana", label: "Ghana" },
  { value: "greece", label: "Grèce" },
  { value: "guatemala", label: "Guatemala" },
  { value: "guinea", label: "Guinée" },
  { value: "haiti", label: "Haïti" },
  { value: "honduras", label: "Honduras" },
  { value: "hungary", label: "Hongrie" },
  { value: "iceland", label: "Islande" },
  { value: "india", label: "Inde" },
  { value: "indonesia", label: "Indonésie" },
  { value: "iran", label: "Iran" },
  { value: "iraq", label: "Irak" },
  { value: "ireland", label: "Irlande" },
  { value: "israel", label: "Israël" },
  { value: "italy", label: "Italie" },
  { value: "ivory_coast", label: "Côte d'Ivoire" },
  { value: "jamaica", label: "Jamaïque" },
  { value: "japan", label: "Japon" },
  { value: "jordan", label: "Jordanie" },
  { value: "kazakhstan", label: "Kazakhstan" },
  { value: "kenya", label: "Kenya" },
  { value: "kuwait", label: "Koweït" },
  { value: "latvia", label: "Lettonie" },
  { value: "lebanon", label: "Liban" },
  { value: "libya", label: "Libye" },
  { value: "lithuania", label: "Lituanie" },
  { value: "luxembourg", label: "Luxembourg" },
  { value: "madagascar", label: "Madagascar" },
  { value: "malawi", label: "Malawi" },
  { value: "malaysia", label: "Malaisie" },
  { value: "mali", label: "Mali" },
  { value: "malta", label: "Malte" },
  { value: "mauritania", label: "Mauritanie" },
  { value: "mauritius", label: "Maurice" },
  { value: "mexico", label: "Mexique" },
  { value: "morocco", label: "Maroc" },
  { value: "mozambique", label: "Mozambique" },
  { value: "namibia", label: "Namibie" },
  { value: "nepal", label: "Népal" },
  { value: "netherlands", label: "Pays-Bas" },
  { value: "new_zealand", label: "Nouvelle-Zélande" },
  { value: "nicaragua", label: "Nicaragua" },
  { value: "niger", label: "Niger" },
  { value: "nigeria", label: "Nigeria" },
  { value: "north_korea", label: "Corée du Nord" },
  { value: "norway", label: "Norvège" },
  { value: "oman", label: "Oman" },
  { value: "pakistan", label: "Pakistan" },
  { value: "panama", label: "Panama" },
  { value: "paraguay", label: "Paraguay" },
  { value: "peru", label: "Pérou" },
  { value: "philippines", label: "Philippines" },
  { value: "poland", label: "Pologne" },
  { value: "portugal", label: "Portugal" },
  { value: "qatar", label: "Qatar" },
  { value: "romania", label: "Roumanie" },
  { value: "russia", label: "Russie" },
  { value: "rwanda", label: "Rwanda" },
  { value: "saudi_arabia", label: "Arabie Saoudite" },
  { value: "senegal", label: "Sénégal" },
  { value: "serbia", label: "Serbie" },
  { value: "singapore", label: "Singapour" },
  { value: "slovakia", label: "Slovaquie" },
  { value: "slovenia", label: "Slovénie" },
  { value: "somalia", label: "Somalie" },
  { value: "south_africa", label: "Afrique du Sud" },
  { value: "south_korea", label: "Corée du Sud" },
  { value: "spain", label: "Espagne" },
  { value: "sri_lanka", label: "Sri Lanka" },
  { value: "sudan", label: "Soudan" },
  { value: "sweden", label: "Suède" },
  { value: "switzerland", label: "Suisse" },
  { value: "syria", label: "Syrie" },
  { value: "taiwan", label: "Taïwan" },
  { value: "tanzania", label: "Tanzanie" },
  { value: "thailand", label: "Thaïlande" },
  { value: "togo", label: "Togo" },
  { value: "tunisia", label: "Tunisie" },
  { value: "turkey", label: "Turquie" },
  { value: "uganda", label: "Ouganda" },
  { value: "ukraine", label: "Ukraine" },
  { value: "uae", label: "Émirats Arabes Unis" },
  { value: "uk", label: "Royaume-Uni" },
  { value: "usa", label: "États-Unis" },
  { value: "uruguay", label: "Uruguay" },
  { value: "venezuela", label: "Venezuela" },
  { value: "vietnam", label: "Vietnam" },
  { value: "yemen", label: "Yémen" },
  { value: "zambia", label: "Zambie" },
  { value: "zimbabwe", label: "Zimbabwe" }
];


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  onLogin: (user: { name: string; avatar: string; isAdmin?: boolean; email: string }) => void;
}

export const AuthModal = ({ isOpen, onClose, mode, onModeChange, onLogin }: AuthModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    country: "",
    phone: "",
    interest: "",
    password: "",
    confirmPassword: "",
    avatar: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "login") {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Vérifier si c'est l'admin
        if (user.email === "admin@azebot.com") {
          onLogin({
            name: "Administrateur",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
            isAdmin: true,
            email: user.email
          });
          return;
        }
        
        onLogin({
          name: user.displayName || user.email,
          avatar: user.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
          isAdmin: false,
          email: user.email
        });
      } catch (error) {
        console.error("Error logging in:", error);
        alert("Email ou mot de passe incorrect");
      }
    } else {
      // Validation des mots de passe
      if (formData.password !== formData.confirmPassword) {
        alert("Les mots de passe ne correspondent pas");
        return;
      }
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Uploader la photo de profil si elle existe
        let avatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face";
        if (formData.avatar) {
          try {
            const storageRef = ref(storage, `profiles/${user.uid}/avatar`);
            await uploadBytes(storageRef, formData.avatar);
            avatarUrl = await getDownloadURL(storageRef);
          } catch (error) {
            console.error("Error uploading profile image:", error);
            alert("Votre photo de profil n'a pas pu être téléchargée, mais votre compte a été créé.");
          }
        }
        
        // Créer le profil dans Firestore
        await setDoc(doc(db, "profiles", user.uid), {
          user_id: user.uid,
          username: formData.username,
          full_name: formData.fullName,
          avatar_url: avatarUrl,
          country: formData.country,
          phone: formData.phone,
          interests: [formData.interest],
          role: "user",
          email: user.email,
          created_at: new Date()
        });
        
        // Connecter l'utilisateur
        setTimeout(() => {
          onLogin({
            name: formData.fullName || formData.username,
            avatar: avatarUrl,
            isAdmin: false,
            email: user.email
          });
        }, 1000);
      } catch (error) {
        console.error("Error registering:", error);
        alert("Une erreur est survenue lors de l'inscription");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, avatar: e.target.files[0] });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-glow">
            {mode === "login" ? "Se connecter" : "Ouvrir un compte"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="bg-muted border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-muted border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Pays *</Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                  >
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Sélectionner un pays" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto bg-background border-border z-50">
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-muted border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest">Intérêt *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, interest: value })}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Sélectionner votre intérêt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trader">Trader</SelectItem>
                    <SelectItem value="parieur">Parieur</SelectItem>
                    <SelectItem value="both">Les deux</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Photo de profil</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("avatar")?.click()}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {formData.avatar ? formData.avatar.name : "Choisir une photo"}
                  </Button>
                </div>
              </div>
            </>
          )}

          {mode === "login" && (
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-muted border-border"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-muted border-border pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="bg-muted border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm">Se souvenir de moi</Label>
              </div>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {mode === "login" ? "Se connecter" : "Créer mon compte"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => onModeChange(mode === "login" ? "register" : "login")}
              className="text-sm text-primary hover:underline"
            >
              {mode === "login" 
                ? "Pas encore de compte ? S'inscrire" 
                : "Déjà un compte ? Se connecter"
              }
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
