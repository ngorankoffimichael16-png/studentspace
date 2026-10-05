import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';

import { pool } from '../config/database.js';
import {
  loginUser,
  registerUser,
  LoginError,
  RegistrationError,
} from './auth.service.js';

const makeRegistration = (email, phone = `07${randomUUID().replaceAll('-', '').slice(0, 8)}`) => ({
  fullName: 'Awa Exemple',
  phone,
  email,
  password: 'motdepasse123',
  confirmPassword: 'motdepasse123',
  acceptTerms: true,
});

test('inscrit un utilisateur et stocke un hash, pas son mot de passe', async (t) => {
  const email = `test-${randomUUID()}@example.invalid`;

  const user = await registerUser(makeRegistration(email));

  // Supprime uniquement le compte créé par ce test.
  t.after(async () => {
    await pool.query('DELETE FROM public.users WHERE id = $1', [user.id]);
  });

  // Lit le hash directement dans la base pour vérifier qu'il protège le mot de passe.
  const result = await pool.query(
    'SELECT password_hash FROM public.users WHERE id = $1',
    [user.id]
  );

  const storedHash = result.rows[0].password_hash;

  assert.equal(user.email, email);
  assert.equal(user.password_hash, undefined);
  assert.notEqual(storedHash, 'motdepasse123');
  assert.equal(await bcrypt.compare('motdepasse123', storedHash), true);
});

test('refuse une inscription avec des mots de passe différents', async () => {
  const registration = makeRegistration(`test-${randomUUID()}@example.invalid`);
  registration.confirmPassword = 'mot-de-passe-different';

  await assert.rejects(
    registerUser(registration),
    (error) =>
      error instanceof RegistrationError &&
      error.code === 'INVALID_REGISTRATION'
  );
});

test('signale les champs déjà utilisés, y compris ensemble', async (t) => {
  const phone = `07${randomUUID().replaceAll('-', '').slice(0, 8)}`;
  const email = `phone-first-${randomUUID()}@example.invalid`;
  const registeredUser = await registerUser(
    makeRegistration(email, phone)
  );

  t.after(async () => {
    await pool.query('DELETE FROM public.users WHERE id = $1', [
      registeredUser.id,
    ]);
  });

  await assert.rejects(
    registerUser(
      makeRegistration(`phone-second-${randomUUID()}@example.invalid`, phone)
    ),
    (error) =>
      error instanceof RegistrationError &&
      error.code === 'DUPLICATE_FIELDS' &&
      assert.deepEqual(error.details, ['phone']) === undefined
  );

  await assert.rejects(
    registerUser(makeRegistration(email, phone)),
    (error) =>
      error instanceof RegistrationError &&
      error.code === 'DUPLICATE_FIELDS' &&
      assert.deepEqual(error.details, ['email', 'phone']) === undefined
  );
});

test.after(async () => {
  await pool.end();
});


test('connecte un utilisateur et distingue les erreurs de connexion', async (t) => {
  // Crée un e-mail différent à chaque exécution du test.
  const email = `login-${randomUUID()}@example.invalid`;

  // Crée d'abord le compte en utilisant le service d'inscription.
  const registeredUser = await registerUser(makeRegistration(email));

  // Supprime ce compte de test après la vérification.
  t.after(async () => {
    await pool.query('DELETE FROM public.users WHERE id = $1', [
      registeredUser.id,
    ]);
  });

  // Le bon mot de passe doit permettre la connexion.
  const loggedInUser = await loginUser({
    email,
    password: 'motdepasse123',
  });

  assert.equal(loggedInUser.user.email, email);
  assert.equal(typeof loggedInUser.token, 'string');

  // Le hash ne doit jamais être renvoyé au client.
  assert.equal(loggedInUser.user.password_hash, undefined);

  // Une adresse inconnue doit produire une erreur spécifique.
  await assert.rejects(
    loginUser({
      email: `unknown-${randomUUID()}@example.invalid`,
      password: 'motdepasse123',
    }),
    (error) =>
      error instanceof LoginError &&
      error.code === 'EMAIL_NOT_FOUND'
  );

  // Un mot de passe incorrect doit produire une erreur distincte.
  await assert.rejects(
    loginUser({
      email,
      password: 'mauvais-mot-de-passe',
    }),
    (error) =>
      error instanceof LoginError &&
      error.code === 'INVALID_PASSWORD'
  );
});