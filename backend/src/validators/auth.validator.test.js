// Outils de test inclus dans Node.js.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateLogin,
  validateRegistration,
} from './auth.validator.js';


// Données d'inscription d'exemple, sans créer de compte.
const validRegistration = {
  fullName: 'Awa Exemple',
  phone: '0700000000',
  email: 'awa@example.com',
  password: 'motdepasse123',
  confirmPassword: 'motdepasse123',
  acceptTerms: true,
};

test('accepte les données d’inscription correctes', () => {
  const errors = validateRegistration(validRegistration);

  assert.deepEqual(errors, []);
});

test('refuse une adresse e-mail invalide', () => {
  const errors = validateRegistration({
    ...validRegistration,
    email: 'adresse-invalide',
  });

  assert.ok(errors.includes('Une adresse e-mail valide est obligatoire.'));
});

test('refuse deux mots de passe différents', () => {
  const errors = validateRegistration({
    ...validRegistration,
    confirmPassword: 'un-autre-mot-de-passe',
  });

  assert.ok(errors.includes('Les deux mots de passe doivent être identiques.'));
});
test('accepte les données de connexion correctes', () => {
  // Une connexion valide contient un e-mail et un mot de passe.
  const errors = validateLogin({
    email: 'awa@example.com',
    password: 'motdepasse123',
  });

  // Une liste vide signifie qu'il n'y a aucune erreur.
  assert.deepEqual(errors, []);
});

test('refuse un e-mail invalide à la connexion', () => {
  // L'adresse n'a pas le format attendu.
  const errors = validateLogin({
    email: 'adresse-invalide',
    password: 'motdepasse123',
  });

  // La validation doit signaler le problème d'e-mail.
  assert.ok(errors.includes('Une adresse e-mail valide est obligatoire.'));
});

test('refuse un mot de passe absent à la connexion', () => {
  // Le mot de passe est vide : le backend doit refuser la demande.
  const errors = validateLogin({
    email: 'awa@example.com',
    password: '',
  });

  // La validation doit signaler que le mot de passe est obligatoire.
  assert.ok(errors.includes('Le mot de passe est obligatoire.'));
}); 
