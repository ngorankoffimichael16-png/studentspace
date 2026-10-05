import { Link } from 'react-router-dom'

function AuthFooter() {
  return (
    <p className="text-center text-slate-500 text-sm mt-6">
      Vous avez déjà un compte ?{' '}
      <Link to="/login" className="text-accent font-medium hover:underline">
        Se connecter
      </Link>
    </p>
  )
}
export default AuthFooter