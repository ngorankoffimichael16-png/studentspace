import HeroLeft from "./HeroLeft.jsx";
import HeroRight from "./HeroRight.jsx";

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-20 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

      <HeroLeft />
      <HeroRight />
    </section>
  );
}
