import { Mail, Lock } from 'lucide-react'

function LoginFields({ formData, onChange, errors }) {
  return (
    <div className="flex flex-col gap-4 w-full">

      <div>
        <label className="text-sm font-medium text-slate-900">Adresse e-mail</label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="votre.nom@etudiant.fr"
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none ${
              errors.email ? 'border-red-400' : 'border-slate-200'
            }`}
          />
        </div>
              {/* Affiche sous l'e-mail soit l'erreur du backend, soit l'erreur de champ vide. */}
        {errors.email && (
          <p className="text-xs text-red-500 mt-1" role="alert">
            {typeof errors.email === 'string'
              ? errors.email
              : 'Ce champ est obligatoire'}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-900">Mot de passe</label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder="MotDePasseFort123!"
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none ${
              errors.password ? 'border-red-400' : 'border-slate-200'
            }`}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 mt-1" role="alert">
            {typeof errors.password === 'string'
              ? errors.password
              : 'Ce champ est obligatoire'}
          </p>
        )}
      </div>

    </div>
  )
}
export default LoginFields