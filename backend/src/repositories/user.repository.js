// Importe le pool utilisé pour envoyer des requêtes à PostgreSQL.
import { pool } from '../config/database.js';

// Cherche un utilisateur par son adresse e-mail.
// Renvoie l'utilisateur trouvé, ou null si aucun compte ne correspond.
export async function findUserByEmail(email) {
  const query = `
    SELECT id, full_name, phone, email, password_hash,
           two_factor_enabled, two_factor_secret_encrypted
    FROM public.users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
  `;

  // Transmet l'e-mail séparément pour éviter de fabriquer du SQL avec sa valeur.
  const result = await pool.query(query, [email]);

  return result.rows[0] ?? null;
}

// Cherche si un compte utilise déjà ce numéro de téléphone.
export async function findUserByPhone(phone) {
  const query = `
    SELECT id
    FROM public.users
    WHERE phone = $1
    LIMIT 1
  `;

  // Transmet le numéro séparément pour éviter de fabriquer du SQL avec sa valeur.
  const result = await pool.query(query, [phone]);

  // Renvoie le compte trouvé, ou null si ce numéro n'est pas utilisé.
  return result.rows[0] ?? null;
}

// Cherche un compte avec son identifiant, sans récupérer son hash de mot de passe.
export async function findUserById(id) {
  const query = `
    SELECT id, full_name, phone, email, created_at, avatar_path,
           two_factor_enabled
    FROM public.users
    WHERE id = $1
    LIMIT 1
  `;

  // Passe l'identifiant comme paramètre SQL pour éviter de l'ajouter directement à la requête.
  const result = await pool.query(query, [id]);

  // Renvoie le compte trouvé, ou null si cet identifiant n'existe plus.
  return result.rows[0] ?? null;
}

// Enregistre le chemin de la photo de profil pour un compte.
export async function updateUserAvatarPath(userId, avatarPath) {
  const query = `
    UPDATE public.users
    SET avatar_path = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, full_name, phone, email, created_at, avatar_path
  `;

  // Le chemin et l'identifiant sont transmis comme paramètres SQL.
  const result = await pool.query(query, [avatarPath, userId]);

  // Renvoie le compte mis à jour, ou null si son identifiant n'existe pas.
  return result.rows[0] ?? null;
}
// Met à jour le nom, le téléphone et l'e-mail d'un utilisateur en base.
export async function updateUserProfile({ userId, fullName, phone, email }) {
  const query = `
    UPDATE public.users
    SET full_name = $1,
        phone = $2,
        email = $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING id, full_name, phone, email, created_at, avatar_path
  `;

  // Les valeurs sont passées séparément du SQL pour éviter de les insérer directement dans la requête.
  const result = await pool.query(query, [
    fullName,
    phone,
    email,
    userId,
  ]);

  // Renvoie le compte mis à jour, ou null si aucun compte ne correspond à cet identifiant.
  return result.rows[0] ?? null;
}
// Ajoute un utilisateur dans la table users.
// passwordHash doit déjà être un hash, jamais un mot de passe en clair.
export async function createUser({ fullName, phone, email, passwordHash }) {
  const query = `
    INSERT INTO public.users (full_name, phone, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, full_name, phone, email, created_at
  `;

  // Les valeurs remplacent les emplacements dans l'ordre :
  // $1 = nom, $2 = téléphone, $3 = e-mail, $4 = hash.
  const result = await pool.query(query, [
    fullName,
    phone,
    email,
    passwordHash,
  ]);

  // Renvoie la ligne créée, sans inclure le hash.
  return result.rows[0];
}
// Lit l'état 2FA du compte pour préparer ou confirmer son activation.
export async function findTwoFactorSettingsByUserId(userId) {
  const query = `
    SELECT email, two_factor_enabled, two_factor_secret_encrypted
    FROM public.users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0] ?? null;
}

// Enregistre le secret chiffré seulement si la 2FA n'est pas déjà active.
export async function saveTwoFactorSecretIfDisabled(userId, encryptedSecret) {
  const query = `
    UPDATE public.users
    SET two_factor_secret_encrypted = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
      AND two_factor_enabled = FALSE
    RETURNING id
  `;

  const result = await pool.query(query, [encryptedSecret, userId]);

  return result.rows[0] ?? null;
}

// Active la 2FA seulement si le secret confirmé est toujours celui enregistré.
export async function enableTwoFactorIfSecretMatches(userId, encryptedSecret) {
  const query = `
    UPDATE public.users
    SET two_factor_enabled = TRUE,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND two_factor_enabled = FALSE
      AND two_factor_secret_encrypted = $2
    RETURNING id
  `;

  const result = await pool.query(query, [userId, encryptedSecret]);

  return result.rows[0] ?? null;
}

// Désactive la 2FA uniquement si le secret vérifié n'a pas changé.
export async function disableTwoFactorIfSecretMatches(userId, encryptedSecret) {
  const query = `
    UPDATE public.users
    SET two_factor_enabled = FALSE,
        two_factor_secret_encrypted = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND two_factor_enabled = TRUE
      AND two_factor_secret_encrypted = $2
    RETURNING id
  `;

  const result = await pool.query(query, [userId, encryptedSecret]);

  return result.rows[0] ?? null;
}