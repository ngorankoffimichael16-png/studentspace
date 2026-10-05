import logoImage from "../../../assets/logo.png";

export default function Logo() {
  return (
    <div className="flex items-center">
      {/* On affiche uniquement ton image complète, sans l'icône en double */}
      <img 
        src={logoImage} 
        alt="StudentSpace Logo" 
        className="h-16 w-auto object-contain" 
      />
    </div>
  );
}
