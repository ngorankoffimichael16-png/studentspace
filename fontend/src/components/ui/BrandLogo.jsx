import { Link } from "react-router-dom"
import logo from "../../assets/Logo.png"

export default function BrandLogo({ className = "", onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="Retour à l’accueil"
      className={`inline-flex h-10 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${className}`}
    >
      <img
        src={logo}
        alt=""
        className="h-full w-full object-cover"
      />
    </Link>
  )
}
