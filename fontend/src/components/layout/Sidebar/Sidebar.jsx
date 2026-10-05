import { NavLink, useNavigate } from "react-router-dom"
import { LayoutDashboard, BookOpen, GraduationCap, CheckSquare, User, Settings, LogOut, X } from "lucide-react"
import BrandLogo from "../../ui/BrandLogo.jsx"

const NAV_LINKS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/courses", icon: BookOpen, label: "Mes cours" },
  { to: "/grades", icon: GraduationCap, label: "Mes notes" },
  { to: "/tasks", icon: CheckSquare, label: "Mes tâches" },
  { to: "/profile", icon: User, label: "Profil" },
]

export default function Sidebar({ isOpen, onClose }) {
  // Prépare la redirection après la déconnexion.
  const navigate = useNavigate()

  // Déconnecte l'utilisateur en supprimant son jeton de cet onglet.
  const handleLogout = () => {
    try {
      // Efface le jeton qui permettait d'accéder aux pages protégées.
      sessionStorage.removeItem('token')

      // Renvoie l'utilisateur au formulaire de connexion.
      navigate('/login', { replace: true })
    } catch {
      // Affiche une erreur si le navigateur empêche la suppression du jeton.
      window.alert('Impossible de supprimer la session dans ce navigateur.')
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <div
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-navy text-white p-6 flex flex-col justify-between select-none shadow-xl z-50 transition-transform duration-300 flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <BrandLogo onClick={onClose} />
            <button onClick={onClose} className="lg:hidden text-white" aria-label="Fermer le menu">
              <X size={22} />
            </button>
          </div>

          <nav className="flex flex-col gap-2 text-sm font-medium">
            {NAV_LINKS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all select-none ${
                    isActive
                      ? "bg-primary text-white font-semibold"
                      : "text-blue-100 hover:bg-white/10 font-medium"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 text-sm font-medium border-t border-white/10 pt-4">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? "bg-primary text-white font-semibold" : "text-blue-100 hover:bg-white/10"
              }`
            }
          >
            <Settings size={18} />
            Paramètres
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-300 hover:bg-red-500/20 px-4 py-3 rounded-xl transition-all text-left"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </div>
    </>
  )
}