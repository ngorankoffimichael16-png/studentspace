// Outils de test intégrés à Node.js.
import test from 'node:test';
import assert from 'node:assert/strict';

// Fonctions de chiffrement que nous voulons vérifier.
import {
  encryptTwoFactorSecret,
  decryptTwoFactorSecret,
} from './twoFactorCrypto.js';

test('chiffre puis déchiffre correctement un secret TOTP', () => {
  const secret = 'JBSWY3DPEHPK3PXP';

  const encryptedSecret = encryptTwoFactorSecret(secret);
  const decryptedSecret = decryptTwoFactorSecret(encryptedSecret);

  // Le texte chiffré ne doit pas être identique au secret original.
  assert.notEqual(encryptedSecret, secret);

  // Après déchiffrement, le secret d'origine doit être retrouvé.
  assert.equal(decryptedSecret, secret);
});

test('refuse un secret chiffré dont le tag a été modifié', () => {
  const encryptedSecret = encryptTwoFactorSecret('JBSWY3DPEHPK3PXP');
  const parts = encryptedSecret.split('.');

  // Modifie le tag tout en gardant un encodage base64url valide.
  const replacement = parts[2][0] === 'A' ? 'B' : 'A';
  parts[2] = replacement + parts[2].slice(1);

  // AES-GCM doit détecter que les données n'ont pas été produites intactes.
  assert.throws(() => decryptTwoFactorSecret(parts.join('.')));
});

test('refuse les secrets vides', () => {
  assert.throws(() => encryptTwoFactorSecret(''));
  assert.throws(() => decryptTwoFactorSecret(''));
});