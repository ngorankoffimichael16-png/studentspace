import { Link } from "react-router-dom"
import Header from "../components/layout/Header/Header.jsx"
import Footer from "../components/layout/Footer/Footer.jsx"
import { featuresData } from "../data/features.jsx"

export default function About() {
  return (
    <div className="flex min-h-screen flex-col bg-light-bg text-dark">
      <Header />

      <main className="flex-1">
        <section
          aria-labelledby="founder-title"
          className="bg-navy text-white"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-2 md:items-end md:gap-8 lg:gap-12 lg:px-20">
            <div className="hero-copy-enter">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
                L’origine du projet
              </p>
              <h1
                id="founder-title"
                className="mt-5 max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              >
                Ngoran Koffi Michael
              </h1>
              <p className="mt-4 text-base font-semibold text-indigo-200 sm:text-lg">
                À l’origine de l’idée de StudentSpace
              </p>
            </div>
            <p className="hero-art-enter border-t border-white/20 pt-6 text-base leading-8 text-slate-300 sm:text-lg md:border-l md:border-t-0 md:pb-1 md:pl-9 md:pt-0">
              Il a imaginé cette plateforme pour aider les étudiants à mieux
              organiser leur quotidien : suivre leurs cours, planifier leurs
              tâches et leurs échéances, et garder un œil sur leur progression
              depuis un même espace.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="features-title"
          className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-2 md:gap-8 lg:gap-12 lg:px-20"
        >
          <div className="hero-copy-enter">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
              Dans la plateforme
            </p>
            <h2
              id="features-title"
              className="mt-3 max-w-sm text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
            >
              Les outils du quotidien étudiant
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted sm:text-base">
              StudentSpace rassemble les fonctions essentielles pour organiser
              le travail et suivre son parcours.
            </p>
          </div>

          <ol className="hero-copy-enter divide-y divide-border border-y border-border md:mt-1">
            {featuresData.map(
              (
                { id, icon: Icon, title, description, iconColor, bgColor },
                index,
              ) => (
                <li
                  key={id}
                  className="flex items-center gap-4 py-5 sm:gap-6 sm:py-6"
                >
                  <span
                    aria-hidden="true"
                    className="w-7 shrink-0 text-xs font-bold tracking-wide text-muted/70 sm:w-10 sm:text-sm"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${bgColor} ${iconColor}`}
                  >
                    <Icon size={21} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold tracking-tight sm:text-base">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
                      {description}
                    </p>
                  </div>
                </li>
              ),
            )}
          </ol>
        </section>

        <section
          aria-labelledby="mission-title"
          className="border-t border-border bg-white"
        >
          <div className="hero-copy-enter mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2 md:items-center md:gap-8 lg:gap-12 lg:px-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                Notre intention
              </p>
              <h2
                id="mission-title"
                className="mt-3 max-w-sm text-2xl font-extrabold leading-tight sm:text-3xl"
              >
                Rendre l’organisation des études plus claire.
              </h2>
            </div>
            <div>
              <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                StudentSpace veut aider chaque étudiant à mieux suivre son
                quotidien d’études grâce à des outils accessibles et faciles à
                utiliser.
              </p>
              <Link
                to="/signup"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                Créer mon compte
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
