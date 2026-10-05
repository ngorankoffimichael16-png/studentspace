
// Router permet de regrouper les routes liées aux utilisateurs.
import { Router } from 'express'

// Limite le nombre de tentatives d'activation 2FA.
import { rateLimit } from 'express-rate-limit'

// Vérifie que la personne est connectée et que son jeton est valide.
import { authenticateToken } from '../middlewares/auth.middleware.js'

// Reçoit la photo, vérifie son contenu, puis l'enregistre sur le serveur.
import { uploadProfilePhoto } from '../middlewares/upload.middleware.js'
import { validateProfilePhoto } from '../middlewares/validate-image.middleware.js'
import { storeProfilePhoto } from '../middlewares/store-profile-photo.middleware.js'

// Importe les contrôleurs de la photo et des informations du profil.
import {
  confirmMyTwoFactor,
  disableMyTwoFactor,
  setupMyTwoFactor,
  updateMyAvatar,
  updateMyProfile,
} from '../controllers/user.controller.js'

// Crée le routeur des fonctionnalités utilisateur.
const userRouter = Router()

// Autorise au maximum cinq demandes 2FA par compte sur une fenêtre de 15 minutes.
const twoFactorLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  limit: 5,

  // authenticateToken doit être placé avant ce limiteur pour définir req.user.
  keyGenerator: (req) => req.user.id,

  // Envoie les en-têtes modernes et désactive les anciens en-têtes.
  standardHeaders: 'draft-8',
  legacyHeaders: false,

  // Réponse explicite si le compte dépasse la limite.
  message: {
    message: 'Trop de tentatives. Attends avant de réessayer.',
  },
})

// Ajoute ou remplace la photo du compte connecté.
// L'ordre est important : authentifier, recevoir, vérifier, enregistrer, mettre à jour la base.
userRouter.post(
  '/me/avatar',
  authenticateToken,
  uploadProfilePhoto,
  validateProfilePhoto,
  storeProfilePhoto,
  updateMyAvatar
)
// Modifie les informations du profil du compte connecté.
// Le middleware vérifie le jeton avant d'appeler le contrôleur.
userRouter.patch('/me', authenticateToken, updateMyProfile)

// Prépare le QR code après authentification et contrôle du nombre de demandes.
userRouter.post(
  '/me/two-factor/setup',
  authenticateToken,
  twoFactorLimiter,
  setupMyTwoFactor
)

// Vérifie le premier code TOTP avec les mêmes protections.
userRouter.post(
  '/me/two-factor/confirm',
  authenticateToken,
  twoFactorLimiter,
  confirmMyTwoFactor
)

// Exige un code TOTP actuel avant de supprimer le secret et désactiver la 2FA.
userRouter.post(
  '/me/two-factor/disable',
  authenticateToken,
  twoFactorLimiter,
  disableMyTwoFactor
)

// Rend le routeur disponible dans app.js.
export default userRouter