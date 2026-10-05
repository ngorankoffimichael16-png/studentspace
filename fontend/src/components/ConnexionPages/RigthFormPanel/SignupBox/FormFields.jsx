import { useState } from 'react'
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'

function FormFields({ formData, onChange, errors }) {
  // Ces 2 états gèrent l'affichage/masquage de CHAQUE champ mot de passe INDÉPENDAMMENT
  // (l'utilisateur peut révéler le mot de passe sans révéler automatiquement la confirmation)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ===== CHAMP : Nom complet ===== */}
      <div>
        <label className="text-sm font-medium text-slate-900">Nom complet</label>
        <div className="relative mt-1">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={onChange}
            placeholder="Ex: Sarah Martin"
            // Bordure rouge si erreur, grise sinon
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none ${
              errors.fullName ? 'border-red-400' : 'border-slate-200'
            }`}
          />
        </div>
        {errors.fullName && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
      </div>

      {/* ===== CHAMP : Téléphone ===== */}
      <div>
        <label className="text-sm font-medium text-slate-900">Numéro de téléphone</label>
        <div className="relative mt-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="tel" // "tel" affiche un clavier numérique adapté sur mobile
            name="phone"
            value={formData.phone}
            onChange={onChange}
            placeholder="Ex: 07 00 00 00 00"
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none ${
              errors.phone ? 'border-red-400' : 'border-slate-200'
            }`}
          />
        </div>
        {errors.phone === true && (
  <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>
)}
{typeof errors.phone === 'string' && (
  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
)}
      </div>

      {/* ===== CHAMP : Email ===== */}
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
       {errors.email === true && (
  <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>
)}
{typeof errors.email === 'string' && (
  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
)}
      </div>

      {/* ===== CHAMP : Mot de passe (avec icône œil) ===== */}
      <div>
        <label className="text-sm font-medium text-slate-900">Mot de passe</label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            // Si showPassword est true, le texte est visible ("text"), sinon caché ("password")
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder="MotDePasseFort123!"
            // pr-10 (padding-right) plus grand ici pour laisser la place à l'icône œil à droite
            className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none ${
              errors.password ? 'border-red-400' : 'border-slate-200'
            }`}
          />
          <button
            type="button" // empêche ce bouton de soumettre le formulaire par erreur
            onClick={() => setShowPassword(!showPassword)} // inverse showPassword à chaque clic
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {/* Icône différente selon l'état actuel */}
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>}
      </div>

      {/* ===== CHAMP : Confirmation du mot de passe (avec icône œil indépendante) ===== */}
      <div>
        <label className="text-sm font-medium text-slate-900">Confirmation du mot de passe</label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onChange}
            placeholder="MotDePasseFort123!"
            className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none ${
              errors.confirmPassword ? 'border-red-400' : 'border-slate-200'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {/* Ici, errors.confirmPassword n'est plus juste "true", mais une CHAÎNE DE TEXTE précise :
            soit 'required' (champ vide), soit 'mismatch' (les mots de passe ne correspondent pas).
            Ça permet d'afficher un message différent selon le CAS exact de l'erreur */}
        {errors.confirmPassword === 'required' && (
          <p className="text-xs text-red-500 mt-1">Ce champ est obligatoire</p>
        )}
        {errors.confirmPassword === 'mismatch' && (
          <p className="text-xs text-red-500 mt-1">Veuillez entrer le même mot de passe</p>
        )}
      </div>

      {/* ===== Checkbox : conditions d'utilisation ===== */}
      <div className="flex items-start gap-2 mt-2">
        <input
          type="checkbox"
          name="acceptTerms"
          checked={formData.acceptTerms} // "checked", pas "value", car c'est une checkbox
          onChange={onChange}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <p className="text-sm text-slate-500">
          J'accepte les{' '}
          <a href="#" className="text-accent hover:underline">conditions d'utilisation</a>
          {' '}et la{' '}
          <a href="#" className="text-accent hover:underline">politique de confidentialité</a>.
        </p>
      </div>
      {errors.acceptTerms && (
        <p className="text-xs text-red-500 -mt-2">Vous devez accepter les conditions</p>
      )}

    </div>
  )
}

export default FormFields