import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../integrations/firebase/client';
import { useAuth } from '../hooks/useAuth';
import { Lock, Unlock, ArrowLeft, CreditCard, CheckCircle, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface Article {
  id: string;
  title: string;
  content: string;
  price: number;
  images: string[];
  asset?: string;
  match?: string;
  paymentStatus?: 'pending' | 'paid';
  paymentDate?: any;
  paymentAmount?: number;
  paymentMethod?: string;
}

const ArticleDetails = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [checkingCount, setCheckingCount] = useState(0);

  // Fonction pour vérifier le statut de paiement
  const checkTransactionStatus = async () => {
    const transactionId = localStorage.getItem('lastTransactionId');
    if (!transactionId) {
      console.log('Aucun ID de transaction trouvé');
      return;
    }

    try {
      setCheckingPayment(true);
      console.log('🔍 Vérification du statut de la transaction:', transactionId);
      
      const response = await fetch(`${API_BASE_URL}/api/transaction-status/${transactionId}`);
      const data = await response.json();
      console.log('📊 Statut de la transaction:', data.status);

      if (data.status === 'approved') {
        console.log('✅ Transaction approuvée ! Mise à jour de l\'article...');
        // Mettre à jour l'article localement
        setArticle({
          ...article,
          paymentStatus: 'paid',
          paymentDate: new Date(),
          paymentAmount: data.amount / 100,
          paymentMethod: data.mode
        });
        setHasAccess(true);
      } else {
        console.log('⏳ Transaction non encore approuvée');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut de la transaction:', error);
    } finally {
      setCheckingPayment(false);
    }
  };

  useEffect(() => {
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
          const articleData = {
            id: articleDoc.id,
            title: data.title,
            content: data.content,
            price: data.price,
            images: data.images || [],
            asset: data.asset,
            match: data.match,
            paymentStatus: data.paymentStatus || 'pending',
            paymentDate: data.paymentDate,
            paymentAmount: data.paymentAmount,
            paymentMethod: data.paymentMethod
          } as Article;
          
          setArticle(articleData);
          
          // Vérifier si l'utilisateur a accès
          const accessGranted = articleData.paymentStatus === 'paid' || articleData.price === 0;
          setHasAccess(accessGranted);
          
          console.log("Statut de paiement:", articleData.paymentStatus);
          console.log("Accès accordé:", accessGranted);
          
          // Si le statut est pending et que l'article n'est pas gratuit, commencer les vérifications
          if (articleData.paymentStatus === 'pending' && articleData.price > 0) {
            console.log("🚀 Démarrage des vérifications du statut de paiement...");
            checkTransactionStatus();
          }
        } else {
          setError('Article non trouvé');
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

  // Effet pour les vérifications périodiques
  useEffect(() => {
    if (article && article.paymentStatus === 'pending' && article.price > 0 && checkingCount < 12) {
      const timer = setTimeout(() => {
        console.log(`🔄 Vérification automatique (${checkingCount + 1}/12)...`);
        setCheckingCount(prev => prev + 1);
        checkTransactionStatus();
      }, 5000); // Vérifier toutes les 5 secondes
      
      return () => clearTimeout(timer);
    }
  }, [article, checkingCount]);

  const handlePayment = () => {
    if (article) {
      navigate(`/payment/${article.id}`);
    }
  };

  const handleManualRefresh = () => {
    setCheckingCount(0);
    checkTransactionStatus();
  };

  if (loading) {
    return (
      <div className="article-details-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-details-container">
        <div className="error-message">
          <h3>Erreur</h3>
          <p>{error}</p>
        </div>
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-details-container">
        <div className="error-message">
          <h3>Article non trouvé</h3>
          <p>Cet article n'existe pas ou a été supprimé.</p>
        </div>
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="article-details-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="article-header">
        <h1>{article.asset || article.match || article.title}</h1>
        <div className="article-meta">
          {article.price > 0 && (
            <div className={`payment-status ${article.paymentStatus}`}>
              {article.paymentStatus === 'paid' ? (
                <>
                  <Unlock className="w-4 h-4" />
                  Accès payé
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  {article.price} FCFA
                  {checkingPayment && (
                    <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {article.images && article.images.length > 0 && (
        <div className="article-image">
          <img src={article.images[0]} alt={article.title} />
        </div>
      )}

      <div className="article-content">
        {hasAccess ? (
          <div className="content-full">
            <div className="access-badge">
              <CheckCircle className="w-5 h-5" />
              Accès complet
            </div>
            <div className="article-text">
              {article.content}
            </div>
          </div>
        ) : (
          <div className="content-locked">
            <div className="lock-icon">
              <Lock className="w-16 h-16" />
            </div>
            <h2>Contenu réservé aux membres payants</h2>
            <p>Cet article est disponible pour {article.price} FCFA.</p>
            
            {checkingPayment && (
              <div className="checking-status">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <p>Vérification du statut de paiement en cours...</p>
                <p>Tentative {checkingCount}/12</p>
              </div>
            )}
            
            <div className="action-buttons">
              <button onClick={handlePayment} className="pay-button">
                <CreditCard className="w-5 h-5" />
                Payer pour débloquer
              </button>
              <button onClick={handleManualRefresh} className="refresh-button">
                <RefreshCw className="w-5 h-5" />
                Actualiser le statut
              </button>
            </div>
          </div>
        )}
      </div>

      {article.paymentStatus === 'paid' && (
        <div className="payment-info">
          <h3>Informations de paiement</h3>
          <div className="payment-details">
            <div className="detail-item">
              <span className="label">Statut:</span>
              <span className="value paid">Payé</span>
            </div>
            <div className="detail-item">
              <span className="label">Date:</span>
              <span className="value">
                {article.paymentDate?.toDate().toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Montant:</span>
              <span className="value">{article.paymentAmount} FCFA</span>
            </div>
            <div className="detail-item">
              <span className="label">Méthode:</span>
              <span className="value">{article.paymentMethod}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetails;