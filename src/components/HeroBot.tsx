import azebotHero from "@/assets/azebot-hero.jpg";

interface HeroBotProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  customText?: string;
}

export const HeroBot = ({ size = "lg", showText = true, customText }: HeroBotProps) => {
  const sizeClasses = {
    sm: "w-32 h-18",
    md: "w-48 h-27",
    lg: "w-64 h-36"
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={`${sizeClasses[size]} relative overflow-hidden rounded-2xl bot-glow`}>
        <img
          src={azebotHero}
          alt="AZEBot - Intelligence Artificielle de Trading"
          className="w-full h-full object-cover bot-float"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
      </div>
      
      {showText && (
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-glow">
            {customText || "AZEBot Intelligence"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Votre assistant IA pour des analyses précises et des pronostics fiables
          </p>
        </div>
      )}
    </div>
  );
};