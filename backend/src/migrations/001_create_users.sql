-- Crée la table des comptes utilisateur.
CREATE TABLE IF NOT EXISTS public.users (
  -- Identifiant généré automatiquement pour chaque utilisateur.
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Informations saisies lors de l'inscription.
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(254) NOT NULL,

  -- Emplacement réservé au hash du mot de passe, jamais au mot de passe brut.
  password_hash VARCHAR(255) NOT NULL,

  -- Date à laquelle l'utilisateur a accepté les conditions.
  terms_accepted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Dates de création et de dernière modification du compte.
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Empêche d'enregistrer un nom vide ou composé uniquement d'espaces.
  CONSTRAINT users_full_name_not_empty CHECK (LENGTH(TRIM(full_name)) > 0),

  -- Empêche d'enregistrer un téléphone vide ou composé uniquement d'espaces.
  CONSTRAINT users_phone_not_empty CHECK (LENGTH(TRIM(phone)) > 0)
);

-- Empêche deux comptes d'utiliser la même adresse,
-- même si la casse des lettres est différente.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
  ON public.users (LOWER(email));