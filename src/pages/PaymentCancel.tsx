import { useNavigate } from 'react-router-dom';
import { XCircle, Home } from 'lucide-react';


const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-result-container">
      <div className="result-icon cancel">
        <XCircle size={64} />
      </div>
      <h1>Paiement annulé</h1>
      <p>Vous avez annulé le paiement. Vous pouvez réessayer plus tard si vous le souhaitez.</p>
      
      <div className="action-buttons">
        <button onClick={() => navigate('/')} className="home-button">
          <Home size={20} />
          Retour à l'accueil
        </button>
        <button onClick={() => navigate(-1)} className="retry-button">
          Réessayer le paiement
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;