import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, DollarSign, Activity, ChevronLeft, ChevronRight, Clock, Eye } from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import useEmblaCarousel from "embla-carousel-react";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: "forex" | "football" | "market";
  timestamp: string;
  icon: "trend" | "dollar" | "activity";
  price: number;
  images: string[];
  asset?: string;
  match?: string;
}

export const NewsCarousel = () => {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: "start",
    skipSnaps: false,
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 }
    }
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const newsQuery = query(
          collection(db, 'news'),
          orderBy('updatedAt', 'desc'),
          limit(12)
        );
        
        const querySnapshot = await getDocs(newsQuery);
        const newsItems: NewsItem[] = [];
        
        querySnapshot.docs.forEach((doc) => {
          const data = doc.data();
          newsItems.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            images: data.images || [],
            category: data.type,
            timestamp: getRelativeTime(data.updatedAt.toDate()),
            icon: data.type === 'forex' ? "trend" : data.type === 'football' ? "activity" : "dollar",
            price: data.price,
            asset: data.asset,
            match: data.match
          });
        });

        setNewsItems(newsItems);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "trend":
        return <TrendingUp className="w-4 h-4" />;
      case "dollar":
        return <DollarSign className="w-4 h-4" />;
      case "activity":
        return <Activity className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "forex":
        return {
          badge: "text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800",
          icon: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30"
        };
      case "football":
        return {
          badge: "text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800",
          icon: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30"
        };
      case "market":
        return {
          badge: "text-purple-700 bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-800",
          icon: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30"
        };
      default:
        return {
          badge: "text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-900/30 dark:border-gray-800",
          icon: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30"
        };
    }
  };

  const getRelativeTime = (published: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}j`;
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted animate-pulse rounded-md w-96 mx-auto mb-4"></div>
            <div className="h-4 bg-muted animate-pulse rounded-md w-64 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="h-32 bg-muted rounded-md mb-4"></div>
                <div className="h-4 bg-muted rounded-md mb-2"></div>
                <div className="h-4 bg-muted rounded-md w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (newsItems.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Découvrez nos meilleures analyses
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Restez informé avec nos dernières analyses de marché et actualités 
            mises à jour en temps réel par notre équipe d'experts.
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div 
            className="overflow-hidden rounded-2xl" 
            ref={emblaRef}
          >
            <div className="flex touch-pan-y -ml-6">
              {newsItems.map((news) => {
                const styles = getCategoryStyles(news.category);
                return (
                  <div 
                    key={news.id} 
                    className="flex-[0_0_320px] min-w-[320px] pl-6"
                  >
                    <div 
                      className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden h-[420px] cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30"
                      onClick={() => {
                            console.log("Navigation vers:", `/article/${news.id}`);
                            console.log("ID de l'article:", news.id);
                            navigate(`/article/${news.id}`); // Redirection vers la page de détails
                          }}
                                              >
                      {/* Content */}
                      <div className="p-6 flex flex-col h-full">
                        {/* Header with Category Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles.badge}`}>
                            {news.category.toUpperCase()}
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.icon}`}>
                            {getIcon(news.icon)}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-foreground mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                          {news.asset || news.match || news.title}
                        </h3>

                        {/* Image - Centered */}
                        <div className="flex-1 flex items-center justify-center mb-4">
                          {news.images && news.images.length > 0 ? (
                            <div className="relative w-full h-40 overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/50">
                              <img 
                                src={news.images[0]} 
                                alt={news.asset || news.match || news.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                            </div>
                          ) : (
                            <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 rounded-lg">
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${styles.icon}`}>
                                {getIcon(news.icon)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                            <Clock className="w-3 h-3" />
                            <span>{news.timestamp}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-primary font-bold">{news.price} FCFA</span>
                            <div className="flex items-center space-x-1 text-primary text-sm font-medium group-hover:text-primary/80 transition-colors">
                              <Eye className="w-4 h-4" />
                              <span>Voir</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button 
            onClick={scrollPrev}
            className={`absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/95 backdrop-blur-sm hover:bg-background rounded-full shadow-lg z-10 transition-all duration-200 ${
              prevBtnDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-xl'
            }`}
            aria-label="Actualité précédente"
            disabled={prevBtnDisabled}
          >
            <ChevronLeft className="w-6 h-6 text-foreground mx-auto" />
          </button>
          
          <button 
            onClick={scrollNext}
            className={`absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/95 backdrop-blur-sm hover:bg-background rounded-full shadow-lg z-10 transition-all duration-200 ${
              nextBtnDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-xl'
            }`}
            aria-label="Actualité suivante"
            disabled={nextBtnDisabled}
          >
            <ChevronRight className="w-6 h-6 text-foreground mx-auto" />
          </button>

          {/* Dots Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {newsItems.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === selectedIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                onClick={() => scrollTo(index)}
                aria-label={`Aller à l'actualité ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};