import { useState } from 'react'
import SignupHeader from './SignupHeader'
import FormFields from './FormFields'
import SubmitButton from './SubmitButton'
import AuthFooter from './AuthFooter'

// Axios envoie les données du formulaire au backend.
import axios from 'axios'
import { apiUrl } from '@/lib/api'

function SignupBox() {
  // Stocke toutes les valeurs du formulaire dans un seul objet
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })

  // Stocke les erreurs actuelles de chaque champ
  const [errors, setErrors] = useState({})

  // Fonction appelée à chaque frappe/clic sur n'importe quel champ
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // Pour une checkbox on utilise "checked", pour tout le reste on utilise "value"
    const newValue = type === 'checkbox' ? checked : value

    // On calcule le nouvel état AVANT de l'enregistrer, pour pouvoir le réutiliser juste en dessous
    // (on ne peut pas relire "formData" juste après setFormData, car la mise à jour n'est pas instantanée)
    const newFormData = { ...formData, [name]: newValue }
    setFormData(newFormData)

    // NOUVEAUTÉ : vérification EN TEMPS RÉEL (pas seulement au clic sur le bouton)
    // Dès que l'utilisateur tape dans "password" OU "confirmPassword", on vérifie immédiatement
    if (name === 'password' || name === 'confirmPassword') {
      if (
        newFormData.password &&
        newFormData.confirmPassword &&
        newFormData.password !== newFormData.confirmPassword
      ) {
        // Si les 2 mots de passe sont remplis MAIS différents → erreur 'mismatch'
        setErrors({ ...errors, confirmPassword: 'mismatch' })
      } else {
        // Sinon (vides ou identiques) → pas d'erreur pour l'instant
        setErrors({ ...errors, confirmPassword: false })
      }
    }
  }

  // Fonction appelée au clic sur "Créer mon compte"
  // Cette fonction est appelée quand on soumet le formulaire.
const handleSubmit = async (e) => {
  // Empêche la page de se recharger après le clic.
  e.preventDefault()

  // Prépare la liste des erreurs trouvées dans le formulaire.
  const newErrors = {}

  // Vérifie que les champs obligatoires ne sont pas vides.
  if (!formData.fullName.trim()) newErrors.fullName = true
  if (!formData.phone.trim()) newErrors.phone = true
  if (!formData.email.trim()) newErrors.email = true
  if (!formData.password) newErrors.password = true

  // Vérifie que la confirmation du mot de passe est présente et correcte.
  if (!formData.confirmPassword) {
    newErrors.confirmPassword = 'required'
  } else if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'mismatch'
  }

  // Il faut accepter les conditions pour créer le compte.
  if (!formData.acceptTerms) newErrors.acceptTerms = true

  // Demande à React d'afficher les erreurs sous les champs concernés.
  setErrors(newErrors)

  // S'il y a des erreurs, arrête la fonction sans contacter le backend.
  if (Object.keys(newErrors).length > 0) return

  try {
    // Envoie les valeurs du formulaire à la route d'inscription du backend.
    const response = await axios.post(
      apiUrl('/api/auth/register'),
      formData
    )

    // Affiche le message de succès renvoyé par le backend.
    alert(response.data.message)
  } catch (error) {
    // Affiche le message d'erreur renvoyé par le backend,
    // par exemple si cet e-mail est déjà utilisé.
    const message = error.response?.data?.message

    // Si le backend ne répond pas, affiche une indication utile.
    alert(message || 'Le backend ne répond pas. Vérifie qu’il est démarré.')
  }
}

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md my-[50px]">
      <SignupHeader />
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <FormFields formData={formData} onChange={handleChange} errors={errors} />
        <SubmitButton />
      </form>
      <AuthFooter />
    </div>
  )
}

export default SignupBox