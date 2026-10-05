// Importe la fonction qui signe les jetons JWT.
import jwt from 'jsonwebtoken';
// Importe la configuration, qui contient la clé secrète privée.
import { env } from '../config/env.js';

// Crée un jeton prouvant que l'utilisateur s'est connecté.
export function generateToken(userId) {
  return jwt.sign(
    // Le champ "sub" indique à quel utilisateur appartient le jeton.
    { sub: String(userId) },

    // La clé secrète permet au backend de signer le jeton.
    env.jwtSecret,

    // Le jeton expire après une heure.
    // L'émetteur permet de vérifier que le jeton vient de notre API.
    {
      expiresIn: '1h',
      issuer: 'studentspace-api',
    }
  );
}

// Crée un jeton provisoire utilisable uniquement pour terminer la vérification 2FA.
export function generateTwoFactorChallengeToken(userId) {
  return jwt.sign(
    {
      sub: String(userId),
      purpose: 'two-factor-login',
    },
    env.jwtSecret,
    {
      expiresIn: '5m',
      issuer: 'studentspace-2fa-challenge',
    }
  );
}