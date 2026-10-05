import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import AuthButtons from "./AuthButtons";
import { Link } from "react-router-dom";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-border sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 md:py-4">
        
        {/* Logo gauche toujours visible */}
        <Logo />

        {/* Blocs PC cachés automatiquement sur mobile */}
        <NavLinks />
        <AuthButtons />

        {/* Bouton Burger à droite */}
        <button
          onClick={() => setIsOpen(!isOpen)} 
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isOpen}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-dark transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 md:hidden"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* LE RIDEAU MOBILE CORRIGÉ ET COMPLET */}
      {isOpen && (
        <div className="flex flex-col gap-5 border-t border-border bg-white px-5 py-5 shadow-lg sm:px-8 md:hidden">
          
          {/* 1. Les liens mobiles verticaux */}
          <nav className="flex flex-col gap-4 text-sm font-medium">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-primary">Accueil</Link>
            <Link to="/#features" onClick={() => setIsOpen(false)} className="text-muted">Fonctionnalités</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="text-muted">À propos</Link>
          </nav>

          <div className="border-t border-border pt-4 flex flex-col gap-4 w-full">
  <Link
    to="/login"
    onClick={() => setIsOpen(false)}
    className="block w-full py-3 text-center text-sm font-semibold text-dark"
  >
    Se connecter
  </Link>

  <Link
    to="/signup"
    onClick={() => setIsOpen(false)}
    className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white shadow-md"
  >
    Créer un compte
  </Link>
</div>

        </div>
      )}
    </header>
  );
}
