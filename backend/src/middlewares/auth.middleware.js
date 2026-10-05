// Importe jsonwebtoken pour vérifier la signature et l'expiration du jeton.
import jwt from 'jsonwebtoken';

// Importe la configuration qui contient la clé secrète du backend.
import { env } from '../config/env.js';

// Vérifie le jeton avant de laisser une requête accéder à une route protégée.
export function authenticateToken(req, res, next) {
  // Lit l'en-tête Authorization envoyé par le navigateur.
  const authorizationHeader = req.get('authorization');

  // L'en-tête doit respecter le format : Bearer <jeton>.
  const bearerMatch = authorizationHeader?.match(/^Bearer\s+(\S+)$/i);

  // Refuse la requête si le jeton est absent ou si son format est incorrect.
  if (!bearerMatch) {
    return res.status(401).json({
      message: 'Jeton d’authentification requis.',
    });
  }

  // Récupère le jeton placé après le mot Bearer.
  const token = bearerMatch[1];

  try {
    // Vérifie la signature, l'émetteur et l'algorithme du jeton.
    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'studentspace-api',
    });

    // Notre API attend un jeton contenant l'identifiant dans la propriété "sub".
    if (
      typeof payload !== 'object' ||
      payload === null ||
      typeof payload.sub !== 'string'
    ) {
      return res.status(401).json({
        message: 'Jeton invalide ou expiré.',
      });
    }

    // Rend l'identifiant disponible pour le contrôleur de la route protégée.
    req.user = {
      id: payload.sub,
    };

    // Le jeton est valide : Express passe à la fonction suivante.
    return next();
  } catch (error) {
    // Un jeton expiré, mal formé ou signé avec une mauvaise clé est refusé.
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: 'Jeton invalide ou expiré.',
      });
    }

    // Transmet toute autre erreur inattendue au gestionnaire central.
    return next(error);
  }
}