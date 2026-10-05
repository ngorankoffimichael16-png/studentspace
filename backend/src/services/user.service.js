// Importe les fonctions qui recherchent et mettent à jour les comptes en base.
import {
  findUserByEmail,
  findUserByPhone,
  updateUserProfile,
} from '../repositories/user.repository.js';

// Importe le validateur ajouté à l'étape 1.
import { validateProfileUpdate } from '../validators/user.validator.js';

// Permet au contrôleur de distinguer les erreurs prévues des erreurs inattendues.
export class ProfileUpdateError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = 'ProfileUpdateError';
    this.code = code;
    this.details = details;
  }
}

// Vérifie puis met à jour le profil de l'utilisateur connecté.
export async function updateAuthenticatedUserProfile(userId, data) {
  // Rejette les champs manquants ou invalides avant de consulter la base.
  const errors = validateProfileUpdate(data);

  if (errors.length > 0) {
    throw new ProfileUpdateError(
      'INVALID_PROFILE',
      'Les informations du profil ne sont pas valides.',
      errors
    );
  }

  // Retire les espaces superflus et normalise l'e-mail.
  const fullName = data.fullName.trim();
  const phone = data.phone.trim();
  const email = data.email.trim().toLowerCase();

  // Vérifie si l'e-mail et le téléphone sont déjà utilisés.
  const [userWithEmail, userWithPhone] = await Promise.all([
    findUserByEmail(email),
    findUserByPhone(phone),
  ]);

  const duplicateFields = [];

  // Autorise l'utilisateur à conserver son propre e-mail ou son propre téléphone.
  if (userWithEmail && String(userWithEmail.id) !== String(userId)) {
    duplicateFields.push('email');
  }

  if (userWithPhone && String(userWithPhone.id) !== String(userId)) {
    duplicateFields.push('phone');
  }

  // Renvoie les champs en conflit pour que le contrôleur puisse répondre clairement.
  if (duplicateFields.length > 0) {
    throw new ProfileUpdateError(
      'DUPLICATE_FIELDS',
      'Certaines informations sont déjà utilisées.',
      duplicateFields
    );
  }

  try {
    // Met à jour le compte identifié par son jeton, avec les valeurs vérifiées.
    return await updateUserProfile({
      userId,
      fullName,
      phone,
      email,
    });
  } catch (error) {
    // L'index unique de la base empêche aussi deux e-mails identiques simultanément.
    if (
      error.code === '23505' &&
      error.constraint === 'users_email_unique_idx'
    ) {
      throw new ProfileUpdateError(
        'DUPLICATE_FIELDS',
        'Certaines informations sont déjà utilisées.',
        ['email']
      );
    }

    // Ne cache pas les erreurs inattendues : elles seront traitées plus haut.
    throw error;
  }
}