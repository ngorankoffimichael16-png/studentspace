import heroImg from "../../../../assets/hero.png";

export default function HeroRight() {
  return (
    <div className="hero-art-enter flex w-full items-center justify-center">
      <img 
        src={heroImg} 
        alt="Illustration Bureau StudentSpace" 
        className="h-auto w-full max-w-2xl rounded-2xl object-contain sm:rounded-3xl md:rounded-none"
      />
    </div>
  );
}
