
// Importe le service qui enregistre le chemin de la photo dans la base.
import { updateAuthenticatedUserAvatar } from '../services/auth.service.js'
import {
  TwoFactorError,
  confirmTwoFactorSetup,
  disableTwoFactor,
  setupTwoFactor,
} from '../services/twoFactor.service.js'
// Importe le service de mise à jour et le type de ses erreurs attendues.
import {
  ProfileUpdateError,
  updateAuthenticatedUserProfile,
} from '../services/user.service.js'

// Traite l'ajout de la photo du compte actuellement connecté.
export async function updateMyAvatar(req, res, next) {
  try {
    // Ce chemin est préparé par le middleware de stockage, pas fourni par le navigateur.
    const avatarPath = req.profilePhoto?.path

    // Refuse la demande si le middleware précédent n'a pas fourni de chemin.
    if (!avatarPath) {
      return res.status(400).json({
        message: 'La photo reçue n’a pas pu être préparée.',
      })
    }

    // req.user.id est ajouté par le middleware JWT après vérification du jeton.
    const user = await updateAuthenticatedUserAvatar(req.user.id, avatarPath)

    // Le compte peut avoir été supprimé après la création du jeton.
    if (!user) {
      return res.status(404).json({
        message: 'Le compte associé à cette session est introuvable.',
      })
    }

    // Renvoie les données du compte utiles au frontend, sans données privées.
    return res.status(200).json({
      message: 'La photo de profil a été enregistrée.',
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        avatarPath: user.avatar_path,
      },
    })
  } catch (error) {
    // Transmet les erreurs imprévues au gestionnaire central d'Express.
    return next(error)
  }
}

// Reçoit et traite la demande de modification du profil connecté.
export async function updateMyProfile(req, res, next) {
  try {
    // L'identifiant vient du jeton vérifié, pas d'une valeur fournie par le navigateur.
    const user = await updateAuthenticatedUserProfile(req.user.id, req.body)

    // Le compte peut avoir été supprimé après la création du jeton.
    if (!user) {
      return res.status(404).json({
        message: 'Le compte associé à cette session est introuvable.',
      })
    }

    // Renvoie les informations utiles à l'écran, sans le hash du mot de passe.
    return res.status(200).json({
      message: 'Le profil a été mis à jour.',
      user: {
        id: user.id,
        fullName: user.full_name,
        phone: user.phone,
        email: user.email,
        createdAt: user.created_at,
        avatarPath: user.avatar_path,
      },
    })
  } catch (error) {
    // Traduit les erreurs de validation en réponse HTTP 400.
    if (error instanceof ProfileUpdateError) {
      if (error.code === 'INVALID_PROFILE') {
        return res.status(400).json({
          message: error.message,
          errors: error.details,
        })
      }

      // Le statut 409 indique que l'e-mail ou le téléphone est déjà utilisé.
      if (error.code === 'DUPLICATE_FIELDS') {
        return res.status(409).json({
          message: error.message,
          fields: error.details,
        })
      }
    }

    // Transmet les erreurs inattendues au gestionnaire Express.
    return next(error)
  }
}

// Prépare le QR code pour le compte connecté.
export async function setupMyTwoFactor(req, res, next) {
  try {
    // Utilise l'identifiant ajouté par le middleware d'authentification.
    const setup = await setupTwoFactor(req.user.id)

    // Empêche le navigateur ou un proxy de conserver le QR et son secret.
    res.set('Cache-Control', 'no-store')

    return res.status(200).json({
      message: 'Scanne le QR code avec ton application d’authentification.',
      qrCodeDataUrl: setup.qrCodeDataUrl,
      manualSecret: setup.manualSecret,
    })
  } catch (error) {
    // Renvoie explicitement les erreurs prévues par le service 2FA.
    if (error instanceof TwoFactorError) {
      return res.status(error.statusCode).json({
        code: error.code,
        message: error.message,
      })
    }

    // Transmet les erreurs inattendues au gestionnaire central.
    return next(error)
  }
}

// Vérifie le code reçu avant de confirmer l'activation de la 2FA.
export async function confirmMyTwoFactor(req, res, next) {
  try {
    // Le service vérifie le code associé au compte connecté.
    const result = await confirmTwoFactorSetup(req.user.id, req.body?.token)

    // Ne renvoie que le statut d'activation, jamais le secret TOTP.
    return res.status(200).json({
      message: 'La vérification est réussie : la 2FA est activée.',
      enabled: result.enabled,
    })
  } catch (error) {
    // Renvoie explicitement les erreurs prévues par le service 2FA.
    if (error instanceof TwoFactorError) {
      return res.status(error.statusCode).json({
        code: error.code,
        message: error.message,
      })
    }

    // Transmet les erreurs inattendues au gestionnaire central.
    return next(error)
  }
}

// Désactive la 2FA uniquement après vérification du code actuel de l'utilisateur.
export async function disableMyTwoFactor(req, res, next) {
  try {
    const result = await disableTwoFactor(req.user.id, req.body?.token)

    return res.status(200).json({
      message: 'La 2FA a été désactivée.',
      enabled: result.enabled,
    })
  } catch (error) {
    if (error instanceof TwoFactorError) {
      return res.status(error.statusCode).json({
        code: error.code,
        message: error.message,
      })
    }

    return next(error)
  }
}
