export const handleApiError = (error: any) => {
  console.error('Erreur API:', error);
  
  if (error.response) {
    // Le serveur a répondu avec un statut d'erreur
    return `Erreur du serveur: ${error.response.status} - ${error.response.data.message || error.response.data.error || 'Erreur inconnue'}`;
  } else if (error.request) {
    // La requête a été faite mais aucune réponse n'a été reçue
    return 'Le serveur ne répond pas. Veuillez vérifier votre connexion.';
  } else {
    // Une erreur s'est produite lors de la configuration de la requête
    return `Erreur: ${error.message}`;
  }
};