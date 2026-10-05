
import avatar1 from "../../../../assets/avatar1.png";
import avatar2 from "../../../../assets/avatar2.png";
import avatar3 from "../../../../assets/avatar3.png";
import { Link } from "react-router-dom";

export default function HeroLeft() {
  return (
    <div className="hero-copy-enter flex w-full max-w-xl flex-col items-start gap-5 sm:gap-6">
      {/* Le Badge d'actualité */}
      <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[#E9E3FF] bg-[#F5F3FF] px-3 py-2 text-[11px] font-medium leading-snug text-[#7C3AED] sm:text-xs">
        <span className="shrink-0 rounded-md bg-[#7C3AED] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Nouveau
        </span>
        <span className="min-w-0">
          L'assistant IA pour vos révisions est en ligne !
        </span>
      </div> 

      {/* Le Grand Titre */}
      <h1 className="text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-dark sm:text-5xl sm:leading-tight">
        Gérez votre parcours étudiant <span className="text-primary">simplement.</span>
      </h1>

      {/* Le Paragraphe */}
      <p className="max-w-lg text-[15px] leading-7 text-muted sm:text-base sm:leading-relaxed md:text-lg">
        StudentSpace vous aide à suivre vos cours, vos notes et vos tâches depuis un espace unique, clair et facile à utiliser.
      </p>
        
      {/* La boîte des Boutons */}
      <div className="mt-1 flex w-full flex-col items-center gap-3 min-[480px]:flex-row min-[480px]:items-center sm:mt-2 sm:gap-4">
        <Link
          to="/signup"
          className="inline-flex min-h-12 w-full max-w-60 flex-1 items-center justify-center rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 min-[480px]:max-w-none"
        >
          Commencer maintenant
        </Link>

        <a
          href="#features"
          className="inline-flex min-h-12 w-full max-w-90 flex-1 items-center justify-center rounded-xl border border-border bg-white px-5 py-3 text-center text-sm font-semibold text-dark shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 min-[480px]:max-w-none"
        >
          Découvrir la plateforme
        </a>
      </div>
            
      <div className="mt-2 flex items-center gap-3 sm:mt-4">
        <div className="flex -space-x-2">
          {/* On utilise tes vraies images ici */}
          <img src={avatar1} alt="Étudiant 1" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
          <img src={avatar2} alt="Étudiant 2" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
          <img src={avatar3} alt="Étudiant 3" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
        </div>

        <p className="text-xs leading-relaxed text-muted sm:text-sm">
          <span className="font-bold text-dark">+10 000 étudiants</span> nous font confiance pour réussir leur année.
        </p>
      </div>


    </div> 
  );
}
