"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

type Work = {
  id: string;
  images: string[]; // Array of image paths
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  order: number;
  createdAt: string;
};

type Vehicle = {
  brand: string;
  value: string;
  title: string;
  image: string;
  years: Array<{ value: string; label: string }>;
};

type ServiceOption = {
  title: string;
  image: string;
  price: string;
  requirements: string;
  description?: string; // Legacy field for backward compatibility
  descriptionEn?: string;
  descriptionRu?: string;
  status?: "in-stock" | "unavailable" | "coming-soon";
};

function VehicleSelector() {
  const router = useRouter();
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [brandsLoaded, setBrandsLoaded] = useState(false);

  useEffect(() => {
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-select first brand after vehicles are loaded
    if (vehicles.length > 0 && !selectedBrand && !brandsLoaded) {
      const allBrands = Array.from(new Set(vehicles.map(v => v.brand))).sort((a, b) => {
        if (a === "land-rover") return -1;
        if (b === "land-rover") return 1;
        if (a === "jaguar") return -1;
        if (b === "jaguar") return 1;
        return a.localeCompare(b);
      });
      if (allBrands.length > 0) {
        setSelectedBrand(allBrands[0]);
        setBrandsLoaded(true);
      }
    }
  }, [vehicles, selectedBrand, brandsLoaded]);

  const loadVehicles = async () => {
    try {
      const res = await fetch("/api/admin/vehicles");
      const data = await res.json();
      const vehiclesArray = Array.isArray(data) ? data : [];
      setVehicles(vehiclesArray);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    }
  };

  const availableModels = vehicles.filter(v => v.brand === selectedBrand);
  const selectedVehicle = availableModels.find(v => v.value === selectedModel);
  const availableYears = selectedVehicle?.years || [];

  // Get all unique brands
  const allBrands = Array.from(new Set(vehicles.map(v => v.brand))).sort((a, b) => {
    // Sort: land-rover first, jaguar second, then alphabetically
    if (a === "land-rover") return -1;
    if (b === "land-rover") return 1;
    if (a === "jaguar") return -1;
    if (b === "jaguar") return 1;
    return a.localeCompare(b);
  });

  // Clear selectedModel if it doesn't belong to the selected brand
  useEffect(() => {
    if (selectedBrand && selectedModel) {
      const modelExists = availableModels.some(v => v.value === selectedModel);
      if (!modelExists) {
        setSelectedModel("");
        setSelectedYear("");
      }
    }
  }, [selectedBrand, selectedModel, availableModels]);

  const handleGoToServices = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBrand && selectedModel && selectedYear) {
      // Normalize brand and model for URL (lowercase, trim, replace spaces with hyphens)
      const normalizedBrand = selectedBrand.trim().toLowerCase().replace(/\s+/g, '-');
      const normalizedModel = selectedModel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      router.push(`/services/${normalizedBrand}/${normalizedModel}/${selectedYear}`);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-2xl sm:text-3xl font-semibold text-left text-zinc-900 dark:text-white">{t('selectVehicleModel')}</div>
      
      {/* All elements with same width - Centered */}
      <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto flex flex-col space-y-6">
        {/* Selectors Section */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <select
            value={selectedBrand}
            onChange={(e) => {
              const newBrand = e.target.value;
              setSelectedBrand(newBrand);
              // Force clear model and year immediately
              setSelectedModel("");
              setSelectedYear("");
            }}
            className="h-12 sm:h-11 rounded-full border-2 border-[var(--border-color)] px-5 bg-white dark:bg-[var(--space-black)] text-base font-medium min-h-[44px] flex-1 w-full"
            required
          >
            <option value="">{t('selectBrand')}</option>
            {allBrands.map(brand => {
              const displayName = brand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return (
                <option key={brand} value={brand}>{displayName}</option>
              );
            })}
          </select>

          <select
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              setSelectedYear("");
            }}
            className="h-12 sm:h-11 rounded-full border-2 border-[var(--border-color)] px-5 bg-white dark:bg-[var(--space-black)] text-base font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed flex-1 w-full"
            required
            disabled={!selectedBrand || availableModels.length === 0}
            key={selectedBrand} // Force re-render when brand changes
          >
            <option value="">{t('selectModel')}</option>
            {availableModels.map((vehicle) => (
              <option key={`${selectedBrand}-${vehicle.value}`} value={vehicle.value}>
                {vehicle.title}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-12 sm:h-11 rounded-full border-2 border-[var(--border-color)] px-5 bg-white dark:bg-[var(--space-black)] text-base font-medium min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed flex-1 w-full"
            required
            disabled={!selectedModel || availableYears.length === 0}
            key={`${selectedBrand}-${selectedModel}`} // Force re-render when brand/model changes
          >
            <option value="">{t('selectYear')}</option>
            {availableYears.map((year, index) => (
              <option key={`${selectedBrand}-${selectedModel}-${index}`} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Vehicle Image and Button */}
        {selectedVehicle && selectedVehicle.image && (
          <>
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-[var(--border-color)] bg-silver/20 dark:bg-zinc-800/30 shadow-xl">
              <Image
                src={selectedVehicle.image}
                alt={selectedVehicle.title}
                fill
                className="object-contain p-4"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent && !parent.querySelector('.no-image-message')) {
                    const errorMsg = document.createElement("div");
                    errorMsg.className = "no-image-message absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm px-2 text-center";
                    errorMsg.textContent = "No image";
                    parent.appendChild(errorMsg);
                  }
                }}
              />
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                if (selectedBrand && selectedModel && selectedYear) {
                  handleGoToServices(e);
                }
              }}
              disabled={!selectedBrand || !selectedModel || !selectedYear}
              className="w-full h-12 sm:h-11 px-8 rounded-full bg-[var(--accent-gold)] text-black text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              {t('goToServices')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function OurWorksSection() {
  const { t, language } = useLanguage();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const res = await fetch("/api/admin/works");
      const data = await res.json();
      const worksArray = Array.isArray(data) ? data : [];
      // Show only first 8 works on homepage
      setWorks(worksArray.slice(0, 8));
    } catch (error) {
      console.error("Failed to load works:", error);
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    const container = document.getElementById('our-works-carousel');
    if (container) {
      const cards = container.querySelectorAll('.carousel-card');
      if (cards.length === 0) return;
      
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      
      // Find the card that is currently closest to center
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      // Scroll to previous card
      if (closestIndex > 0) {
        const prevCard = cards[closestIndex - 1] as HTMLElement;
        const cardRect = prevCard.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2 - containerRect.left;
        const scrollTarget = container.scrollLeft + cardCenter - containerRect.width / 2;
        
        container.scrollTo({
          left: Math.max(0, scrollTarget),
          behavior: 'smooth'
        });
      }
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('our-works-carousel');
    if (container) {
      const cards = container.querySelectorAll('.carousel-card');
      if (cards.length === 0) return;
      
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      
      // Find the card that is currently closest to center
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      // Determine next card index
      const nextIndex = closestIndex === 0 ? 1 : closestIndex + 1;
      
      // Scroll to the target card
      if (nextIndex < cards.length) {
        const nextCard = cards[nextIndex] as HTMLElement;
        const cardRect = nextCard.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2 - containerRect.left;
        const scrollTarget = container.scrollLeft + cardCenter - containerRect.width / 2;
        
        container.scrollTo({
          left: Math.max(0, scrollTarget),
          behavior: 'smooth'
        });
      }
    }
  };

  if (loading) {
    return (
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white">{t('ourWorks').replace('OUR WORKS', 'Our works').replace('НАШИ РАБОТЫ', 'Наши работы')}</h2>
          <Link href="/our-works" className="text-sm sm:text-base text-[var(--accent-gold)] hover:underline font-medium whitespace-nowrap ml-4">
            {t('seeAll')}
          </Link>
        </div>
        
        {/* Mobile/Tablet: Carousel skeleton */}
        <div className="relative lg:hidden">
          <div id="our-works-carousel" className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3 sm:pb-2 pl-9 sm:pl-10 pr-9 sm:pr-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="carousel-card w-[calc(100vw-3.5rem)] min-w-[calc(100vw-3.5rem)] sm:w-[calc(50%-12px)] sm:min-w-[calc(50%-12px)] rounded-2xl sm:rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0 snap-center bg-white dark:bg-zinc-900/50">
                <div className="aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Desktop: Grid skeleton */}
        <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 xl:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50 flex flex-col" style={{ minHeight: '380px' }}>
              <div className="h-48 lg:h-56 xl:h-64 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 animate-pulse" />
              <div className="p-4 lg:p-5 flex flex-col flex-1">
                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-3" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (works.length === 0) {
    return null; // Don't show section if no works
  }

  return (
    <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white">{t('ourWorks').replace('OUR WORKS', 'Our works').replace('НАШИ РАБОТЫ', 'Наши работы')}</h2>
        <Link href="/our-works" className="text-sm sm:text-base text-[var(--accent-gold)] hover:underline font-medium whitespace-nowrap ml-4">
          {t('seeAll')}
        </Link>
      </div>
      
      {/* Mobile/Tablet: Carousel */}
      <div className="relative lg:hidden">
        <div id="our-works-carousel" className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3 sm:pb-2 pl-9 sm:pl-10 pr-9 sm:pr-10">
          {works.map((work) => (
            <Link
              key={work.id}
              href={`/our-works/${work.id}`}
              className="carousel-card group w-[calc(100vw-3.5rem)] min-w-[calc(100vw-3.5rem)] sm:w-[calc(50%-12px)] sm:min-w-[calc(50%-12px)] flex-shrink-0 snap-center rounded-2xl sm:rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-300 cursor-pointer bg-white dark:bg-zinc-900/50 hover:-translate-y-1 active:translate-y-0"
            >
              <div className="relative aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
                {work.images && work.images.length > 0 && work.images[0] ? (
                  <>
                    <Image
                      src={work.images[0]}
                      alt={language === 'ru' ? work.titleRu : work.titleEn}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {work.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs sm:text-[10px] px-2.5 py-1.5 rounded-full backdrop-blur-md font-semibold shadow-lg">
                        +{work.images.length - 1}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm">
                    {language === 'ru' ? work.titleRu : work.titleEn}
                  </div>
                )}
              </div>
              <div className="p-4 bg-white dark:bg-zinc-900/50">
                <h3 className="text-base sm:text-sm font-semibold line-clamp-2 mb-2 text-zinc-900 dark:text-zinc-100 group-hover:text-[var(--accent-gold)] transition-colors duration-300 leading-tight">
                  {language === 'ru' ? work.titleRu : work.titleEn}
                </h3>
                <p className="text-sm sm:text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {language === 'ru' ? work.descriptionRu : work.descriptionEn}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation arrows for mobile/tablet */}
        {works.length > 1 && (
          <>
            <button
              onClick={scrollLeft}
              className="absolute left-2 sm:left-3 top-[calc(18px+108px)] sm:top-[calc(22px+144px)] w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 dark:bg-black/80 backdrop-blur-sm border-2 border-white/40 dark:border-zinc-300/40 shadow-2xl flex items-center justify-center hover:bg-black/90 dark:hover:bg-black/90 hover:border-[var(--accent-gold)] hover:shadow-[var(--accent-gold)]/50 active:scale-95 transition-all duration-200 z-30 group touch-manipulation"
              aria-label="Previous"
            >
              <span className="text-base sm:text-lg text-white group-hover:text-[var(--accent-gold)] transition-colors font-bold">←</span>
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-2 sm:right-3 top-[calc(18px+108px)] sm:top-[calc(22px+144px)] w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 dark:bg-black/80 backdrop-blur-sm border-2 border-white/40 dark:border-zinc-300/40 shadow-2xl flex items-center justify-center hover:bg-black/90 dark:hover:bg-black/90 hover:border-[var(--accent-gold)] hover:shadow-[var(--accent-gold)]/50 active:scale-95 transition-all duration-200 z-30 group touch-manipulation"
              aria-label="Next"
            >
              <span className="text-base sm:text-lg text-white group-hover:text-[var(--accent-gold)] transition-colors font-bold">→</span>
            </button>
          </>
        )}
      </div>

      {/* Desktop: Grid - Larger cards similar to Top Orders */}
      <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 xl:gap-8">
        {works.map((work) => (
          <Link
            key={work.id}
            href={`/our-works/${work.id}`}
            className="group rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-black/40 transition-all duration-300 cursor-pointer bg-white dark:bg-zinc-900/50 hover:-translate-y-1 active:translate-y-0 backdrop-blur-sm flex flex-col"
            style={{ minHeight: '380px' }}
          >
            <div className="relative h-48 lg:h-56 xl:h-64 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden flex-shrink-0">
              {work.images && work.images.length > 0 && work.images[0] ? (
                <>
                  <Image
                    src={work.images[0]}
                    alt={language === 'ru' ? work.titleRu : work.titleEn}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {work.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2.5 py-1.5 rounded-full backdrop-blur-md font-semibold shadow-lg">
                      +{work.images.length - 1}
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm">
                  {language === 'ru' ? work.titleRu : work.titleEn}
                </div>
              )}
            </div>
            <div className="p-4 lg:p-5 bg-white dark:bg-zinc-900/50 flex flex-col flex-1">
              <h3 className="text-base lg:text-lg font-semibold line-clamp-2 mb-2 lg:mb-3 text-zinc-900 dark:text-zinc-100 group-hover:text-[var(--accent-gold)] transition-colors duration-300 leading-tight">
                {language === 'ru' ? work.titleRu : work.titleEn}
              </h3>
              <p className="text-sm lg:text-base text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                {language === 'ru' ? work.descriptionRu : work.descriptionEn}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TopOrdersSection() {
  const { t } = useLanguage();
  const [topServices, setTopServices] = useState<Array<ServiceOption & { brand: string; model: string; year: string; category: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopServices();
  }, []);

  const loadTopServices = async () => {
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      
      // Collect all services from all brands, models, years, and categories
      const allServices: Array<ServiceOption & { brand: string; model: string; year: string; category: string }> = [];
      
      // Only process if data is an object (not empty array or null)
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        for (const brand in data) {
          if (data[brand] && typeof data[brand] === 'object') {
            for (const model in data[brand]) {
              if (data[brand][model] && typeof data[brand][model] === 'object') {
                for (const year in data[brand][model]) {
                  if (data[brand][model][year] && typeof data[brand][model][year] === 'object') {
                    for (const category in data[brand][model][year]) {
                      const services = data[brand][model][year][category];
                      if (Array.isArray(services) && services.length > 0) {
                        services.forEach((service: ServiceOption) => {
                          // Only add if service has title
                          if (service && service.title) {
                            allServices.push({
                              ...service,
                              brand,
                              model,
                              year,
                              category,
                            });
                          }
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      // Only show services that were actually added (no limit, show all)
      setTopServices(allServices);
    } catch (error) {
      console.error("Failed to load top services:", error);
      setTopServices([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    const container = document.getElementById('top-orders-carousel');
    if (container) {
      const cards = container.querySelectorAll('.carousel-card');
      if (cards.length === 0) return;
      
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      
      // Find the card that is currently closest to center
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      // Scroll to previous card
      if (closestIndex > 0) {
        const prevCard = cards[closestIndex - 1] as HTMLElement;
        const cardRect = prevCard.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2 - containerRect.left;
        const scrollTarget = container.scrollLeft + cardCenter - containerRect.width / 2;
        
        container.scrollTo({
          left: Math.max(0, scrollTarget),
          behavior: 'smooth'
        });
      }
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('top-orders-carousel');
    if (container) {
      const cards = container.querySelectorAll('.carousel-card');
      if (cards.length === 0) return;
      
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      
      // Find the card that is currently closest to center
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      // Determine next card index
      // If we're at index 0 (first card), go to index 1 (second card)
      // Otherwise go to the next card
      const nextIndex = closestIndex === 0 ? 1 : closestIndex + 1;
      
      // Scroll to the target card
      if (nextIndex < cards.length) {
        const nextCard = cards[nextIndex] as HTMLElement;
        const cardRect = nextCard.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2 - containerRect.left;
        const scrollTarget = container.scrollLeft + cardCenter - containerRect.width / 2;
        
        container.scrollTo({
          left: Math.max(0, scrollTarget),
          behavior: 'smooth'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="relative">
        <div id="top-orders-carousel" className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3 sm:pb-2 pl-9 sm:pl-10 md:pl-0 pr-9 sm:pr-10 md:pr-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="carousel-card w-[calc(100vw-3.5rem)] min-w-[calc(100vw-3.5rem)] sm:w-[calc(50%-12px)] sm:min-w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] lg:min-w-[calc(33.333%-16px)] rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0 snap-center flex flex-col h-full" style={{ minHeight: '380px' }}>
              <div className="h-36 sm:h-48 md:h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 animate-pulse" />
              <div className="p-4 sm:p-4 md:p-5 bg-white dark:bg-zinc-900/50 flex flex-col flex-1">
                <div className="h-4 sm:h-5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-3 sm:mb-3 min-h-[2.5rem] sm:min-h-[3rem] px-1" />
                <div className="h-3 sm:h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-3 sm:mb-3 w-1/3 min-h-[1.5rem] sm:min-h-[1.75rem]" />
                <div className="flex-1"></div>
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2.5 mt-auto">
                  <div className="flex-1 h-11 sm:h-11 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                  <div className="flex-1 h-11 sm:h-11 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (topServices.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="text-sm sm:text-base">{t('noServicesAvailable')}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Carousel */}
      <div id="top-orders-carousel" className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3 sm:pb-2 pl-9 sm:pl-10 md:pl-0 pr-9 sm:pr-10 md:pr-0">
        {topServices.map((service, index) => (
          <div 
            key={`${service.brand}-${service.model}-${service.year}-${service.category}-${index}`} 
            className="carousel-card group w-[calc(100vw-3.5rem)] min-w-[calc(100vw-3.5rem)] sm:w-[calc(50%-12px)] sm:min-w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] lg:min-w-[calc(33.333%-16px)] flex-shrink-0 snap-center rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-black/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 backdrop-blur-sm flex flex-col h-full"
            style={{ minHeight: '380px' }}
          >
            {/* Image container with overlay gradient */}
            <div className="relative h-36 sm:h-48 md:h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden flex-shrink-0">
              {service.image ? (
                <>
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs px-2 text-center">
                  {service.title}
                </div>
              )}
              {service.status === "in-stock" && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[var(--accent-gold)] text-black px-2 sm:px-2.5 md:px-3 py-1 rounded-full text-[9px] sm:text-[10px] md:text-xs font-bold shadow-lg backdrop-blur-sm">
                  {t('inStock')}
                </div>
              )}
            </div>
            
            {/* Content - flex-1 to push buttons to bottom */}
            <div className="p-4 sm:p-4 md:p-5 bg-white dark:bg-zinc-900/50 flex flex-col flex-1 relative">
              <h3 className="font-semibold mb-3 sm:mb-3 md:mb-4 text-sm sm:text-sm md:text-base text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight group-hover:text-[var(--accent-gold)] dark:group-hover:text-[var(--accent-gold)] transition-colors duration-300 flex-shrink-0 pr-2">
                {service.title}
              </h3>
              
              {/* Price if available */}
              {service.price ? (
                <div className="mb-3 sm:mb-3 md:mb-4 flex-shrink-0 min-h-[1.5rem] sm:min-h-[1.75rem] pr-2">
                  <span className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {service.price}
                  </span>
                </div>
              ) : (
                <div className="mb-3 sm:mb-3 md:mb-4 flex-shrink-0 min-h-[1.5rem] sm:min-h-[1.75rem]"></div>
              )}
              
              {/* Spacer to push buttons down */}
              <div className="flex-1"></div>
              
              {/* Buttons - fixed height and width for uniformity */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2.5 flex-shrink-0 mt-auto">
                <Link
                  href="/vehicles"
                  className="flex-1 h-11 sm:h-11 px-3 sm:px-4 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[#f5c842] text-black text-sm sm:text-sm font-bold inline-flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-[var(--accent-gold)]/30 active:scale-95 transition-all duration-200 hover:from-[#f5c842] hover:to-[var(--accent-gold)] touch-manipulation"
                >
                  {t('addToCart')}
                </Link>
                <Link
                  href="/vehicles"
                  className="flex-1 h-11 sm:h-11 px-3 sm:px-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm sm:text-sm font-semibold inline-flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-[var(--accent-gold)] dark:hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] dark:hover:text-[var(--accent-gold)] active:scale-95 transition-all duration-200 touch-manipulation"
                >
                  {t('details')}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows - positioned over image center, never over text */}
      {topServices.length > 1 && (
        <>
          <button
            onClick={scrollLeft}
            className="absolute left-2 sm:left-3 md:-left-4 top-[calc(18px+72px)] sm:top-[calc(22px+96px)] md:top-1/2 md:-translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-black/70 dark:bg-black/80 backdrop-blur-sm border-2 border-white/40 dark:border-zinc-300/40 shadow-2xl flex items-center justify-center hover:bg-black/90 dark:hover:bg-black/90 hover:border-[var(--accent-gold)] hover:shadow-[var(--accent-gold)]/50 active:scale-95 transition-all duration-200 z-30 group touch-manipulation"
            aria-label="Previous"
          >
            <span className="text-base sm:text-lg md:text-xl text-white group-hover:text-[var(--accent-gold)] transition-colors font-bold">←</span>
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-2 sm:right-3 md:-right-4 top-[calc(18px+72px)] sm:top-[calc(22px+96px)] md:top-1/2 md:-translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-black/70 dark:bg-black/80 backdrop-blur-sm border-2 border-white/40 dark:border-zinc-300/40 shadow-2xl flex items-center justify-center hover:bg-black/90 dark:hover:bg-black/90 hover:border-[var(--accent-gold)] hover:shadow-[var(--accent-gold)]/50 active:scale-95 transition-all duration-200 z-30 group touch-manipulation"
            aria-label="Next"
          >
            <span className="text-base sm:text-lg md:text-xl text-white group-hover:text-[var(--accent-gold)] transition-colors font-bold">→</span>
          </button>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const [offerOpen, setOfferOpen] = useState(false);
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    vin: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Check localStorage only after component mounts on client
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lr-chip-cookie-accepted');
      if (saved === 'true') {
        setCookieAccepted(true);
      }
    }
  }, []);

  // Handle cookie acceptance
  const handleCookieAccept = () => {
    setCookieAccepted(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lr-chip-cookie-accepted', 'true');
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        customerName: formData.name,
        vehicleVIN: formData.vin,
        contact: formData.contact,
        items: [],
        total: "£0",
        vehicle: {
          brand: "",
          model: "",
          year: "",
        },
        type: "general-inquiry",
      };

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        setOfferOpen(false);
        setFormData({ name: "", vin: "", contact: "" });
        // Show success message and redirect to home page
        alert(t('requestSubmitted'));
        // Already on home page, just refresh or show message
        window.location.reload();
      } else {
        alert(t('failedToSubmitRequest'));
      }
    } catch (error) {
      alert(t('failedToSubmitRequest'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[60dvh] sm:min-h-[80dvh] flex items-center bg-[var(--space-black)] text-white overflow-hidden">
        {/* Video Background */}
        {!videoError && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
            onError={() => setVideoError(true)}
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
            <source src="/videos/hero-video.webm" type="video/webm" />
          </video>
        )}
        
        {/* Fallback background if video fails to load */}
        {videoError && (
          <div className="absolute inset-0 bg-[var(--space-black)] z-[0]" />
        )}
        
        {/* Dark overlay for text readability */}
        <div className={`absolute inset-0 z-[1] ${videoError ? 'bg-black/30' : 'bg-black/50'}`} />
        
        {/* Content */}
        <div className="relative z-10 container-padded mx-auto max-w-6xl py-12 sm:py-20 px-4">
          <h1 className="text-[clamp(32px,5vw,56px)] font-semibold leading-tight max-w-4xl mb-4">
            {t('heroTitle')}
          </h1>
          <div className="space-y-2 text-base sm:text-lg text-zinc-300 max-w-3xl mb-8">
            <p>{t('heroPoint1')}</p>
            <p>{t('heroPoint2')}</p>
            <p>{t('heroPoint3')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setOfferOpen(true); }} 
              className="h-12 sm:h-11 px-6 sm:px-5 rounded-full bg-[var(--accent-gold)] text-black text-base sm:text-sm font-semibold inline-flex items-center justify-center min-h-[44px] sm:min-h-0 shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              {t('getAnOffer')}
            </button>
            <Link 
              href="/contact"
              className="h-12 sm:h-11 px-6 sm:px-5 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur text-base sm:text-sm font-semibold inline-flex items-center justify-center min-h-[44px] sm:min-h-0 hover:bg-white/20 active:scale-95 transition-all"
            >
              {t('contacts')}
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-zinc-900 dark:text-white">{t('services')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: t('retrofits'),
              description: t('retrofitsDescription'),
              link: "/retrofits"
            },
            {
              title: t('featuresActivation'),
              description: t('featuresActivationDescription'),
              link: "/features-activation"
            },
            {
              title: t('powerUpgrade'),
              description: t('powerUpgradeDescription'),
              link: "/power-upgrade"
            },
            {
              title: t('accessories'),
              description: t('accessoriesDescription'),
              link: "/accessories"
            }
          ].map((service) => (
            <Link
              key={service.title}
              href={service.link}
              className="rounded-2xl border border-[var(--border-color)] p-6 hover:shadow-lg transition-shadow flex flex-col h-full"
            >
              <h3 className="text-lg font-semibold mb-3">{service.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 flex-1">{service.description}</p>
              <div className="mt-auto pt-4">
                <span className="inline-block w-full text-center px-4 py-2.5 rounded-full bg-[var(--accent-gold)] text-black text-sm font-semibold hover:opacity-90 transition-opacity">
                  {t('goToServices')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* VEHICLE SELECTOR */}
      <section className="container-padded mx-auto max-w-6xl py-8 sm:py-12 px-4">
        <VehicleSelector />
      </section>

      {/* TOP ORDERS */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-zinc-900 dark:text-white">{t('topOrders')}</h2>
        <div className="relative">
          <TopOrdersSection />
        </div>
      </section>

      {/* FEW FACTS */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">{t('fewFactsAboutUs')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {[
            {
              icon: (
                <svg className="w-6 h-6 text-[var(--accent-gold)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              text: t('fact1')
            },
            {
              icon: (
                <svg className="w-6 h-6 text-[var(--accent-gold)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              text: t('fact2')
            },
            {
              icon: (
                <svg className="w-6 h-6 text-[var(--accent-gold)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              text: t('fact3')
            },
            {
              icon: (
                <svg className="w-6 h-6 text-[var(--accent-gold)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              text: t('fact4')
            },
            {
              icon: (
                <svg className="w-6 h-6 text-[var(--accent-gold)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
              text: t('fact5')
            }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="mt-0.5">
                {item.icon}
              </div>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      <OurWorksSection />

      {/* CONTACTS UK */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">{t('contactsInUK')}</h2>
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          <p>Unit 29 Integra:ME, Parkwood Industrial Estate, Bircholt Road, Maidstone, ME15 9GQ</p>
          <p>
            <a href="tel:+447840000321" className="hover:text-[var(--accent-gold)]">+44 784 0000 321</a>
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-3">{t('schedule')}</h3>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>* {t('monFri')}</li>
            <li>* {t('satWorking')}</li>
            <li>* {t('sunDayOff')}</li>
          </ul>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">{t('whyChooseTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: t('powerAndTorque'),
              description: t('powerAndTorqueDesc')
            },
            {
              title: t('fuelSavings'),
              description: t('fuelSavingsDesc')
            },
            {
              title: t('safetyAndReliability'),
              description: t('safetyAndReliabilityDesc')
            },
            {
              title: t('comfortAndEase'),
              description: t('comfortAndEaseDesc')
            }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-[var(--border-color)] p-6">
              <h3 className="font-semibold mb-3">{item.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <div className="rounded-2xl border border-[var(--border-color)] p-6 sm:p-8 bg-white dark:bg-[var(--space-black)]">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">{t('retrofittingSpecialist')}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {t('anyFactorySystem')}
          </p>
          <form onSubmit={handleOfferSubmit} className="grid gap-4 max-w-md">
            <input
              type="hidden"
              name="honeypot"
              value=""
            />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 sm:h-12 rounded-md border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none"
              placeholder={t('yourName')}
              required
            />
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              className="h-12 sm:h-12 rounded-md border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none"
              placeholder={t('vehicleVINNumber')}
              required
            />
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="h-12 sm:h-12 rounded-md border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none"
              placeholder={t('mobileNumberOrEmail')}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-12 sm:h-12 rounded-md bg-[var(--accent-gold)] text-black text-base sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              {submitting ? t('submitting') : t('getAListOfServices')}
            </button>
          </form>
        </div>
      </section>

      {/* TEAM */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">{t('ourTeam')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { name: "Jenya (UK Branch)", role: "Certified Master Technician", details: "JLR Level‑4, 7+ years" },
            { name: "Jenya (UK, UA)", role: "Retrofitting Specialist", details: "8+ years with JLR" },
            { name: "Chief Electrician", role: "Car security systems", details: "10+ years, JLR 7+ years" },
            { name: "Serhiy (UA)", role: "Chief Technician", details: "Dealer 5 yrs, JLR 10+ yrs" },
            { name: "Ihor (UA)", role: "Parts Specialist", details: "JLR 4+ years" }
          ].map((member, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-silver/20 mb-4" />
              <div className="font-medium text-sm mb-1">{member.name}</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">{member.role}</div>
              <div className="text-xs text-zinc-500">{member.details}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">{t('processTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { num: "1", title: t('diagnostics'), desc: t('diagnosticsDesc') },
            { num: "2", title: t('readingSetup'), desc: t('readingSetupDesc') },
            { num: "3", title: t('flashing'), desc: t('flashingDesc') },
            { num: "4", title: t('testDrive'), desc: t('testDriveDesc') }
          ].map((step) => (
            <div key={step.num} className="rounded-2xl border border-[var(--border-color)] p-6">
              <div className="text-2xl font-bold text-[var(--accent-gold)] mb-2">{step.num}.</div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODELS */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">{t('modelsTitle')}</h2>
        <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
          <p><strong>Land Rover:</strong> {t('modelsLandRover').replace('Land Rover: ', '')}</p>
          <p><strong>Jaguar:</strong> {t('modelsJaguar').replace('Jaguar: ', '')}</p>
          <p><strong>{t('engines')}:</strong> {t('enginesDescription')}</p>
        </div>
      </section>

      {/* EXPERTISE */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">{t('advantagesTitle')}</h2>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          {[
            t('narrowSpecialization'),
            t('individualMaps'),
            t('professionalTools'),
            t('guarantees'),
            t('freeReturn')
          ].map((item, i) => (
            <div key={i}>* {item}</div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">{t('faqTitle')}</h2>
        <div className="space-y-6">
          {[
            {
              q: t('faq1Question'),
              a: t('faq1Answer')
            },
            {
              q: t('faq2Question'),
              a: t('faq2Answer')
            },
            {
              q: t('faq3Question'),
              a: t('faq3Answer')
            },
            {
              q: t('faq4Question'),
              a: t('faq4Answer')
            }
          ].map((faq, i) => (
            <details key={i} className="rounded-xl border border-[var(--border-color)] p-4">
              <summary className="font-semibold cursor-pointer">{faq.q}</summary>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <div className="rounded-2xl border border-[var(--border-color)] p-6 sm:p-8 bg-white dark:bg-[var(--space-black)]">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">{t('finalCTATitle')}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {t('finalCTADesc')}
          </p>
          <form onSubmit={handleOfferSubmit} className="grid gap-4 max-w-md">
            <input
              type="hidden"
              name="honeypot"
              value=""
            />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 sm:h-12 rounded-md border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none"
              placeholder={t('name')}
              required
            />
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="h-12 sm:h-12 rounded-md border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none"
              placeholder={t('phone')}
              required
            />
            <input
              type="text"
              className="h-12 sm:h-12 rounded-md border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none"
              placeholder={t('vehicleModel')}
            />
            <textarea
              className="h-24 sm:h-24 rounded-md border-2 border-[var(--border-color)] px-4 py-3 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[100px] focus:border-[var(--accent-gold)] focus:outline-none resize-none"
              placeholder={t('comment')}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-12 sm:h-11 rounded-full bg-[var(--accent-gold)] text-black text-base sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                {submitting ? t('submitting') : t('submitRequest')}
              </button>
              <a
                href="tel:+447840000321"
                className="flex-1 h-12 sm:h-11 rounded-full border-2 border-[var(--border-color)] bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-semibold inline-flex items-center justify-center min-h-[44px] sm:min-h-0 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 transition-all"
              >
                {t('callUs')}
          </a>
          <a
                href="https://wa.me/447840000321"
                className="flex-1 h-12 sm:h-11 rounded-full border-2 border-[var(--border-color)] bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-semibold inline-flex items-center justify-center min-h-[44px] sm:min-h-0 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 transition-all"
              >
                {t('whatsapp')}
              </a>
            </div>
          </form>
        </div>
      </section>

      {/* OFFER MODAL */}
      {offerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOfferOpen(false)} />
          <div className="relative z-[61] w-full max-w-2xl rounded-2xl bg-white dark:bg-[var(--space-black)] border-2 border-[var(--border-color)] p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Close" className="absolute right-3 top-3 sm:right-4 sm:top-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-xl transition-colors" onClick={() => setOfferOpen(false)}>✕</button>
            <h3 className="text-lg sm:text-xl font-semibold pr-8 text-[var(--foreground)]">{t('getAnOfferTitle')}</h3>
            <form onSubmit={handleOfferSubmit} className="mt-4 sm:mt-6 grid gap-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 sm:h-12 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('yourName')}
                required
              />
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="h-12 sm:h-12 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('vehicleVINNumber')}
                required
              />
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="h-12 sm:h-12 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('mobileNumberOrEmail')}
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="h-12 sm:h-12 rounded-full bg-[var(--accent-gold)] text-black text-base sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                {submitting ? t('submitting') : t('getAListOfServices')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COOKIE BAR */}
      {mounted && !cookieAccepted && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-[#3b3b3b] text-white/90 shadow-lg">
          <div className="container-padded mx-auto max-w-6xl py-3 px-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="text-[10px] sm:text-xs flex-1">{t('cookieMessage')}</div>
            <button className="w-full sm:w-auto sm:ml-auto h-8 px-4 rounded bg-[#ffd000] text-black text-xs font-medium hover:opacity-90 transition-opacity" onClick={handleCookieAccept}>{t('accept')}</button>
          </div>
        </div>
      )}
      
      {/* Add padding to main content when cookie bar is visible */}
      {mounted && !cookieAccepted && (
        <style jsx global>{`
          main {
            padding-bottom: 60px;
          }
          @media (min-width: 640px) {
            main {
              padding-bottom: 0;
            }
          }
        `}</style>
      )}
    </div>
  );
}
