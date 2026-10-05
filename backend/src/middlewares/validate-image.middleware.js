// Vérifie que le contenu binaire correspond bien au type d'image annoncé.
export function validateProfilePhoto(req, res, next) {
  // Multer place le fichier reçu dans req.file.
  const file = req.file

  // Refuse la requête si aucun fichier n'a été envoyé.
  if (!file) {
    return res.status(400).json({
      message: 'Choisis une photo avant de l’envoyer.',
    })
  }

  // Le fichier reçu en mémoire doit contenir un Buffer pour être vérifiable.
  if (!Buffer.isBuffer(file.buffer)) {
    return res.status(400).json({
      message: 'Le fichier reçu ne peut pas être vérifié.',
    })
  }

  const bytes = file.buffer

  // Une véritable image PNG commence par cette signature de huit octets.
  const isPng =
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )

  // Une véritable image JPEG commence par les octets FF D8 FF.
  const isJpeg =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff

  // Une image WebP possède RIFF au début, puis WEBP aux octets 8 à 11.
  const isWebp =
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'

  // Vérifie à la fois le contenu binaire et le type déclaré par le navigateur.
  const matchesDeclaredType =
    (isPng && file.mimetype === 'image/png') ||
    (isJpeg && file.mimetype === 'image/jpeg') ||
    (isWebp && file.mimetype === 'image/webp')

  // Rejette les fichiers dont le contenu n'est pas une image acceptée.
  if (!matchesDeclaredType) {
    return res.status(415).json({
      message: 'Le contenu du fichier ne correspond pas à une image JPEG, PNG ou WebP valide.',
    })
  }

  // L'image a passé la vérification : Express peut continuer vers l'enregistrement.
  return next()
}