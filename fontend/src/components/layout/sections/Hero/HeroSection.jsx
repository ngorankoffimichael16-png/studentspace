import HeroLeft from "./HeroLeft.jsx";
import HeroRight from "./HeroRight.jsx";

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-8 sm:gap-10 sm:px-8 sm:py-12 md:grid-cols-2 md:gap-12 md:px-20 md:py-20">

      <HeroLeft />
      <HeroRight />
    </section>
  );
}
