// Multer reçoit les fichiers envoyés par le formulaire.
import multer from 'multer'

// Les formats d'image acceptés pour la photo de profil.
const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

// Prépare la réception d'un seul fichier image, limité à 5 Mo.
// Le fichier reste temporairement en mémoire ; il n'est pas encore enregistré.
const receivePhoto = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, callback) {
    // Refuse les formats que l'application n'accepte pas.
    if (!allowedImageTypes.has(file.mimetype)) {
      const error = new Error('Format refusé. Choisis une image JPEG, PNG ou WebP.')
      error.code = 'UNSUPPORTED_IMAGE_TYPE'
      return callback(error)
    }

    // Accepte le fichier provisoirement pour que l'étape suivante
    // puisse vérifier son contenu réel avant de l'enregistrer.
    return callback(null, true)
  },
})

// Middleware Express appelé par la future route d'envoi de photo.
export function uploadProfilePhoto(req, res, next) {
  // Le champ de fichier du formulaire devra s'appeler "photo".
  receivePhoto.single('photo')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      // 413 signifie que le fichier dépasse la taille autorisée.
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          message: 'La photo ne doit pas dépasser 5 Mo.',
        })
      }

      // Signale les autres erreurs de réception du fichier.
      return res.status(400).json({
        message: 'Le fichier envoyé ne peut pas être reçu.',
      })
    }

    if (error?.code === 'UNSUPPORTED_IMAGE_TYPE') {
      // 415 signifie que le format envoyé n'est pas accepté.
      return res.status(415).json({
        message: error.message,
      })
    }

    // Transmet les autres erreurs au gestionnaire central d'Express.
    if (error) {
      return next(error)
    }

    // Le fichier reçu est disponible dans req.file pour la prochaine étape.
    return next()
  })
}