import { useEffect, useRef, useState } from "react"

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColor,
  bgColor,
  delay,
}) {
  const cardRef = useRef(null)
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return true

    return (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
  })

  useEffect(() => {
    if (isVisible) return

    const card = cardRef.current
    if (!card) return

    const revealWhenInView = () => {
      const bounds = card.getBoundingClientRect()
      if (bounds.top < window.innerHeight - 24 && bounds.bottom > 0) {
        window.removeEventListener("scroll", scheduleVisibilityCheck)
        window.removeEventListener("resize", scheduleVisibilityCheck)
        setIsVisible(true)
      }
    }

    const scheduleVisibilityCheck = () => {
      revealWhenInView()
    }

    window.addEventListener("scroll", scheduleVisibilityCheck, { passive: true })
    window.addEventListener("resize", scheduleVisibilityCheck)
    const initialCheck = window.setTimeout(revealWhenInView, 0)

    return () => {
      window.clearTimeout(initialCheck)
      window.removeEventListener("scroll", scheduleVisibilityCheck)
      window.removeEventListener("resize", scheduleVisibilityCheck)
    }
  }, [isVisible])

  return (
    <div
      ref={cardRef}
      data-visible={isVisible}
      style={{ "--reveal-delay": `${delay}ms` }}
      className="feature-card-reveal flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm hover:-translate-y-2 hover:shadow-md"
    >
      <div className={`rounded-xl p-2.5 ${bgColor} ${iconColor}`}>
        <Icon size={24} strokeWidth={2} />
      </div>

      <h3 className="text-lg font-bold tracking-tight text-dark">
        {title}
      </h3>

      <p className="text-sm leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}
