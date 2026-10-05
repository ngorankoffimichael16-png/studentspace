// Charge les variables du fichier .env.
import 'dotenv/config';

// Lit le port du serveur. Utilise 3000 s'il n'est pas indiqué.
const port = Number(process.env.PORT ?? 3000);

// Lit le port de PostgreSQL. Le port habituel est 5432.
const databasePort = Number(process.env.DB_PORT ?? 5432);

// Lit le mode de fonctionnement du backend.
const nodeEnv = process.env.NODE_ENV ?? 'development';

// Lit la clé privée que le backend utilisera pour signer les jetons.
const jwtSecret = process.env.JWT_SECRET;

// Clé distincte utilisée uniquement pour chiffrer les secrets TOTP.
const twoFactorEncryptionKeyHex = process.env.TWO_FACTOR_ENCRYPTION_KEY;

// Une clé AES-256 doit contenir 32 octets, soit 64 caractères hexadécimaux.
if (
  !twoFactorEncryptionKeyHex ||
  !/^[0-9a-fA-F]{64}$/.test(twoFactorEncryptionKeyHex)
) {
  throw new Error(
    'TWO_FACTOR_ENCRYPTION_KEY doit contenir exactement 64 caractères hexadécimaux.'
  );
}

// Arrête le démarrage si la clé manque ou est trop courte.
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET doit contenir au moins 32 caractères.');
}
// Liste les réglages de la base qui doivent être présents dans .env.
const requiredDatabaseSettings = [
  ['DB_HOST', process.env.DB_HOST],
  ['DB_NAME', process.env.DB_NAME],
  ['DB_USER', process.env.DB_USER],
  ['DB_PASSWORD', process.env.DB_PASSWORD],
];

// Arrête le démarrage si une de ces valeurs manque.
for (const [settingName, settingValue] of requiredDatabaseSettings) {
  if (!settingValue || settingValue.trim() === '') {
    throw new Error(`La variable ${settingName} doit être définie dans le fichier .env.`);
  }
}

// Vérifie que les ports sont des nombres valides.
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT doit être un nombre entier entre 1 et 65535.');
}

if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
  throw new Error('DB_PORT doit être un nombre entier entre 1 et 65535.');
}

// Vérifie que le mode du backend est autorisé.
const allowedEnvironments = ['development', 'test', 'production'];

if (!allowedEnvironments.includes(nodeEnv)) {
  throw new Error(
    `NODE_ENV doit être l'une de ces valeurs : ${allowedEnvironments.join(', ')}.`
  );
}

// Rend la configuration disponible aux autres fichiers du backend.
export const env = Object.freeze({
  port,
  nodeEnv,
  jwtSecret,
  twoFactorEncryptionKey: Buffer.from(twoFactorEncryptionKeyHex, 'hex'),

  // Regroupe les réglages utilisés pour joindre PostgreSQL.
  database: Object.freeze({
    host: process.env.DB_HOST,
    port: databasePort,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }),
});