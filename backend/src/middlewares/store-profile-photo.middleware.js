// Génère un nom de fichier aléatoire qui ne dépend pas du nom fourni par l'utilisateur.
import { randomUUID } from 'node:crypto'

// Fournit les fonctions pour créer des dossiers et enregistrer des fichiers.
import { mkdir, writeFile } from 'node:fs/promises'

// Sert à construire le chemin du dossier d'upload de façon compatible avec Windows.
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Trouve le dossier du backend à partir de l'emplacement de ce fichier.
const currentDirectory = dirname(fileURLToPath(import.meta.url))
const backendDirectory = resolve(currentDirectory, '../..')

// Les extensions sont choisies selon le type validé par le middleware précédent.
const imageExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

// Enregistre la photo déjà reçue et vérifiée.
export async function storeProfilePhoto(req, res, next) {
  try {
    // Le middleware d'upload et celui de validation doivent avoir été exécutés avant.
    const file = req.file

    if (!file || !Buffer.isBuffer(file.buffer)) {
      return res.status(400).json({
        message: 'Aucune photo valide n’a été reçue.',
      })
    }

    // Choisit l'extension d'après le type d'image vérifié.
    const extension = imageExtensions[file.mimetype]

    if (!extension) {
      return res.status(415).json({
        message: 'Le format de cette photo n’est pas accepté.',
      })
    }

    // Construit le dossier et le nom sans utiliser le nom de fichier fourni par le navigateur.
    const uploadDirectory = resolve(backendDirectory, 'uploads', 'profile-photos')
    const filename = `${randomUUID()}${extension}`
    const absoluteFilePath = resolve(uploadDirectory, filename)

    // Crée le dossier au premier upload, s'il n'existe pas encore.
    await mkdir(uploadDirectory, { recursive: true })

    // Le mode "wx" évite d'écraser un fichier qui porterait déjà ce nom.
    await writeFile(absoluteFilePath, file.buffer, { flag: 'wx' })

    // Garde le chemin public à enregistrer en base à l'étape suivante.
    req.profilePhoto = {
      filename,
      path: `/uploads/profile-photos/${filename}`,
    }

    // Passe à la suite de la route une fois le fichier écrit.
    return next()
  } catch (error) {
    // Transmet les erreurs de création ou d'écriture au gestionnaire central.
    return next(error)
  }
}