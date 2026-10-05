import { Link } from 'react-router-dom'

function LoginFooter() {
  return (
    <p className="text-center text-slate-500 text-sm mt-6">
      Pas encore de compte ?{' '}
      <Link to="/signup" className="text-accent font-medium hover:underline">
        Créer un compte
      </Link>
    </p>
  )
}
export default LoginFooter