// useEffect lance la vérification après l'affichage du composant.
// useState mémorise le résultat de la vérification.
import { useEffect, useState } from 'react'

// Navigate redirige l'utilisateur sans recharger l'application.
import { Navigate } from 'react-router-dom'

// Axios envoie la demande de vérification au backend.
import axios from 'axios'
import { apiUrl } from '@/lib/api'

export default function ProtectedRoute({ children }) {
  // Trois états possibles : vérification, connecté ou non connecté.
  const [status, setStatus] = useState('checking')

  // Permet de relancer la vérification si le serveur n'est pas joignable.
  const [retry, setRetry] = useState(0)

  // Vérifie auprès du backend que le jeton existe et est encore valable.
  useEffect(() => {
    // Empêche de mettre à jour l'état si le composant est démonté entre-temps.
    let isMounted = true

    const verifySession = async () => {
      let token

      try {
        // Récupère le jeton enregistré au moment de la connexion.
        token = sessionStorage.getItem('token')
      } catch {
        // Indique clairement si le navigateur bloque l'accès au stockage.
        if (isMounted) setStatus('storage-error')
        return
      }

      // Sans jeton, la personne n'est pas connectée.
      if (!token) {
        if (isMounted) setStatus('unauthenticated')
        return
      }

      try {
        // Demande au backend de vérifier le jeton et de retrouver le compte.
        await axios.get(apiUrl('/api/auth/me'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Le backend a accepté le jeton : la page protégée peut s'afficher.
        if (isMounted) setStatus('authenticated')
      } catch (error) {
        // Un jeton refusé ou expiré signifie que l'utilisateur doit se reconnecter.
        if (error.response?.status === 401 || error.response?.status === 403) {
          try {
            // Retire le jeton qui n'est plus accepté.
            sessionStorage.removeItem('token')
          } catch {
            // La page de connexion reste accessible même si le stockage est bloqué.
          }

          if (isMounted) setStatus('unauthenticated')
          return
        }

        // Une panne réseau n'est pas forcément une déconnexion :
        // on affiche une erreur et on permet de réessayer.
        if (isMounted) setStatus('server-error')
      }
    }

    verifySession()

    // Nettoie le drapeau si React retire ce composant de la page.
    return () => {
      isMounted = false
    }
  }, [retry])

  // Pendant la vérification, évite d'afficher brièvement une page privée.
  if (status === 'checking') {
    return <p className="p-6 text-center">Vérification de la connexion…</p>
  }

  // Si le jeton est absent ou refusé, renvoie vers la connexion.
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  // Explique le problème réseau et propose une nouvelle vérification.
  if (status === 'server-error') {
    return (
      <div className="p-6 text-center" role="alert">
        <p>Impossible de vérifier la connexion auprès du backend.</p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-white"
          onClick={() => {
            setStatus('checking')
            setRetry((currentRetry) => currentRetry + 1)
          }}
        >
          Réessayer
        </button>
      </div>
    )
  }

  // Signale un problème de stockage au lieu de prétendre que l'utilisateur est déconnecté.
  if (status === 'storage-error') {
    return (
      <p className="p-6 text-center" role="alert">
        Le navigateur ne permet pas d’accéder à la session. Vérifie ses paramètres
        de stockage, puis recharge la page.
      </p>
    )
  }

  // Le backend a validé le jeton : affiche la page demandée.
  return children
}