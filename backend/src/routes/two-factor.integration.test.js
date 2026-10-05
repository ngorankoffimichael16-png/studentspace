// Outils de test et de synchronisation intégrés à Node.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { generate } from 'otplib';

// Importe l'application Express sans démarrer le serveur de production.
import app from '../app.js';

// Utilise la même base et le même service d'inscription que l'application.
import { pool } from '../config/database.js';
import { registerUser } from '../services/auth.service.js';
import { generateToken } from '../utils/generateToken.js';

test('protège les routes et exige le code TOTP avant de créer une session', async (t) => {
  const email = `http-totp-${randomUUID()}@example.invalid`;
  const phone = `07${randomUUID().replaceAll('-', '').slice(0, 8)}`;
  const user = await registerUser({
    fullName: 'Test HTTP 2FA',
    phone,
    email,
    password: 'motdepasse123',
    confirmPassword: 'motdepasse123',
    acceptTerms: true,
  });

  // Le serveur de test écoute sur un port libre choisi par le système.
  const server = app.listen(0);
  await once(server, 'listening');
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  // Ferme le serveur puis supprime uniquement le compte créé pour ce test.
  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await pool.query('DELETE FROM public.users WHERE id = $1', [user.id]);
  });

  const accessToken = generateToken(user.id);

  // Une personne sans session ne peut pas demander le QR de configuration.
  const unauthorizedSetup = await fetch(
    `${baseUrl}/api/users/me/two-factor/setup`,
    { method: 'POST' }
  );
  assert.equal(unauthorizedSetup.status, 401);

  // Le compte connecté reçoit un QR code et une clé pour son application.
  const setupResponse = await fetch(
    `${baseUrl}/api/users/me/two-factor/setup`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  );
  assert.equal(setupResponse.status, 200);
  const setup = await setupResponse.json();
  assert.match(setup.qrCodeDataUrl, /^data:image\/png;base64,/);

  // Le code généré par l'application confirme la configuration.
  const validCode = await generate({ secret: setup.manualSecret });
  const confirmationResponse = await fetch(
    `${baseUrl}/api/users/me/two-factor/confirm`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: validCode }),
    }
  );
  assert.equal(confirmationResponse.status, 200);

  // Le mot de passe correct renvoie un challenge, jamais le jeton de session.
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'motdepasse123' }),
  });
  assert.equal(loginResponse.status, 200);
  const login = await loginResponse.json();
  assert.equal(login.requiresTwoFactor, true);
  assert.equal(login.token, undefined);

  // Le challenge temporaire ne fonctionne pas sur une route de session normale.
  const challengeCannotOpenProfile = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${login.challengeToken}`,
    },
  });
  assert.equal(challengeCannotOpenProfile.status, 401);

  // Le bon TOTP termine la connexion et donne un jeton d'accès normal.
  const verificationResponse = await fetch(
    `${baseUrl}/api/auth/login/verify-2fa`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${login.challengeToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: validCode }),
    }
  );
  assert.equal(verificationResponse.status, 200);
  const verifiedLogin = await verificationResponse.json();
  assert.equal(typeof verifiedLogin.token, 'string');

  // Le jeton final ouvre le profil et indique l'état 2FA.
  const profileResponse = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${verifiedLogin.token}`,
    },
  });
  assert.equal(profileResponse.status, 200);
  const profile = await profileResponse.json();
  assert.equal(profile.user.twoFactorEnabled, true);

  // La désactivation demande le même code actuel et efface le secret en base.
  const disableResponse = await fetch(
    `${baseUrl}/api/users/me/two-factor/disable`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${verifiedLogin.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: validCode }),
    }
  );
  assert.equal(disableResponse.status, 200);
  const disabled = await disableResponse.json();
  assert.equal(disabled.enabled, false);
});

// Ferme les connexions PostgreSQL ouvertes par ce fichier de tests.
test.after(async () => {
  await pool.end();
});
