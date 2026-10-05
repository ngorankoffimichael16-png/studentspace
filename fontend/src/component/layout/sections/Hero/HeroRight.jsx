import heroImg from "../../../../assets/hero.png";

export default function HeroRight() {
  return (
    <div className="w-full flex justify-center items-center  animate-fade-in-up">
      <img 
        src={heroImg} 
        alt="Illustration Bureau StudentSpace" 
        className="w-full max-w-2xl h-auto object-contain" 
      />
    </div>
  );
}
