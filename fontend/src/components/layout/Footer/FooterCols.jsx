import BrandLogo from "../../ui/BrandLogo.jsx";
import { Link } from "react-router-dom";

export default function FooterCols() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-8 w-full">
      
      {/* 1. Bloc de GAUCHE : Logo agrandi + Phrase d'accroche */}
      <div className="flex flex-col items-start gap-4 max-w-sm  cursor-pointer">
        <BrandLogo />
        
        {/* La phrase descriptive */}
        <p className="text-muted text-sm leading-relaxed">
          La plateforme ultime d'organisation académique conçue pour propulser le potentiel des étudiants.
        </p>
      </div>

      {/* 2. Bloc de DROITE : Les deux colonnes de liens côte à côte */}
      <div className="flex gap-16 md:gap-24">
        
        {/* Colonne A : Produit */}
        <div className="flex flex-col gap-4  cursor-pointer">
          <h4 className="text-sm font-bold text-dark tracking-tight">Produit</h4>
          <div className="flex flex-col gap-3 text-sm">
            <a href="#features" className="text-muted hover:text-primary transition-colors cursor-pointer">Fonctionnalités</a>
            <a href="#pricing" className="text-muted hover:text-primary transition-colors cursor-pointer">Tarifs (Gratuit)</a>
            <a href="#testimonials" className="text-muted hover:text-primary transition-colors cursor-pointer">Témoignages</a>
          </div>
        </div>

        {/* Colonne B : Compagnie */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold text-dark tracking-tight">Compagnie</h4>
          <div className="flex flex-col gap-3 text-sm">
            <Link to="/about" className="text-muted hover:text-primary transition-colors cursor-pointer">À propos</Link>
            <a href="#blog" className="text-muted hover:text-primary transition-colors cursor-pointer">Blog</a>
            <a href="#careers" className="text-muted hover:text-primary transition-colors cursor-pointer">Recrutement</a>
          </div>
        </div>

      </div>

    </div>
  );
}
