import { ShieldCheck } from 'lucide-react'
import illustration from '../../../assets/logoConnexion.png'
import BrandLogo from '../../ui/BrandLogo.jsx'

function LeftBrandPanel() {
  return (
    <div className="flex flex-col bg-gradient-to-br from-navy to-accent p-8 lg:p-16 w-full lg:w-1/2 lg:h-screen overflow-hidden">
      <BrandLogo />
      <div className="rounded-2xl overflow-hidden max-h-[35vh] mt-8">
        <img src={illustration} alt="Étudiant au bureau" className="w-full h-full object-cover" />
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2 text-white">
          Commencez à planifier votre réussite dès aujourd'hui.
        </h2>
        <p className="text-white/80 text-sm">
          Rejoignez des milliers d'étudiants qui optimisent leur temps et boostent leurs résultats au quotidien.
        </p>
      </div>
      <div className="mt-8 lg:mt-auto flex items-center gap-2 text-white/70 text-xs">
        <ShieldCheck size={16} />
        Espace sécurisé et conforme RGPD
      </div>
    </div>
  )
}
export default LeftBrandPanel