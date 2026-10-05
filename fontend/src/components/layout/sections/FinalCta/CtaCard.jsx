import { Link } from "react-router-dom"

export default function CtaCard() {
  return (
    /* 1. Largeur réduite avec max-w-5xl et centrée avec mx-auto */
    <div className="w-full max-w-5xl mx-auto bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-10 md:py-13 rounded-[32px] flex flex-col items-center text-center gap-6 shadow-xl">
      
      {/* 2. Le grand titre blanc centré */}
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-2xl leading-tight">
        Prêt à mieux organiser votre parcours ?
      </h2>

      {/* 3. Le paragraphe de description */}
      <p className="text-blue-100 text-sm md:text-base max-w-xl leading-relaxed">
        Créez votre compte gratuitement en moins de 2 minutes et commencez à structurer votre réussite académique dès aujourd'hui.
      </p>

      <Link
        to="/signup"
        className="mt-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-md transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        Créer mon compte
      </Link>

    </div>
  );
}
