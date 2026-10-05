// Génère le secret TOTP, construit son URI et vérifie les codes saisis.
import { generateSecret, generateURI, verify } from 'otplib';

// Convertit l'URI TOTP en image QR que le frontend pourra afficher.
import QRCode from 'qrcode';

// Ces fonctions sont la seule couche du service qui accède aux données du compte.
import {
  disableTwoFactorIfSecretMatches,
  enableTwoFactorIfSecretMatches,
  findUserById,
  findTwoFactorSettingsByUserId,
  saveTwoFactorSecretIfDisabled,
} from '../repositories/user.repository.js';

// Ces fonctions protègent le secret avant son stockage en base.
import {
  decryptTwoFactorSecret,
  encryptTwoFactorSecret,
} from '../utils/twoFactorCrypto.js';

// Crée un jeton de session seulement après la réussite du code TOTP.
import { generateToken } from '../utils/generateToken.js';

// Identifie les erreurs prévues pour que le contrôleur puisse les traduire en HTTP.
export class TwoFactorError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.name = 'TwoFactorError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Prépare la configuration TOTP pour le compte connecté.
export async function setupTwoFactor(userId) {
  // Récupère l'adresse du compte et son état 2FA actuel.
  const settings = await findTwoFactorSettingsByUserId(userId);

  // Le compte peut avoir été supprimé après la création du jeton de connexion.
  if (!settings) {
    throw new TwoFactorError(
      'ACCOUNT_NOT_FOUND',
      'Le compte associé à cette session est introuvable.',
      404
    );
  }

  // Ne permet pas de remplacer un secret déjà utilisé par une 2FA active.
  if (settings.two_factor_enabled) {
    throw new TwoFactorError(
      'TWO_FACTOR_ALREADY_ENABLED',
      'La 2FA est déjà activée sur ce compte.',
      409
    );
  }

  // Ce secret sera ajouté à l'application d'authentification.
  const secret = generateSecret();

  // L'URI contient les informations dont l'application a besoin pour créer les codes.
  const authenticatorUri = generateURI({
    issuer: 'StudentSpace',
    label: settings.email,
    secret,
  });

  // Le QR et la clé manuelle servent uniquement à configurer l'application.
  const qrCodeDataUrl = await QRCode.toDataURL(authenticatorUri);

  // La base reçoit la version chiffrée, jamais le secret en clair.
  const encryptedSecret = encryptTwoFactorSecret(secret);

  // Cette mise à jour échoue si la 2FA a été activée entre-temps.
  const saved = await saveTwoFactorSecretIfDisabled(userId, encryptedSecret);

  if (!saved) {
    throw new TwoFactorError(
      'TWO_FACTOR_SETUP_CONFLICT',
      'La configuration 2FA a changé. Recommence la procédure.',
      409
    );
  }

  // Le secret en clair est renvoyé seulement pour la configuration initiale.
  return {
    qrCodeDataUrl,
    manualSecret: secret,
  };
}

// Vérifie le premier code avant d'activer la 2FA dans la base.
export async function confirmTwoFactorSetup(userId, token) {
  // Un code TOTP de cette configuration contient six chiffres.
  if (typeof token !== 'string' || !/^\d{6}$/.test(token)) {
    throw new TwoFactorError(
      'INVALID_TOTP_FORMAT',
      'Le code doit contenir exactement 6 chiffres.',
      400
    );
  }

  // Relit l'état et le secret actuellement enregistrés pour ce compte.
  const settings = await findTwoFactorSettingsByUserId(userId);

  if (!settings) {
    throw new TwoFactorError(
      'ACCOUNT_NOT_FOUND',
      'Le compte associé à cette session est introuvable.',
      404
    );
  }

  if (settings.two_factor_enabled) {
    throw new TwoFactorError(
      'TWO_FACTOR_ALREADY_ENABLED',
      'La 2FA est déjà activée sur ce compte.',
      409
    );
  }

  // L'utilisateur doit d'abord avoir demandé un QR code de configuration.
  if (!settings.two_factor_secret_encrypted) {
    throw new TwoFactorError(
      'TWO_FACTOR_SETUP_NOT_STARTED',
      'Commence par demander le QR code de configuration.',
      409
    );
  }

  // Le serveur déchiffre le secret uniquement en mémoire pour vérifier le code.
  const secret = decryptTwoFactorSecret(
    settings.two_factor_secret_encrypted
  );

  // otplib compare le code saisi avec le code attendu pour ce secret.
  const verification = await verify({ secret, token });

  if (!verification.valid) {
    throw new TwoFactorError(
      'INVALID_TOTP_CODE',
      'Le code est incorrect ou expiré.',
      400
    );
  }

  // N'active la 2FA que si le secret vérifié est toujours celui de la base.
  const activated = await enableTwoFactorIfSecretMatches(
    userId,
    settings.two_factor_secret_encrypted
  );

  if (!activated) {
    throw new TwoFactorError(
      'TWO_FACTOR_SETUP_CONFLICT',
      'La configuration 2FA a changé. Recommence la procédure.',
      409
    );
  }

  return { enabled: true };
}

// Vérifie le code TOTP après que le mot de passe a été accepté.
export async function verifyTwoFactorLogin(userId, token) {
  // Un code d'application doit contenir six chiffres.
  if (typeof token !== 'string' || !/^\d{6}$/.test(token)) {
    throw new TwoFactorError(
      'INVALID_TOTP_FORMAT',
      'Le code doit contenir exactement 6 chiffres.',
      400
    );
  }

  // Recharge le secret et l'état 2FA à partir de l'identifiant du challenge.
  const settings = await findTwoFactorSettingsByUserId(userId);

  // Refuse un challenge si le compte n'a plus une 2FA active et complète.
  if (
    !settings ||
    !settings.two_factor_enabled ||
    !settings.two_factor_secret_encrypted
  ) {
    throw new TwoFactorError(
      'INVALID_TOTP_CODE',
      'Code incorrect ou session de vérification expirée.',
      401
    );
  }

  // Déchiffre le secret uniquement en mémoire pour comparer le code.
  const secret = decryptTwoFactorSecret(
    settings.two_factor_secret_encrypted
  );
  const verification = await verify({ secret, token });

  if (!verification.valid) {
    throw new TwoFactorError(
      'INVALID_TOTP_CODE',
      'Code incorrect ou session de vérification expirée.',
      401
    );
  }

  // Récupère les données publiques seulement après la validation du code.
  const user = await findUserById(userId);

  if (!user) {
    throw new TwoFactorError(
      'ACCOUNT_NOT_FOUND',
      'Le compte associé à cette vérification est introuvable.',
      404
    );
  }

  // Émet le jeton normal uniquement après le contrôle du mot de passe et du TOTP.
  return {
    token: generateToken(user.id),
    user: {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      email: user.email,
    },
  };
}

// Désactive la 2FA uniquement après vérification d'un code actuel.
export async function disableTwoFactor(userId, token) {
  if (typeof token !== 'string' || !/^\d{6}$/.test(token)) {
    throw new TwoFactorError(
      'INVALID_TOTP_FORMAT',
      'Le code doit contenir exactement 6 chiffres.',
      400
    );
  }

  const settings = await findTwoFactorSettingsByUserId(userId);

  if (
    !settings ||
    !settings.two_factor_enabled ||
    !settings.two_factor_secret_encrypted
  ) {
    throw new TwoFactorError(
      'TWO_FACTOR_NOT_ENABLED',
      'La 2FA n’est pas activée sur ce compte.',
      409
    );
  }

  // Vérifie le code avant de supprimer la configuration active.
  const secret = decryptTwoFactorSecret(
    settings.two_factor_secret_encrypted
  );
  const verification = await verify({ secret, token });

  if (!verification.valid) {
    throw new TwoFactorError(
      'INVALID_TOTP_CODE',
      'Le code est incorrect ou expiré.',
      401
    );
  }

  // La requête SQL efface le secret seulement s'il n'a pas changé entre-temps.
  const disabled = await disableTwoFactorIfSecretMatches(
    userId,
    settings.two_factor_secret_encrypted
  );

  if (!disabled) {
    throw new TwoFactorError(
      'TWO_FACTOR_SETUP_CONFLICT',
      'La configuration 2FA a changé. Recommence la procédure.',
      409
    );
  }

  return { enabled: false };
}