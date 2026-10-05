import { featuresData } from "../../../../data/features";
import FeatureCard from "./FeaturesCard";

export default function FeaturesRow(){
    return(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {/* La boucle magique qui génère les 4 cartes automatiquement */}
      {featuresData.map((item) => (
        <FeatureCard 
          key={item.id}
          icon={item.icon}
          title={item.title}
          description={item.description}
          iconColor={item.iconColor}
          bgColor={item.bgColor}
        />
      ))}
    </div>


    );
}


