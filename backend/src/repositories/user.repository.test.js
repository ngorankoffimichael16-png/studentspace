// Outils de test intégrés à Node.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
// Importe la connexion à la base et la fonction que nous testons.
import { pool } from '../config/database.js';
import {
  createUser,
  enableTwoFactorIfSecretMatches,
  findTwoFactorSettingsByUserId,
  findUserByEmail,
  saveTwoFactorSecretIfDisabled,
} from './user.repository.js';

// Vérifie que la recherche renvoie null quand l'adresse n'existe pas.
test('findUserByEmail renvoie null si aucun compte ne correspond', async () => {
  const user = await findUserByEmail('aucun-compte@example.invalid');

  assert.equal(user, null);
});
test('createUser ajoute un utilisateur dans la base', async (t) => {
  const email = `test-${randomUUID()}@example.invalid`;

  const user = await createUser({
    fullName: 'Utilisateur de test',
    phone: '0000000000',
    email,
    passwordHash: 'hash-factice-reserve-au-test',
  });

  // Supprime la ligne de test après le test, même si une vérification échoue.
  t.after(async () => {
    await pool.query('DELETE FROM public.users WHERE id = $1', [user.id]);
  });

  assert.equal(user.email, email);
  assert.equal(user.full_name, 'Utilisateur de test');
  assert.equal(user.password_hash, undefined);
});

test('enregistre et active la 2FA seulement avec le secret courant', async (t) => {
  const email = `two-factor-${randomUUID()}@example.invalid`;
  const user = await createUser({
    fullName: 'Utilisateur 2FA',
    phone: '0000000000',
    email,
    passwordHash: 'hash-factice-reserve-au-test',
  });

  // Supprime uniquement le compte créé par ce test.
  t.after(async () => {
    await pool.query('DELETE FROM public.users WHERE id = $1', [user.id]);
  });

  const initialSettings = await findTwoFactorSettingsByUserId(user.id);
  assert.equal(initialSettings.email, email);
  assert.equal(initialSettings.two_factor_enabled, false);
  assert.equal(initialSettings.two_factor_secret_encrypted, null);

  const loginRecord = await findUserByEmail(email);
  assert.equal(loginRecord.two_factor_enabled, false);
  assert.equal(loginRecord.two_factor_secret_encrypted, null);

  const encryptedSecret = 'secret-chiffre-pour-test';
  const saved = await saveTwoFactorSecretIfDisabled(user.id, encryptedSecret);
  assert.equal(saved.id, user.id);

  const staleSecretActivation = await enableTwoFactorIfSecretMatches(
    user.id,
    'ancien-secret-chiffre'
  );
  assert.equal(staleSecretActivation, null);

  const activated = await enableTwoFactorIfSecretMatches(
    user.id,
    encryptedSecret
  );
  assert.equal(activated.id, user.id);

  const finalSettings = await findTwoFactorSettingsByUserId(user.id);
  assert.equal(finalSettings.two_factor_enabled, true);

  // Une configuration active ne peut pas être remplacée par cette fonction.
  const replacedSecret = await saveTwoFactorSecretIfDisabled(
    user.id,
    'nouveau-secret-chiffre'
  );
  assert.equal(replacedSecret, null);
});

// Ferme les connexions à PostgreSQL après le test.
test.after(async () => {
  await pool.end();
});