-- Ajoute l'emplacement de la photo au compte utilisateur.
-- La valeur reste NULL pour les comptes qui n'ont pas encore de photo.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_path TEXT;