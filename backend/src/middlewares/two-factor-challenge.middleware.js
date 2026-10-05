// Vérifie les signatures JWT des challenges de connexion 2FA.
import jwt from 'jsonwebtoken';

// Utilise la même clé de signature que les autres jetons du backend.
import { env } from '../config/env.js';

// Autorise uniquement un challenge valide, jamais un jeton de session normal.
export function authenticateTwoFactorChallenge(req, res, next) {
  const authorizationHeader = req.get('authorization');
  const bearerMatch = authorizationHeader?.match(/^Bearer\s+(\S+)$/i);

  if (!bearerMatch) {
    return res.status(401).json({
      message: 'Jeton de vérification 2FA requis.',
    });
  }

  try {
    // L'émetteur différent sépare ce jeton provisoire du jeton de session.
    const payload = jwt.verify(bearerMatch[1], env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'studentspace-2fa-challenge',
    });

    // Le but et l'identifiant doivent tous deux correspondre au challenge.
    if (
      typeof payload !== 'object' ||
      payload === null ||
      payload.purpose !== 'two-factor-login' ||
      typeof payload.sub !== 'string'
    ) {
      return res.status(401).json({
        message: 'Jeton de vérification 2FA invalide ou expiré.',
      });
    }

    // Le contrôleur reçoit l'identifiant uniquement depuis le jeton signé.
    req.user = { id: payload.sub };
    return next();
  } catch (error) {
    // Un jeton absent, expiré ou mal signé est refusé.
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        message: 'Jeton de vérification 2FA invalide ou expiré.',
      });
    }

    // Les autres erreurs restent visibles pour le gestionnaire central.
    return next(error);
  }
}
