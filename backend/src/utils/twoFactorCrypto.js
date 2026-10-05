// Fonctions cryptographiques intégrées à Node.js.
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';

// Clé AES-256 dédiée à la protection des secrets TOTP.
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const FORMAT_VERSION = 'v1';

// Décode un champ base64url et rejette les données mal formées.
function decodeBase64Url(value, fieldName) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error(`Le champ ${fieldName} du secret chiffré est invalide.`);
  }

  const decoded = Buffer.from(value, 'base64url');

  // Vérifie que la chaîne était encodée sous une forme canonique.
  if (decoded.toString('base64url') !== value) {
    throw new Error(`Le champ ${fieldName} du secret chiffré est invalide.`);
  }

  return decoded;
}

// Chiffre le secret TOTP avec AES-256-GCM et un IV aléatoire.
export function encryptTwoFactorSecret(secret) {
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new TypeError('Le secret TOTP à chiffrer doit être une chaîne non vide.');
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(
    ALGORITHM,
    env.twoFactorEncryptionKey,
    iv
  );

  const ciphertext = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Format enregistré : version.IV.tagAuthentification.donnéesChiffrées
  return [
    FORMAT_VERSION,
    iv.toString('base64url'),
    authTag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

// Déchiffre un secret TOTP précédemment produit par encryptTwoFactorSecret.
export function decryptTwoFactorSecret(encryptedSecret) {
  if (typeof encryptedSecret !== 'string' || encryptedSecret.length === 0) {
    throw new TypeError('Le secret TOTP chiffré doit être une chaîne non vide.');
  }

  const parts = encryptedSecret.split('.');

  if (parts.length !== 4 || parts[0] !== FORMAT_VERSION) {
    throw new Error('Le format du secret TOTP chiffré est invalide.');
  }

  const [, encodedIv, encodedAuthTag, encodedCiphertext] = parts;
  const iv = decodeBase64Url(encodedIv, 'IV');
  const authTag = decodeBase64Url(encodedAuthTag, 'tag');
  const ciphertext = decodeBase64Url(encodedCiphertext, 'texte chiffré');

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Les paramètres du secret TOTP chiffré sont invalides.');
  }

  if (ciphertext.length === 0) {
    throw new Error('Le texte chiffré du secret TOTP est vide.');
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    env.twoFactorEncryptionKey,
    iv
  );

  // GCM vérifie que le contenu n'a pas été modifié avant de le déchiffrer.
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}