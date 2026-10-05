import FooterCols from "./FooterCols.jsx";
import FooterBottom from "./FooterBottom.jsx";

export default function Footer() {
  return (
   
    <footer className="w-full bg-white border-t border-border mt-auto">
      
      
      <div className="max-w-7xl mx-auto px-4 md:px-20 py-8 md:py-12 flex flex-col gap-12">
        
        <FooterCols />
    
        <FooterBottom />

      </div>

    </footer>
  );
}
