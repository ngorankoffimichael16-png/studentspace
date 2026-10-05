// Outils de test fournis par Node.js.
import test from 'node:test';
import assert from 'node:assert/strict';

// Importe le gestionnaire d'erreurs que l'on veut tester.
import { errorHandler } from './error.middleware.js';

test('renvoie une réponse 500 sans révéler les détails internes', () => {
  // Simule une erreur interne, comme un problème inattendu de base de données.
  const error = new Error('Détail secret de la base');

  // Ces variables permettront de vérifier la réponse simulée.
  let statusCode;
  let responseBody;

  // Simule les méthodes de réponse utilisées par Express.
  const res = {
    headersSent: false,

    status(code) {
      statusCode = code;
      return this;
    },

    json(body) {
      responseBody = body;
      return this;
    },
  };

  // Appelle directement le gestionnaire avec l'erreur simulée.
  errorHandler(error, {}, res, () => {});

  // Vérifie que le client reçoit une réponse 500 générique.
  assert.equal(statusCode, 500);
  assert.equal(responseBody.message, 'Une erreur interne est survenue.');
  assert.equal(JSON.stringify(responseBody).includes('Détail secret'), false);
});
