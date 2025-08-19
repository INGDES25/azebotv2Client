import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';


const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    // Récupérer les informations de paiement depuis l'URL
    const params = new URLSearchParams(location.search);
    const transactionId = params.get('transaction_id');
    
    if (transactionId) {
      // Ici vous pourriez vérifier le statut du paiement auprès de votre backend
      setPaymentInfo({
        transactionId,
        message: 'Votre paiement a été traité avec succès'
      });
    }
    
    setLoading(false);
  }, [location]);

  if (loading) {
    return (
      <div className="payment-result-container">
        <div>Vérification du paiement...</div>
      </div>
    );
  }

  return (
    <div className="payment-result-container">
      <div className="result-icon success">
        <CheckCircle size={64} />
      </div>
      <h1>Paiement réussi !</h1>
      <p>Merci pour votre achat. Vous pouvez maintenant accéder à votre article.</p>
      
      {paymentInfo && (
        <div className="payment-details">
          <p><strong>ID de transaction:</strong> {paymentInfo.transactionId}</p>
        </div>
      )}
      
      <div className="action-buttons">
        <button onClick={() => navigate('/')} className="home-button">
          <Home size={20} />
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;