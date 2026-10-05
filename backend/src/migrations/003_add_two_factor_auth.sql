-- Ajoute le statut 2FA, désactivé pour les comptes existants.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- Servira à stocker le secret TOTP chiffré, jamais en texte brut.
  ADD COLUMN IF NOT EXISTS two_factor_secret_encrypted TEXT;