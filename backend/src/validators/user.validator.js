// Vérifie les informations reçues quand un utilisateur modifie son profil.
export function validateProfileUpdate(data) {
  const errors = [];

  // Le frontend doit envoyer un objet contenant les informations du profil.
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return ['Les données doivent être envoyées sous la forme d’un objet JSON.'];
  }

  // Le nom est obligatoire et ne doit pas dépasser la limite de la base de données.
  if (typeof data.fullName !== 'string' || data.fullName.trim() === '') {
    errors.push('Le nom complet est obligatoire.');
  } else if (data.fullName.trim().length > 100) {
    errors.push('Le nom complet ne doit pas dépasser 100 caractères.');
  }

  // Le téléphone est obligatoire et sa colonne en base accepte au plus 30 caractères.
  if (typeof data.phone !== 'string' || data.phone.trim() === '') {
    errors.push('Le téléphone est obligatoire.');
  } else if (data.phone.trim().length > 30) {
    errors.push('Le téléphone ne doit pas dépasser 30 caractères.');
  }

  // Vérifie que l'adresse e-mail a un format simple valide et respecte la limite de 254 caractères.
  const emailIsValid =
    typeof data.email === 'string' &&
    data.email.trim().length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());

  if (!emailIsValid) {
    errors.push('Une adresse e-mail valide est obligatoire.');
  }

  // Une liste vide signifie que les trois informations sont valides.
  return errors;
}