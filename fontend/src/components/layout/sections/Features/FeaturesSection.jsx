import FeaturesHeader from "./FeaturesHeader";
import FeaturesRow from "./FeaturesRow";


export default function FeaturesSection(){
    return(
       <section id="features" className="max-w-7xl mx-auto px-4 md:px-20 py-12 md:py-20 flex flex-col gap-12">
      <FeaturesHeader />
      <FeaturesRow/>
    </section>
    );
}