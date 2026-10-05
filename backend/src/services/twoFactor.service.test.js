// Outils de test intégrés à Node.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { generate } from 'otplib';

// Utilise le véritable accès à la base pour tester le parcours complet.
import { pool } from '../config/database.js';
import { env } from '../config/env.js';

// Réutilise le service d'inscription pour créer un compte temporaire valide.
import { registerUser } from './auth.service.js';

// Fonctions du parcours 2FA testées de la configuration à la désactivation.
import {
  confirmTwoFactorSetup,
  disableTwoFactor,
  setupTwoFactor,
  TwoFactorError,
  verifyTwoFactorLogin,
} from './twoFactor.service.js';

// Permet de vérifier que le mot de passe seul ne fournit plus de session 2FA.
import { loginUser } from './auth.service.js';

test('configure, confirme, utilise puis désactive la 2FA', async (t) => {
  const email = `totp-${randomUUID()}@example.invalid`;
  const phone = `07${randomUUID().replaceAll('-', '').slice(0, 8)}`;

  // Crée un compte de test comme lors d'une véritable inscription.
  const user = await registerUser({
    fullName: 'Compte TOTP de test',
    phone,
    email,
    password: 'motdepasse123',
    confirmPassword: 'motdepasse123',
    acceptTerms: true,
  });

  // Supprime uniquement le compte temporaire même si une assertion échoue.
  t.after(async () => {
    await pool.query('DELETE FROM public.users WHERE id = $1', [user.id]);
  });

  // Le service doit renvoyer un QR scannable et une clé de secours manuelle.
  const setup = await setupTwoFactor(user.id);
  assert.match(setup.qrCodeDataUrl, /^data:image\/png;base64,/);
  assert.equal(typeof setup.manualSecret, 'string');

  // Vérifie que la base conserve un secret chiffré, et que la 2FA est encore inactive.
  const pendingSettings = await pool.query(
    `SELECT two_factor_enabled, two_factor_secret_encrypted
     FROM public.users
     WHERE id = $1`,
    [user.id]
  );
  assert.equal(pendingSettings.rows[0].two_factor_enabled, false);
  assert.notEqual(
    pendingSettings.rows[0].two_factor_secret_encrypted,
    setup.manualSecret
  );

  // Génère le code valide de l'application pour ce secret.
  const validCode = await generate({ secret: setup.manualSecret });

  // Un code modifié doit être refusé et laisser la 2FA inactive.
  const invalidCode =
    (validCode[0] === '0' ? '1' : '0') + validCode.slice(1);
  await assert.rejects(
    confirmTwoFactorSetup(user.id, invalidCode),
    (error) =>
      error instanceof TwoFactorError && error.code === 'INVALID_TOTP_CODE'
  );

  // Seul le bon code confirme l'application et active la 2FA.
  const confirmation = await confirmTwoFactorSetup(user.id, validCode);
  assert.deepEqual(confirmation, { enabled: true });

  // Le mot de passe correct ne doit rendre qu'un challenge, jamais le jeton final.
  const loginChallenge = await loginUser({ email, password: 'motdepasse123' });
  assert.equal(loginChallenge.requiresTwoFactor, true);
  assert.equal(loginChallenge.token, undefined);
  assert.equal(typeof loginChallenge.challengeToken, 'string');

  // Vérifie que le challenge a un usage distinct du jeton de session normal.
  const challengePayload = jwt.verify(
    loginChallenge.challengeToken,
    env.jwtSecret,
    {
      algorithms: ['HS256'],
      issuer: 'studentspace-2fa-challenge',
    }
  );
  assert.equal(challengePayload.purpose, 'two-factor-login');

  // Le code TOTP valide permet enfin de recevoir un jeton de session normal.
  const completedLogin = await verifyTwoFactorLogin(user.id, validCode);
  assert.equal(typeof completedLogin.token, 'string');
  jwt.verify(completedLogin.token, env.jwtSecret, {
    algorithms: ['HS256'],
    issuer: 'studentspace-api',
  });

  // La désactivation exige elle aussi un code actuel valide.
  const disabled = await disableTwoFactor(user.id, validCode);
  assert.deepEqual(disabled, { enabled: false });

  const finalSettings = await pool.query(
    `SELECT two_factor_enabled, two_factor_secret_encrypted
     FROM public.users
     WHERE id = $1`,
    [user.id]
  );
  assert.equal(finalSettings.rows[0].two_factor_enabled, false);
  assert.equal(finalSettings.rows[0].two_factor_secret_encrypted, null);
});

// Ferme les connexions ouvertes par ce fichier de tests.
test.after(async () => {
  await pool.end();
});
