// useState permet de mémoriser les valeurs et les messages du formulaire.
import { useState } from 'react'

// useLocation lit le message transmis par la page d'inscription.
import { useLocation, useNavigate } from 'react-router-dom'

// Axios envoie les demandes HTTP du navigateur vers le backend.
import axios from 'axios'
import { apiUrl } from '@/lib/api'

// Ces composants affichent le titre, les champs, le bouton et les liens du formulaire.
import LoginHeader from './LoginHeader'
import LoginFields from './LoginFields'
import LoginSubmitButton from './LoginSubmitButton'
import LoginFooter from './LoginFooter'

function LoginBox() {
  // Récupère le message de confirmation envoyé après l'inscription.
  const location = useLocation()

  // Affiche la confirmation d'inscription à l'ouverture de la page de connexion.
  const [apiMessage, setApiMessage] = useState(
    location.state?.message || ''
  )

  // Le message transmis après l'inscription est un message positif.
  const [loginSuccess, setLoginSuccess] = useState(
    Boolean(location.state?.message)
  )

  // Prépare la fonction qui redirigera l'utilisateur après sa connexion.
  const navigate = useNavigate()

  // Contient les valeurs saisies dans les champs du formulaire.
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Contient les erreurs à afficher sous les champs.
  const [errors, setErrors] = useState({})

  // Indique si une demande de connexion est en cours.
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Garde le challenge uniquement en mémoire jusqu'à la vérification du code.
  const [twoFactorChallengeToken, setTwoFactorChallengeToken] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorError, setTwoFactorError] = useState('')

  // Cette fonction est appelée quand l'utilisateur modifie un champ.
  const handleChange = (e) => {
    const { name, value } = e.target

    // Met à jour uniquement le champ qui vient d'être modifié.
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    // Efface l'erreur de champ modifié et les erreurs d'identifiants précédentes.
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: false,
      ...(typeof currentErrors.email === 'string' ? { email: false } : {}),
      ...(typeof currentErrors.password === 'string'
        ? { password: false }
        : {}),
    }))

    // Efface l'ancien message pour ne pas le confondre avec la nouvelle tentative.
    setApiMessage('')
    setLoginSuccess(false)
  }

  // Envoie le code TOTP avec le jeton provisoire, jamais avec une session finale.
  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault()
    setTwoFactorError('')

    if (!/^\d{6}$/.test(twoFactorCode)) {
      setTwoFactorError('Saisis le code à 6 chiffres de ton application.')
      return
    }

    setIsSubmitting(true)

    try {
      // Le challenge temporaire autorise uniquement la validation du second facteur.
      const response = await axios.post(
        apiUrl('/api/auth/login/verify-2fa'),
        { token: twoFactorCode },
        {
          headers: {
            Authorization: `Bearer ${twoFactorChallengeToken}`,
          },
        }
      )

      const token = response.data?.token

      if (!token) {
        throw new Error('Le backend n’a pas renvoyé le jeton de session.')
      }

      // Seul le jeton final est conservé après la validation du code.
      try {
        sessionStorage.setItem('token', token)
      } catch {
        setTwoFactorError(
          'Le navigateur n’a pas permis de conserver la session.'
        )
        return
      }

      // Vérifie la session nouvellement créée avant d'ouvrir le tableau de bord.
      const userResponse = await axios.get(
        apiUrl('/api/auth/me'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!userResponse.data?.user) {
        throw new Error('Le backend n’a pas renvoyé les informations du compte.')
      }

      setTwoFactorChallengeToken('')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setTwoFactorError(
        error.response?.data?.message ||
          error.message ||
          'Impossible de vérifier le code.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cette fonction est appelée lorsque l'utilisateur soumet le formulaire.
  const handleSubmit = async (e) => {
    // Empêche le navigateur de recharger la page.
    e.preventDefault()

    // Vérifie que les deux champs obligatoires sont remplis.
    const newErrors = {}

    if (!formData.email.trim()) newErrors.email = true
    if (!formData.password) newErrors.password = true

    // Demande à React d'afficher les erreurs trouvées sous les champs.
    setErrors(newErrors)

    // Efface le message d'une précédente tentative.
    setApiMessage('')
    setLoginSuccess(false)

    // S'il manque un champ, ne contacte pas le backend.
    if (Object.keys(newErrors).length > 0) return

    // Active l'indication de chargement pendant les appels au backend.
    setIsSubmitting(true)

    try {
      // Envoie l'e-mail et le mot de passe à la route de connexion.
      const loginResponse = await axios.post(
        apiUrl('/api/auth/login'),
        {
          email: formData.email.trim(),
          password: formData.password,
        }
      )

      // Si le compte utilise la 2FA, on demande le code avant de stocker une session.
      if (loginResponse.data?.requiresTwoFactor === true) {
        const challengeToken = loginResponse.data?.challengeToken

        if (!challengeToken) {
          setApiMessage('Le backend n’a pas renvoyé le challenge de vérification.')
          return
        }

        setTwoFactorChallengeToken(challengeToken)
        setTwoFactorCode('')
        setTwoFactorError('')
        setApiMessage('Mot de passe vérifié. Saisis le code de ton application.')
        return
      }

      // Le backend doit renvoyer un jeton après une connexion réussie.
      const token = loginResponse.data?.token

      // Signale une réponse inattendue si le jeton est absent.
      if (!token) {
        setApiMessage('Le backend n’a pas renvoyé le jeton de connexion.')
        return
      }

      try {
        // Conserve le jeton dans cet onglet pour les prochaines requêtes authentifiées.
        sessionStorage.setItem('token', token)
      } catch {
        // Affiche explicitement l'échec si le navigateur interdit l'accès au stockage.
        setApiMessage(
          'Connexion réussie, mais le navigateur n’a pas permis de conserver la session.'
        )
        return
      }

      // Demande au backend les informations du compte connecté.
      // Le jeton est envoyé dans l'en-tête Authorization au format Bearer.
      const userResponse = await axios.get(
        apiUrl('/api/auth/me'),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // Récupère le compte renvoyé par la route protégée.
      const user = userResponse.data?.user

      // Vérifie que la réponse contient bien le compte attendu.
      if (!user) {
        setApiMessage('Le backend n’a pas renvoyé les informations du compte.')
        return
      }

      // La connexion et la vérification du compte ont réussi : ouvre le tableau de bord.
      // replace évite que le bouton "Précédent" ramène au formulaire de connexion.
      navigate('/dashboard', { replace: true })
    } catch (error) {
      // Récupère le message renvoyé par le backend, s'il y en a un.
      const responseData = error.response?.data

      // Vérifie que le refus vient bien de la demande de connexion.
      const isLoginError =
        error.response?.status === 401 &&
        error.config?.url?.endsWith('/api/auth/login')

      if (isLoginError && responseData?.code === 'EMAIL_NOT_FOUND') {
        // L'adresse n'est associée à aucun compte : affiche l'erreur sous l'e-mail.
        setErrors((currentErrors) => ({
          ...currentErrors,
          email:
            responseData.message ||
            'Cette adresse e-mail ne correspond à aucun compte.',
        }))

        // Évite d'afficher aussi cette erreur sous le formulaire.
        setApiMessage('')
      } else if (isLoginError && responseData?.code === 'INVALID_PASSWORD') {
        // L'e-mail est connu mais le mot de passe est faux : affiche l'erreur dessous.
        setErrors((currentErrors) => ({
          ...currentErrors,
          password: responseData.message || 'Mot de passe incorrect.',
        }))

        // Évite d'afficher aussi cette erreur sous le formulaire.
        setApiMessage('')
      } else {
        // Les autres erreurs restent affichées sous le formulaire.
        setApiMessage(
          responseData?.message ||
            (error.request
              ? 'Impossible de joindre le backend. Vérifie qu’il est démarré.'
              : 'Une erreur est survenue pendant la connexion.')
        )
      }
    } finally {
      // Arrête l'indication de chargement, que la connexion réussisse ou échoue.
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md my-[50px]">
      <LoginHeader />

      {/* Relie la soumission du formulaire à la fonction handleSubmit. */}
      <form
        onSubmit={twoFactorChallengeToken ? handleTwoFactorSubmit : handleSubmit}
        className="mt-6 flex flex-col gap-6"
      >
        {twoFactorChallengeToken ? (
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="twoFactorCode"
                className="text-sm font-medium text-slate-900"
              >
                Code de l’application d’authentification
              </label>
              <input
                id="twoFactorCode"
                name="twoFactorCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={twoFactorCode}
                onChange={(event) => {
                  setTwoFactorCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                  setTwoFactorError('')
                }}
                placeholder="123456"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary"
                aria-describedby={twoFactorError ? 'twoFactorError' : undefined}
                autoFocus
              />
              {twoFactorError && (
                <p id="twoFactorError" className="mt-1 text-xs text-red-500" role="alert">
                  {twoFactorError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Vérification…' : 'Vérifier le code'}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setTwoFactorChallengeToken('')
                setTwoFactorCode('')
                setTwoFactorError('')
                setApiMessage('')
              }}
              className="text-sm text-slate-500 underline underline-offset-2"
            >
              Revenir à la connexion
            </button>
          </div>
        ) : (
          <>
            {/* Affiche les champs habituels avant la vérification du mot de passe. */}
            <LoginFields
              formData={formData}
              onChange={handleChange}
              errors={errors}
            />

            <LoginSubmitButton disabled={isSubmitting} />
          </>
        )}

        {/* Affiche le message de succès ou d'erreur sous le formulaire. */}
       {/* Le challenge 2FA est une information, pas un message d'erreur. */}
{apiMessage && (
  <p
    role={loginSuccess || twoFactorChallengeToken ? 'status' : 'alert'}
    className={`text-center text-sm ${
      loginSuccess
        ? 'text-green-600'
        : twoFactorChallengeToken
          ? 'text-slate-600'
          : 'text-red-600'
    }`}
  >
    {apiMessage}
  </p>
)}

        {/* Informe l'utilisateur que le backend traite sa demande. */}
        {isSubmitting && (
          <p className="text-center text-sm text-slate-500">
            Connexion en cours…
          </p>
        )}
      </form>

      <LoginFooter />
    </div>
  )
}

export default LoginBox
