// Importe les services d'inscription et de connexion ainsi que leurs erreurs connues.
import {
  getAuthenticatedUser,
  loginUser,
  registerUser,
  LoginError,
  RegistrationError,
} from '../services/auth.service.js';

// Vérifie le code TOTP après le mot de passe et gère ses erreurs attendues.
import {
  TwoFactorError,
  verifyTwoFactorLogin,
} from '../services/twoFactor.service.js';

// Reçoit la demande d'inscription et prépare la réponse HTTP.
export async function register(req, res, next) {
  try {
    // Le service vérifie les données, puis tente de créer le compte.
    const user = await registerUser(req.body);

    // 201 signifie que le compte a été créé.
    // Le hash du mot de passe n'est jamais renvoyé.
    return res.status(201).json({
      message: 'Le compte a été créé.',
      user: {
        id: user.id,
        fullName: user.full_name,
        phone: user.phone,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    if (error instanceof RegistrationError) {
      if (error.code === 'INVALID_REGISTRATION') {
        return res.status(400).json({
          message: error.message,
          errors: error.details,
        });
      }

      if (error.code === 'DUPLICATE_FIELDS') {
        return res.status(409).json({
          fields: error.details,
          message: error.message,
        });
      }
    }

    // Transmet les erreurs inattendues au gestionnaire central d'Express.
    return next(error);
  }
}

// Reçoit une demande de connexion et renvoie le jeton créé.
export async function login(req, res, next) {
  try {
    // Le service valide les identifiants et compare le mot de passe au hash.
    const result = await loginUser(req.body);

    // Pour les comptes 2FA, renvoie seulement un challenge temporaire, pas de session.
    if (result.requiresTwoFactor) {
      return res.status(200).json({
        message: 'Saisis le code de ton application d’authentification.',
        requiresTwoFactor: true,
        challengeToken: result.challengeToken,
      });
    }

    // 200 signifie que la connexion a réussi.
    return res.status(200).json({
      message: 'Connexion réussie.',
      token: result.token,
      user: {
        id: result.user.id,
        fullName: result.user.full_name,
        phone: result.user.phone,
        email: result.user.email,
      },
    });
  } catch (error) {
    if (error instanceof LoginError) {
      if (error.code === 'INVALID_LOGIN') {
        return res.status(400).json({
          message: error.message,
          errors: error.details,
        });
      }

      // Fournit un code distinct pour afficher l'erreur sous le champ e-mail.
      if (error.code === 'EMAIL_NOT_FOUND') {
        return res.status(401).json({
          code: error.code,
          message: error.message,
        });
      }

      // Fournit un code distinct pour afficher l'erreur sous le champ mot de passe.
      if (error.code === 'INVALID_PASSWORD') {
        return res.status(401).json({
          code: error.code,
          message: error.message,
        });
      }

      // Un compte configuré sans secret ne reçoit jamais de session de secours.
      if (error.code === 'TWO_FACTOR_UNAVAILABLE') {
        return res.status(503).json({
          code: error.code,
          message: error.message,
        });
      }
    }

    // Transmet les erreurs inattendues au gestionnaire central d'Express.
    return next(error);
  }
}

// Termine la connexion après réception d'un challenge et d'un code TOTP valide.
export async function verifyLoginTwoFactor(req, res, next) {
  try {
    // req.user.id est fourni par le middleware qui vérifie le challenge signé.
    const result = await verifyTwoFactorLogin(req.user.id, req.body?.token);

    // Le jeton renvoyé ici est le jeton de session normal, créé après le TOTP.
    return res.status(200).json({
      message: 'Connexion réussie.',
      token: result.token,
      user: {
        id: result.user.id,
        fullName: result.user.full_name,
        phone: result.user.phone,
        email: result.user.email,
      },
    });
  } catch (error) {
    // Renvoie les erreurs de code ou de challenge sans les masquer.
    if (error instanceof TwoFactorError) {
      return res.status(error.statusCode).json({
        code: error.code,
        message: error.message,
      });
    }

    // Transmet les erreurs inattendues au gestionnaire central.
    return next(error);
  }
}

// Prépare la réponse de la route qui renvoie le compte connecté.
export async function getCurrentUser(req, res, next) {
  try {
    // req.user.id est ajouté par le middleware après vérification du jeton.
    const user = await getAuthenticatedUser(req.user.id);

    // Le compte peut avoir été supprimé après la création du jeton.
    if (!user) {
      return res.status(404).json({
        message: 'Le compte associé à cette session est introuvable.',
      });
    }

    // Renvoie les informations utiles, sans le hash du mot de passe.
    return res.status(200).json({
      user: {
        id: user.id,
        fullName: user.full_name,
        phone: user.phone,
        email: user.email,
        createdAt: user.created_at,
        avatarPath: user.avatar_path,
        twoFactorEnabled: user.two_factor_enabled,
      },
    });
  } catch (error) {
    // Confie les erreurs inattendues au gestionnaire central d'Express.
    return next(error);
  }
}