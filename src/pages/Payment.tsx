import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../integrations/firebase/client';
import { useAuth } from '../hooks/useAuth'; // Ajout de l'import
import { Shield, CreditCard, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import azebotHero from '../assets/azebot-hero.jpg';
import paiementSecurise from '../assets/paiement-securise.png';
//import { API_BASE_URL } from '../config/api';



interface Article {
  id: string;
  title: string;
  content: string;
  price: number;
  images: string[];
  asset?: string;
  match?: string;
}


const API_BASE_URL = 'https://azebot-server.onrender.com' ;


const Payment = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // Récupération de l'utilisateur connecté
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    console.log("Article ID reçu:", articleId);
    
    if (!articleId) {
      setError('ID d\'article manquant');
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        console.log("Tentative de récupération de l'article avec ID:", articleId);
        const articleDoc = await getDoc(doc(db, 'news', articleId));
        console.log("Document existe:", articleDoc.exists());
        
        if (articleDoc.exists()) {
          const data = articleDoc.data();
          console.log("Données de l'article:", data);
          setArticle({
            id: articleDoc.id,
            title: data.title,
            content: data.content,
            price: data.price,
            images: data.images || [],
            asset: data.asset,
            match: data.match
          } as Article);
        } else {
          setError('Article non trouvé dans Firebase');
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'article:", err);
        setError('Erreur lors de la récupération de l\'article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const handlePayment = async () => {
    if (!article) return;

    try {
      setProcessing(true);
      setError(null);
      
      console.log('Envoi de la requête de paiement...');
      
      const response = await axios.post(`${API_BASE_URL}/api/create-payment`, {
        amount: article.price,
        description: `Paiement pour l'article: ${article.title}`,
        customer: {
          firstname: user?.displayName?.split(' ')[0] || 'Prénom',
          lastname: user?.displayName?.split(' ')[1] || 'Nom',
          email: user?.email || 'email@example.com'
        },
        articleId: article.id,
        userId: user?.uid // Ajout de l'ID utilisateur
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Réponse du serveur:', response.data);
      
      if (response.data.success) {
         // Stocker l'ID de l'article dans le localStorage avant la redirection
      localStorage.setItem('lastArticleId', article.id);
      console.log('Article ID stocké dans localStorage:', article.id);
      
        console.log('Redirection vers:', response.data.url);
        window.location.replace(response.data.url);
      } else {
        setError(response.data.error || 'Erreur lors de la création du paiement');
      }
    } catch (err) {
      console.error('Erreur lors du paiement:', err);
      if (err.code === 'ECONNABORTED') {
        setError('La connexion a expiré. Veuillez réessayer.');
      } else if (err.response?.status === 0) {
        setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      } else {
        setError(err.response?.data?.error || 'Une erreur est survenue lors du paiement');
      }
    } finally {
      setProcessing(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      console.log('Test de connexion au backend...');
      const response = await axios.get(`${API_BASE_URL}/api/test`, {
        timeout: 5000
      });
      console.log('Test backend réussi:', response.data);
      return true;
    } catch (err) {
      console.error('Test backend échoué:', err);
      setError('Impossible de communiquer avec le serveur de paiement. Veuillez réessayer plus tard.');
      return false;
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Chargement des détails de l'article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center gap-2 w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Article non trouvé</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 text-purple-400 hover:text-purple-300 underline"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header avec image de fond */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img 
          src={azebotHero} 
          alt="AZEBot Hero" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Paiement sécurisé
          </h1>
          <p className="text-white/80">
            Finalisez votre achat en toute sécurité
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Détails de l'article */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {article.asset || article.match || article.title}
                    </h2>
                    <p className="text-white/70">
                      Analyse exclusive disponible après paiement
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-2">Contenu inclus :</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-white/80">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Analyse détaillée complète</span>
                      </li>
                      <li className="flex items-center gap-2 text-white/80">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Recommandations précises</span>
                      </li>
                      <li className="flex items-center gap-2 text-white/80">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Support client premium</span>
                      </li>
                      <li className="flex items-center gap-2 text-white/80">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Accès immédiat après paiement</span>
                      </li>
                    </ul>
                  </div>

                  {article.content && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="text-white font-semibold mb-2">Aperçu :</h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {article.content.substring(0, 150)}...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Panneau de paiement */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-8">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    {article.price} FCFA
                  </div>
                  <p className="text-white/70 text-sm">Prix unique - Accès illimité</p>
                </div>

                <button 
                  onClick={handlePayment} 
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Payer maintenant
                    </>
                  )}
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Accès immédiat après paiement</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <img 
                    src={paiementSecurise} 
                    alt="Paiement sécurisé" 
                    className="w-full h-16 object-contain opacity-80"
                  />
                  <p className="text-white/60 text-xs text-center mt-2">
                    Vos informations bancaires ne sont jamais stockées
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de sécurité */}
          <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Sécurité maximale</h3>
                <p className="text-white/70 text-sm">
                  Cryptage SSL 256-bit et conformité PCI-DSS
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Paiement instantané</h3>
                <p className="text-white/70 text-sm">
                  Accepte toutes les cartes bancaires et mobile money
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Support 24/7</h3>
                <p className="text-white/70 text-sm">
                  Assistance client disponible à tout moment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;