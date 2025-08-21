import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, ArrowLeft, Loader2 } from 'lucide-react';
import '../styles/PaymentResult.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [articleId, setArticleId] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'ID de l'article depuis les paramètres de l'URL
    const urlParams = new URLSearchParams(location.search);
    const articleIdParam = urlParams.get('article_id');
    
    console.log('Article ID récupéré:', articleIdParam);
    
    if (articleIdParam) {
      setArticleId(articleIdParam);
    }
    
    setLoading(false);
  }, [location]);

  const handleViewArticle = () => {
    if (articleId) {
      navigate(`/article/${articleId}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="payment-result-container">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p>Vérification du paiement...</p>
      </div>
    );
  }

  return (
    <div className="payment-result-container success">
      <div className="result-icon">
        <CheckCircle size={64} />
      </div>
      <h1>Paiement réussi !</h1>
      <p>Merci pour votre achat. Vous avez maintenant accès au contenu complet de l'article.</p>
      
      {articleId && (
        <div className="payment-info">
          <p>Vous pouvez maintenant accéder à l'article que vous venez de payer.</p>
        </div>
      )}
      
      <div className="action-buttons">
        <button onClick={handleViewArticle} className="view-article-button">
          <ArrowLeft size={20} />
          Voir l'article
        </button>
        <button onClick={() => navigate('/')} className="home-button">
          <Home size={20} />
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;