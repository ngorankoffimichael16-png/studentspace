import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { apiUrl } from "@/lib/api"
import Sidebar from "../components/layout/Sidebar/Sidebar.jsx";
import { Search, Bell, Menu } from "lucide-react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Contient le vrai compte connecté, null tant qu'il n'est pas chargé.
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get(apiUrl("/api/auth/me"), {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        })
        setUser(response.data.user)
      } catch {
        setUser(null)
      }
    }
    loadUser()
  }, [])

  const fullName = user?.fullName || ""

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("")
  const photoUrl = user?.avatarPath ? apiUrl(user.avatarPath) : null

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-dark antialiased w-full">
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          
          {/* BARRE DU HAUT : Bonjour + Recherche + Profil */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600">
                <Menu size={22} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
  Bonjour{fullName ? ` ${fullName}` : ""} 👋
</h1>
                <p className="text-xs text-slate-500">Voici un aperçu de votre progression.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-6">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="bg-slate-50 text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-100 focus:outline-none w-60" 
                />
              </div>

              <div className="relative flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                <Bell className="text-slate-500 w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

              <div className="flex items-center gap-3">
                {/* Photo réelle, ou initiales si aucune photo. Un clic mène au profil. */}
                <Link to="/profile" className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600">
                  {photoUrl ? (
                    <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </Link>
                <div className="hidden md:flex flex-col select-none">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{fullName}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 CARTES STATISTIQUES — version compacte horizontale */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            
            {/* Carte 1 : Cours suivis */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-3">
              <div className="w-11 h-11 bg-purple-50 flex items-center justify-center rounded-xl flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 truncate">Cours suivis</p>
                <p className="text-xl font-extrabold text-slate-900 tracking-tight">8</p>
              </div>
            </div>

            {/* Carte 2 : Moyenne générale */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-3">
              <div className="w-11 h-11 bg-emerald-50 flex items-center justify-center rounded-xl flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 truncate">Moyenne générale</p>
                <p className="text-xl font-extrabold text-slate-900 tracking-tight">14,5/20</p>
              </div>
            </div>

            {/* Carte 3 : Tâches restantes */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-3">
              <div className="w-11 h-11 bg-amber-50 flex items-center justify-center rounded-xl flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 truncate">Tâches restantes</p>
                <p className="text-xl font-extrabold text-slate-900 tracking-tight">5</p>
              </div>
            </div>

            {/* Carte 4 : Progression */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-50 flex items-center justify-center rounded-xl flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 truncate">Progression</p>
                <p className="text-xl font-extrabold text-slate-900 tracking-tight">78%</p>
              </div>
            </div>

          </div>

          {/* Zone du bas temporaire */}
          <div className="border border-dashed border-slate-200 p-8 rounded-2xl text-center text-xs text-slate-400">
            Zone pour le graphique et la liste de cours...
          </div>

        </div>
      </main>

    </div>
  );
}