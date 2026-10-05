function LoginSubmitButton({ disabled = false }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {disabled ? 'Connexion…' : 'Se connecter'}
    </button>
  )
}
export default LoginSubmitButton