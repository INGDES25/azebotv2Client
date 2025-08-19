import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

const mockReviews: Review[] = [
  {
    id: 1,
    name: "Jean-Pierre M.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
    rating: 5,
    comment: "Excellent service ! Les analyses sont très précises et m'ont aidé à améliorer mes trades.",
    date: "2024-01-15"
  },
  {
    id: 2,
    name: "Marie K.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b39a3c1c?w=64&h=64&fit=crop&crop=face",
    rating: 5,
    comment: "AZEBot m'a fait gagner beaucoup de temps avec ses pronostics fiables. Je recommande !",
    date: "2024-01-12"
  },
  {
    id: 3,
    name: "David L.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    rating: 4,
    comment: "Très bon outil pour débuter en trading. L'interface est intuitive et les conseils pertinents.",
    date: "2024-01-10"
  },
  {
    id: 4,
    name: "Sophie R.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    rating: 5,
    comment: "Les analyses techniques sont de très haute qualité. Parfait pour optimiser mes stratégies.",
    date: "2024-01-08"
  },
  {
    id: 5,
    name: "Alexandre T.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
    rating: 5,
    comment: "Interface moderne et analyses quotidiennes très utiles. Service client réactif.",
    date: "2024-01-05"
  },
  {
    id: 6,
    name: "Catherine B.",
    avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=64&h=64&fit=crop&crop=face",
    rating: 4,
    comment: "Bon rapport qualité-prix. Les pronostics sportifs sont souvent dans le mille !",
    date: "2024-01-03"
  }
];

export const ReviewCarousel = () => {
  const [currentReviews, setCurrentReviews] = useState<Review[]>([]);

  // Select 5 random reviews on component mount
  useEffect(() => {
    const shuffled = [...mockReviews].sort(() => 0.5 - Math.random());
    setCurrentReviews(shuffled.slice(0, 5));
  }, []);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? "text-warning fill-warning" 
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-glow mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les témoignages de notre communauté qui fait confiance à AZEBot 
            pour leurs analyses de trading et pronostics sportifs.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex animate-slideInRight space-x-6">
            {currentReviews.map((review, index) => (
              <div
                key={review.id}
                className="flex-shrink-0 w-80 bg-card border border-border rounded-xl p-6 hover-lift card-glow"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full border-2 border-primary/20"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{review.name}</h4>
                    <div className="flex space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  "{review.comment}"
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Vous aussi, partagez votre expérience avec AZEBot
          </p>
          <button className="text-primary hover:text-primary-glow transition-colors font-medium">
            Laisser un avis →
          </button>
        </div>
      </div>
    </section>
  );
};