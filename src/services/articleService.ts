// src/services/articleService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getArticlePrice = async (id: string): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/api/article/${id}`);
  if (!response.ok) {
    throw new Error('Erreur lors du chargement du prix');
  }
  const data = await response.json();
  return data.price;
};

// ✅ Nouvelle fonction : créer une session de paiement
export const createPaymentSession = async (articleId: string): Promise<{ checkoutUrl: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/payment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ articleId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Échec de création du paiement');
  }

  return response.json();
};