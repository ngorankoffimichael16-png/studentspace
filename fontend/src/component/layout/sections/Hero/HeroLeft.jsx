
import avatar1 from "../../../../assets/avatar1.png";
import avatar2 from "../../../../assets/avatar2.png";
import avatar3 from "../../../../assets/avatar3.png";


export default function HeroLeft() {
  return (
    <div className="flex flex-col items-start gap-6 max-w-xl  animate-fade-in-up">
      {/* Le Badge d'actualité */}
      <div className="inline-flex items-center gap-2 bg-[#F5F3FF] text-[#7C3AED] px-3 py-1 rounded-full text-xs font-medium border border-[#E9E3FF]">
        <span className="bg-[#7C3AED] text-white px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
          Nouveau
        </span>
        <span>
          L'assistant IA pour vos révisions est en ligne !
        </span>
      </div> 

      {/* Le Grand Titre */}
      <h1 className="text-5xl font-extrabold text-dark leading-tight tracking-tight">
        Gérez votre parcours étudiant <span className="text-primary">simplement.</span>
      </h1>

      {/* Le Paragraphe */}
      <p className="text-muted text-base md:text-lg leading-relaxed max-w-lg">
        StudentSpace vous permet de suivre vos cours, vos notes, vos tâches et votre 
        progression depuis un seul espace centralisé, intelligent et intuitif.
      </p>
        
      {/* La boîte des Boutons */}
      <div className="flex items-center gap-4 w-full mt-2">
        {/* 1. Le bouton principal bleu */}
        <button className="bg-primary text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md cursor-pointer">
          Commencer maintenant
        </button>

        {/* 2. Le bouton secondaire blanc */}
        <a  href="#features"className="bg-white text-dark border border-border text-sm font-semibold px-6 py-3 rounded-xl shadow-sm cursor-pointer">
          Découvrir la plateforme
        </a>
      </div>
            
      <div className="flex items-center gap-3 mt-4">
        <div className="flex -space-x-2">
          {/* On utilise tes vraies images ici */}
          <img src={avatar1} alt="Étudiant 1" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
          <img src={avatar2} alt="Étudiant 2" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
          <img src={avatar3} alt="Étudiant 3" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
        </div>

        <p className="text-sm text-muted">
          <span className="font-bold text-dark">+10,000 étudiants</span> nous font confiance pour réussir leur année.
        </p>
      </div>


    </div> 
  );
}
