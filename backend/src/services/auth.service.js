// Outil déjà installé qui protège les mots de passe en les hachant.
import bcrypt from 'bcrypt';

// Importe les jetons de session et de challenge 2FA.
import {
  generateToken,
  generateTwoFactorChallengeToken,
} from '../utils/generateToken.js';

// Fonctions qui lisent et enregistrent les utilisateurs en base.
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByPhone,
  updateUserAvatarPath,
} from '../repositories/user.repository.js';

// Importe les vérifications utilisées à l'inscription et à la connexion.
import {
  validateLogin,
  validateRegistration,
} from '../validators/auth.validator.js';

// Représente les erreurs d'inscription que le contrôleur peut traiter.
export class RegistrationError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = 'RegistrationError';
    this.code = code;
    this.details = details;
  }
}

// Représente les erreurs de connexion que le contrôleur peut traiter.
export class LoginError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = 'LoginError';
    this.code = code;
    this.details = details;
  }
}

// Coordonne la création d'un compte étudiant.
export async function registerUser(data) {
  // Vérifie d'abord les données avant de faire des recherches.
  const errors = validateRegistration(data);

  if (errors.length > 0) {
    throw new RegistrationError(
      'INVALID_REGISTRATION',
      'Les informations d’inscription ne sont pas valides.',
      errors
    );
  }

  // Nettoie les espaces et normalise l'e-mail.
  const fullName = data.fullName.trim();
  const phone = data.phone.trim();
  const email = data.email.trim().toLowerCase();

  // Vérifie l'e-mail et le téléphone avant de décider si l'inscription est refusée.
  const existingUser = await findUserByEmail(email);
  const existingPhone = await findUserByPhone(phone);
  const duplicateFields = [];

  if (existingUser) {
    duplicateFields.push('email');
  }

  if (existingPhone) {
    duplicateFields.push('phone');
  }

  if (duplicateFields.length > 0) {
    throw new RegistrationError(
      'DUPLICATE_FIELDS',
      'Certaines informations sont déjà utilisées.',
      duplicateFields
    );
  }

  // Hache le mot de passe avant de l'enregistrer.
  const passwordHash = await bcrypt.hash(data.password, 12);

  try {
    return await createUser({
      fullName,
      phone,
      email,
      passwordHash,
    });
  } catch (error) {
    // La base bloque déjà les e-mails en double.
    if (
      error.code === '23505' &&
      error.constraint === 'users_email_unique_idx'
    ) {
      throw new RegistrationError(
        'DUPLICATE_FIELDS',
        'Certaines informations sont déjà utilisées.',
        ['email']
      );
    }

    throw error;
  }
}

// Vérifie les identifiants d'une personne qui veut se connecter.
export async function loginUser(data) {
  // Vérifie la forme de l'e-mail et la présence du mot de passe.
  const errors = validateLogin(data);

  if (errors.length > 0) {
    throw new LoginError(
      'INVALID_LOGIN',
      'Les informations de connexion ne sont pas valides.',
      errors
    );
  }

  // Normalise l'e-mail pour que la casse ne fasse pas échouer la recherche.
  const email = data.email.trim().toLowerCase();

  // Recherche le compte correspondant dans PostgreSQL.
  const user = await findUserByEmail(email);

  // Signale spécifiquement qu'aucun compte n'utilise cette adresse.
  if (!user) {
    throw new LoginError(
      'EMAIL_NOT_FOUND',
      'Cette adresse e-mail ne correspond à aucun compte.'
    );
  }

  // Compare le mot de passe saisi avec son hash enregistré.
  const passwordIsValid = await bcrypt.compare(
    data.password,
    user.password_hash
  );

  // Signale spécifiquement que le mot de passe ne correspond pas au compte.
  if (!passwordIsValid) {
    throw new LoginError(
      'INVALID_PASSWORD',
      'Mot de passe incorrect.'
    );
  }

  // Si la 2FA est active, le mot de passe seul ne suffit pas à ouvrir la session.
  if (user.two_factor_enabled) {
    // Refuse la connexion plutôt que de contourner une configuration incomplète.
    if (!user.two_factor_secret_encrypted) {
      throw new LoginError(
        'TWO_FACTOR_UNAVAILABLE',
        'La vérification 2FA de ce compte est indisponible.'
      );
    }

    // Ce jeton temporaire ne donne pas accès aux routes protégées.
    return {
      requiresTwoFactor: true,
      challengeToken: generateTwoFactorChallengeToken(user.id),
    };
  }

  // Crée le jeton uniquement après avoir vérifié le mot de passe.
  const token = generateToken(user.id);

  // Renvoie le jeton et les informations publiques, jamais le hash.
  return {
    requiresTwoFactor: false,
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      email: user.email,
    },
  };
}

// Récupère les informations du compte associé à un jeton déjà vérifié.
export async function getAuthenticatedUser(userId) {
  // Le repository renvoie le compte ou null si le compte n'existe plus.
  return findUserById(userId);
}
// Enregistre le chemin de la nouvelle photo pour le compte connecté.
export async function updateAuthenticatedUserAvatar(userId, avatarPath) {
  // Le repository met à jour la base et renvoie le compte, ou null si introuvable.
  return updateUserAvatarPath(userId, avatarPath);
}