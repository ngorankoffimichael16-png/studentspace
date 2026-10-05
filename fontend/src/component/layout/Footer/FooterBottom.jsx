export default function FooterBottom() {
  return (
    <div className="w-full border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-muted">
      
      {/* 1. Les Droits d'auteur à gauche */}
      <div>
        © 2026 StudentSpace. Tous droits réservés.
      </div>

      {/* 2. Les liens juridiques à droite */}
      <div className="flex items-center gap-6">
        <a href="#terms" className="hover:text-primary transition-colors cursor-pointer">
          Conditions d'utilisation
        </a>
        <a href="#privacy" className="hover:text-primary transition-colors cursor-pointer">
          Politique de confidentialité
        </a>
      </div>

    </div>
  );
}
