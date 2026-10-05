// Vérifie les données reçues lors de la création d'un compte.
export function validateRegistration(data) {
  // La fonction renverra une liste de problèmes.
  const errors = [];

  // Une inscription doit être reçue sous la forme d'un objet JSON.
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return ['Les données doivent être envoyées sous la forme d’un objet JSON.'];
  }

  // Le nom doit être du texte et contenir autre chose que des espaces.
  if (typeof data.fullName !== 'string' || data.fullName.trim() === '') {
    errors.push('Le nom complet est obligatoire.');
  }

  // Le téléphone doit être du texte et ne pas être vide.
  if (typeof data.phone !== 'string' || data.phone.trim() === '') {
    errors.push('Le téléphone est obligatoire.');
  }

  // Vérifie que l'e-mail ressemble au format habituel nom@domaine.com.
  const emailIsValid =
    typeof data.email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());

  if (!emailIsValid) {
    errors.push('Une adresse e-mail valide est obligatoire.');
  }

  // Le mot de passe doit contenir au moins 8 caractères.
  if (typeof data.password !== 'string' || data.password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères.');
  }

  // La confirmation doit être présente.
  if (
    typeof data.confirmPassword !== 'string' ||
    data.confirmPassword.length === 0
  ) {
    errors.push('La confirmation du mot de passe est obligatoire.');
  } else if (
    typeof data.password === 'string' &&
    data.password !== data.confirmPassword
  ) {
    errors.push('Les deux mots de passe doivent être identiques.');
  }

  // L'utilisateur doit avoir coché l'acceptation des conditions.
  if (data.acceptTerms !== true) {
    errors.push('Les conditions doivent être acceptées.');
  }

  // Une liste vide signifie que toutes les vérifications sont réussies.
  return errors;
}

// Vérifie les données reçues lors de la connexion.
export function validateLogin(data) {
  // La fonction renverra une liste de problèmes.
  const errors = [];

  // Une connexion doit être reçue sous la forme d'un objet JSON.
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return ['Les données doivent être envoyées sous la forme d’un objet JSON.'];
  }

  // Vérifie que l'e-mail a un format valide.
  const emailIsValid =
    typeof data.email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());

  if (!emailIsValid) {
    errors.push('Une adresse e-mail valide est obligatoire.');
  }

  // À la connexion, on vérifie que le mot de passe est présent.
  // On ne le transforme pas et on ne le hache pas ici.
  if (typeof data.password !== 'string' || data.password.length === 0) {
    errors.push('Le mot de passe est obligatoire.');
  }

  // Une liste vide signifie que les données sont valides.
  return errors;
}