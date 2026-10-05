import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import AuthButtons from "./AuthButtons";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        
        {/* Logo gauche toujours visible */}
        <Logo />

        {/* Blocs PC cachés automatiquement sur mobile */}
        <NavLinks />
        <AuthButtons />

        {/* Bouton Burger à droite */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="block md:hidden text-dark cursor-pointer p-2 focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* LE RIDEAU MOBILE CORRIGÉ ET COMPLET */}
      {isOpen && (
        <div className="block md:hidden bg-white border-t border-border px-8 py-6 flex flex-col gap-6 shadow-lg">
          
          {/* 1. Les liens mobiles verticaux */}
          <nav className="flex flex-col gap-4 text-sm font-medium">
            <a href="#" onClick={() => setIsOpen(false)} className="text-primary">Accueil</a>
            <a href="#features" onClick={() => setIsOpen(false)} className="text-muted">Fonctionnalités</a>
            <a href="#about" onClick={() => setIsOpen(false)} className="text-muted">À propos de</a>
          </nav>

          {/* 2. LA NOUVELLE ZONE DES BOUTONS DE CONNEXION POUR MOBILE */}
          <div className="border-t border-border pt-4 flex flex-col gap-4 w-full">
            <button className="text-dark font-semibold text-center text-sm py-2 cursor-pointer">
              Se connecter
            </button>
            <button className="bg-primary text-white font-semibold text-sm w-full py-3 rounded-xl shadow-md cursor-pointer text-center">
              Créer un compte
            </button>
          </div>

        </div>
      )}
    </header>
  );
}
