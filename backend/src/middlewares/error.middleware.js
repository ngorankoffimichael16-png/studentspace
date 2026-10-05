// Gestionnaire central des erreurs Express.
// Express le reconnaît grâce à ses quatre paramètres.
export function errorHandler(error, req, res, next) {
  // Si la réponse a déjà commencé, on laisse Express traiter l'erreur.
  if (res.headersSent) {
    return next(error);
  }

  // Affiche les détails dans le terminal du backend pour faciliter le diagnostic.
  console.error('Erreur inattendue du backend :', error);

  // Ne révèle pas les détails techniques au client.
  return res.status(500).json({
    message: 'Une erreur interne est survenue.',
  });
}