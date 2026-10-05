import { Link } from 'react-router-dom'

export default function AuthButtons() {
  return (
    <div className="hidden md:flex items-center gap-6 text-sm font-medium">
      <Link
        to="/login"
        className="text-dark hover:text-primary transition-colors cursor-pointer"
      >
        Se connecter
      </Link>

      <Link
        to="/signup"
        className="bg-primary text-white px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
      >
        Créer un compte
      </Link>
    </div>
  )
}