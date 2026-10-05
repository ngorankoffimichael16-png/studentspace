// Router permet de créer un groupe de routes séparé de app.js.
import { Router } from 'express';

// Limite les tentatives répétées sur la connexion et la validation du code.
import { rateLimit } from 'express-rate-limit';

// Importe les fonctions du contrôleur qui traitent l'authentification.
import {
  getCurrentUser,
  login,
  register,
  verifyLoginTwoFactor,
} from '../controllers/auth.controller.js';

// Importe le middleware qui vérifie le jeton JWT.
import { authenticateToken } from '../middlewares/auth.middleware.js';

// Vérifie les jetons temporaires dédiés au second facteur.
import { authenticateTwoFactorChallenge } from '../middlewares/two-factor-challenge.middleware.js';

// Crée un routeur consacré aux demandes liées à l'authentification.
const authRouter = Router();

// Limite les demandes de connexion provenant d'une même adresse IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Trop de tentatives de connexion. Réessaie plus tard.',
  },
});

// Limite les codes TOTP à cinq tentatives par compte sur quinze minutes.
const twoFactorLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => req.user.id,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Trop de codes saisis. Réessaie plus tard.',
  },
});

// Quand le client envoie une demande POST à "/register",
// Express appelle la fonction register du contrôleur.
authRouter.post('/register', register);

// Quand le client envoie POST "/login", appelle le contrôleur de connexion.
authRouter.post('/login', loginLimiter, login);

// Termine la connexion avec un challenge valide et le code de l'application.
authRouter.post(
  '/login/verify-2fa',
  authenticateTwoFactorChallenge,
  twoFactorLoginLimiter,
  verifyLoginTwoFactor
);

// Vérifie le jeton avant d'appeler le contrôleur du compte connecté.
authRouter.get('/me', authenticateToken, getCurrentUser);

// Permet à app.js d'importer et de brancher ce routeur.
export default authRouter;