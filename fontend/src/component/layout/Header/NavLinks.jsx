export default function NavLinks() {
  return (
    /* On utilise hidden pour le masquer sur mobile, et md:flex pour le réafficher sur ordinateur */
    <nav className="hidden md:flex items-center gap-8 h-5 text-sm font-medium">
      <a href="#" className="text-primary cursor-pointer">Accueil</a>
      
      <a href="#features" className="text-muted hover:text-primary transition-colors cursor-pointer text-sm font-medium">
        Fonctionnalités
      </a>

      <a href="#about" className="text-muted hover:text-primary transition-colors duration-200 cursor-pointer">
        À propos
      </a>
    </nav>  
  );
}
