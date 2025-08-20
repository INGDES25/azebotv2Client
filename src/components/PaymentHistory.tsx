// src/components/PaymentHistory.tsx
import { useState, useEffect } from 'react';
import { db } from '../integrations/firebase/client';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      
      const q = query(
        collection(db, 'ValidPay'),
        where('userId', '==', user.uid),
        orderBy('paymentDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const paymentsData = [];
      querySnapshot.forEach((doc) => {
        paymentsData.push({ id: doc.id, ...doc.data() });
      });
      
      setPayments(paymentsData);
      setLoading(false);
    };

    fetchPayments();
  }, [user]);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Historique des paiements</h2>
      {payments.length === 0 ? (
        <p>Aucun paiement trouvé</p>
      ) : (
        <ul>
          {payments.map((payment) => (
            <li key={payment.id}>
              {payment.articleId} - {payment.amount} FCFA - {payment.paymentDate.toDate().toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};