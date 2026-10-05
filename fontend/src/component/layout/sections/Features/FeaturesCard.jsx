export default function FeatureCard({ icon: Icon, title, description, iconColor, bgColor }) {
  return (
    <div className="flex flex-col items-start gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-md cursor pointer">

      
      
      <div className={`p-2.5 rounded-xl ${bgColor} ${iconColor}`}>
        <Icon size={24} strokeWidth={2} />
      </div>

      
      <h3 className="text-lg font-bold text-dark tracking-tight">
        {title}
      </h3>

      
      <p className="text-muted text-sm leading-relaxed">
        {description}
      </p>

    </div>
  );
}
