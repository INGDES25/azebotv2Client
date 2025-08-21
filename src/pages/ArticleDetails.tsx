import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../integrations/firebase/client';
import { ArrowLeft } from 'lucide-react';
import '../styles/ArticleDetails.css';

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
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          console.log("Article récupéré avec succès");
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
                  ✓ Payé
                </>
              ) : (
                <>
                  {article.price} FCFA
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
        <div className="article-text">
          {article.content}
        </div>
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