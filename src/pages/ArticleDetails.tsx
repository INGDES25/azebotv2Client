import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../integrations/firebase/client';
import { ArrowLeft, Calendar, User, Tag, TrendingUp, DollarSign, Clock } from 'lucide-react';


interface Article {
  id: string;
  title: string;
  content: string;
  description?: string;
  category?: string;
  author?: string;
  publishedAt?: any;
  updatedAt?: any;
  type?: string;
  summary?: string;
  reasoning?: string;
  conclusion?: string;
  keyPoints?: string[];
  targetAudience?: string;
  difficulty?: string;
  duration?: string;
  asset?: string;
  match?: string;
  teams?: string;
  league?: string;
  market?: string;
  indicators?: string[];
  riskLevel?: string;
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
            description: data.description,
            category: data.category,
            author: data.author,
            publishedAt: data.publishedAt,
            updatedAt: data.updatedAt,
            type: data.type,
            summary: data.summary,
            reasoning: data.reasoning,
            conclusion: data.conclusion,
            keyPoints: data.keyPoints,
            targetAudience: data.targetAudience,
            difficulty: data.difficulty,
            duration: data.duration,
            asset: data.asset,
            match: data.match,
            teams: data.teams,
            league: data.league,
            market: data.market,
            indicators: data.indicators,
            riskLevel: data.riskLevel,
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

  const formatDate = (date: any) => {
    if (!date) return '';
    return new Date(date.toDate()).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      {/* En-tête avec titre et métadonnées */}
      <div className="article-header">
        <div className="article-category">
          <Tag className="w-4 h-4" />
          {article.category || article.type || 'Analyse'}
        </div>
        <h1>{article.asset || article.match || article.title}</h1>
        
        <div className="article-meta">
          {article.author && (
            <div className="meta-item">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
          )}
          {article.publishedAt && (
            <div className="meta-item">
              <Calendar className="w-4 h-4" />
              <span>Publié le {formatDate(article.publishedAt)}</span>
            </div>
          )}
          {article.updatedAt && (
            <div className="meta-item">
              <Clock className="w-4 h-4" />
              <span>Mis à jour le {formatDate(article.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Carte d'information principale */}
      <div className="article-info-card">
        {/* Résumé */}
        {article.summary && (
          <div className="info-section">
            <h3>
              <TrendingUp className="w-5 h-5" />
              Résumé
            </h3>
            <p>{article.summary}</p>
          </div>
        )}

        {/* Informations sur le marché/actif/match */}
        <div className="info-section">
          <h3>
            <DollarSign className="w-5 h-5" />
            Informations clés
          </h3>
          <div className="info-grid">
            {article.asset && (
              <div className="info-item">
                <span className="label">Actif:</span>
                <span className="value">{article.asset}</span>
              </div>
            )}
            {article.match && (
              <div className="info-item">
                <span className="label">Match:</span>
                <span className="value">{article.match}</span>
              </div>
            )}
            {article.league && (
              <div className="info-item">
                <span className="label">Ligue:</span>
                <span className="value">{article.league}</span>
              </div>
            )}
            {article.market && (
              <div className="info-item">
                <span className="label">Marché:</span>
                <span className="value">{article.market}</span>
              </div>
            )}
            {article.teams && (
              <div className="info-item">
                <span className="label">Équipes:</span>
                <span className="value">{article.teams}</span>
              </div>
            )}
          </div>
        </div>

        {/* Analyse et raisonnement */}
        {article.reasoning && (
          <div className="info-section">
            <h3>
              <TrendingUp className="w-5 h-5" />
              Analyse et raisonnement
            </h3>
            <div className="content-box">
              {article.reasoning}
            </div>
          </div>
        )}

        {/* Points clés */}
        {article.keyPoints && article.keyPoints.length > 0 && (
          <div className="info-section">
            <h3>
              <Tag className="w-5 h-5" />
              Points clés à retenir
            </h3>
            <ul className="key-points-list">
              {article.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Indicateurs techniques */}
        {article.indicators && article.indicators.length > 0 && (
          <div className="info-section">
            <h3>
              <TrendingUp className="w-5 h-5" />
              Indicateurs techniques
            </h3>
            <div className="indicators-grid">
              {article.indicators.map((indicator, index) => (
                <div key={index} className="indicator-badge">
                  {indicator}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conclusion */}
        {article.conclusion && (
          <div className="info-section">
            <h3>
              <TrendingUp className="w-5 h-5" />
              Conclusion
            </h3>
            <div className="content-box">
              {article.conclusion}
            </div>
          </div>
        )}

        {/* Informations complémentaires */}
        <div className="info-section">
          <h3>Informations complémentaires</h3>
          <div className="info-grid">
            {article.targetAudience && (
              <div className="info-item">
                <span className="label">Public cible:</span>
                <span className="value">{article.targetAudience}</span>
              </div>
            )}
            {article.difficulty && (
              <div className="info-item">
                <span className="label">Difficulté:</span>
                <span className="value">{article.difficulty}</span>
              </div>
            )}
            {article.duration && (
              <div className="info-item">
                <span className="label">Durée:</span>
                <span className="value">{article.duration}</span>
              </div>
            )}
            {article.riskLevel && (
              <div className="info-item">
                <span className="label">Niveau de risque:</span>
                <span className="value risk">{article.riskLevel}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu complet */}
      {article.content && (
        <div className="article-content">
          <h3>
            <TrendingUp className="w-5 h-5" />
            Analyse détaillée
          </h3>
          <div className="content-box">
            {article.content}
          </div>
        </div>
      )}

      {/* Informations de paiement */}
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