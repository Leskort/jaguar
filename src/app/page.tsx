"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  description: string;
  status?: "in-stock" | "unavailable" | "coming-soon";
};

function VehicleSelector() {
  const router = useRouter();
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

  const handleGoToServices = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBrand && selectedModel && selectedYear) {
      router.push(`/services/${selectedBrand}/${selectedModel}/${selectedYear}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Select Vehicle Model</div>
      <form onSubmit={handleGoToServices} className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedBrand}
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            setSelectedModel("");
            setSelectedYear("");
          }}
          className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm"
          required
        >
          <option value="">Select Brand</option>
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
          className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm"
          required
          disabled={!selectedBrand || availableModels.length === 0}
        >
          <option value="">Select Model</option>
          {availableModels.map((vehicle) => (
            <option key={vehicle.value} value={vehicle.value}>
              {vehicle.title}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm"
          required
          disabled={!selectedModel || availableYears.length === 0}
        >
          <option value="">Select Year</option>
          {availableYears.map((year, index) => (
            <option key={index} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!selectedBrand || !selectedModel || !selectedYear}
          className="h-10 px-6 rounded-full bg-[var(--accent-gold)] text-black text-sm font-medium md:ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Go to services
        </button>
      </form>
    </div>
  );
}

function TopOrdersSection() {
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
        <div id="top-orders-carousel" className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-[calc((100vw-85vw-3rem)/2)] sm:px-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="carousel-card w-[85vw] min-w-[85vw] sm:w-[calc(50%-12px)] sm:min-w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] lg:min-w-[calc(33.333%-16px)] rounded-2xl border border-[var(--border-color)] overflow-hidden flex-shrink-0 snap-center">
              <div className="h-48 bg-silver/20 animate-pulse" />
              <div className="p-4">
                <div className="h-4 bg-silver/20 rounded animate-pulse mb-3" />
                <div className="flex gap-2">
                  <div className="flex-1 h-8 bg-silver/20 rounded animate-pulse" />
                  <div className="flex-1 h-8 bg-silver/20 rounded animate-pulse" />
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
        <p className="text-sm sm:text-base">No services available yet. Services will appear here once added in the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Carousel */}
      <div id="top-orders-carousel" className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 px-[calc((100vw-85vw-3rem)/2)] sm:px-0">
        {topServices.map((service, index) => (
          <div 
            key={`${service.brand}-${service.model}-${service.year}-${service.category}-${index}`} 
            className="carousel-card w-[85vw] min-w-[85vw] sm:w-[calc(50%-12px)] sm:min-w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] lg:min-w-[calc(33.333%-16px)] flex-shrink-0 snap-center rounded-2xl border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48 sm:h-56 bg-silver/20">
              {service.image ? (
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs px-2 text-center">
                  {service.title}
                </div>
              )}
              {service.status === "in-stock" && (
                <div className="absolute bottom-2 right-2 bg-[var(--accent-gold)] text-black px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-bold">
                  IN STOCK
                </div>
              )}
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="font-medium mb-2 sm:mb-3 text-xs sm:text-sm line-clamp-2">{service.title}</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/vehicles"
                  className="flex-1 h-8 sm:h-9 px-3 sm:px-4 rounded bg-[var(--accent-gold)] text-black text-xs sm:text-sm font-medium inline-flex items-center justify-center"
                >
                  Add to cart
                </Link>
                <Link
                  href="/vehicles"
                  className="flex-1 h-8 sm:h-9 px-3 sm:px-4 rounded border border-[var(--border-color)] text-xs sm:text-sm inline-flex items-center justify-center"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {topServices.length > 0 && (
        <>
          <button
            onClick={scrollLeft}
            className="absolute left-2 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-[var(--border-color)] shadow-lg flex items-center justify-center hover:bg-zinc-50 active:bg-zinc-100 transition-colors z-10"
            aria-label="Previous"
          >
            <span className="text-xl">←</span>
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-2 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-[var(--border-color)] shadow-lg flex items-center justify-center hover:bg-zinc-50 active:bg-zinc-100 transition-colors z-10"
            aria-label="Next"
          >
            <span className="text-xl">→</span>
          </button>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const [offerOpen, setOfferOpen] = useState(false);
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    vin: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);

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
        alert("Thank you for your request. We will contact you soon.");
        setOfferOpen(false);
        setFormData({ name: "", vin: "", contact: "" });
      } else {
        alert("Failed to submit request. Please try again.");
      }
    } catch (error) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[60dvh] sm:min-h-[80dvh] flex items-center bg-[var(--space-black)] text-white">
        <div className="absolute inset-0 opacity-30 bg-[url('/window.svg')] bg-cover bg-center pointer-events-none" />
        <div className="relative z-10 container-padded mx-auto max-w-6xl py-12 sm:py-20 px-4">
          <h1 className="text-[clamp(32px,5vw,56px)] font-semibold leading-tight max-w-4xl mb-4">
            Chip tuning for Land Rover and Jaguar. Unlock the true potential of your vehicle.
          </h1>
          <div className="space-y-2 text-base sm:text-lg text-zinc-300 max-w-3xl mb-8">
            <p>Increase power and torque.</p>
            <p>Improve throttle response and overall performance.</p>
            <p>Optimize fuel consumption.</p>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setOfferOpen(true); }} 
              className="h-10 px-5 rounded-full bg-[var(--accent-gold)] text-black text-sm font-medium inline-flex items-center"
            >
              GET AN OFFER
            </button>
            <Link 
              href="/contact"
              className="h-10 px-5 rounded-full border border-white/20 text-sm inline-flex items-center"
            >
              CONTACTS
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Retrofits",
              description: "Factory options — installation for specific model and year.",
              link: "/retrofits"
            },
            {
              title: "Features activation",
              description: "Activation of hidden features and software options.",
              link: "/features-activation"
            },
            {
              title: "Power upgrade",
              description: "Individual chip tuning for JLR.",
              link: "/power-upgrade"
            },
            {
              title: "Accessories",
              description: "Original accessories and kits.",
              link: "/accessories"
            }
          ].map((service) => (
            <Link
              key={service.title}
              href={service.link}
              className="rounded-2xl border border-[var(--border-color)] p-6 hover:shadow-lg transition-shadow block"
            >
              <h3 className="text-lg font-semibold mb-3">{service.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{service.description}</p>
              <span className="text-sm text-[var(--accent-gold)] hover:underline">
                Go to services
              </span>
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
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">Top orders</h2>
        <div className="relative">
          <TopOrdersSection />
        </div>
      </section>

      {/* OUR WORKS */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold">Our works</h2>
          <Link href="/our-works" className="text-sm text-[var(--accent-gold)] hover:underline">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-silver/20" />
          ))}
        </div>
      </section>

      {/* LATEST ARTICLES */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold">Latest articles</h2>
          <Link href="#" className="text-sm text-[var(--accent-gold)] hover:underline">
            See more
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "DEFENDER 11.4″ PiVi Pro display retrofit",
              description: "Large display with high brightness and screen area."
            },
            {
              title: "DISCOVERY 5 2022MY+ — eight systems in 2 days",
              description: "Upgrades on EVA 2.0 platform with PiVi Pro."
            },
            {
              title: "Range Rover 2020MY: HUD and ACC",
              description: "Features of Head‑Up Display and adaptive cruise retrofitting."
            }
          ].map((article) => (
            <article key={article.title} className="rounded-2xl border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-silver/20" />
              <div className="p-4 sm:p-6">
                <h3 className="font-semibold mb-2">{article.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{article.description}</p>
                <Link href="#" className="text-sm text-[var(--accent-gold)] hover:underline">
                  Read
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <div className="rounded-2xl border border-[var(--border-color)] p-6 sm:p-8 bg-white dark:bg-[var(--space-black)]">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">LR‑CHIP retrofitting specialist</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Any factory system can be installed, if it matches the year of manufacture and model.
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
              className="h-12 rounded-md border border-[var(--border-color)] px-4 bg-transparent text-sm"
              placeholder="Your name"
              required
            />
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              className="h-12 rounded-md border border-[var(--border-color)] px-4 bg-transparent text-sm"
              placeholder="Vehicle VIN number"
              required
            />
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="h-12 rounded-md border border-[var(--border-color)] px-4 bg-transparent text-sm"
              placeholder="Mobile number or email address"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-12 rounded-md bg-[var(--accent-gold)] text-black text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Get a list of services"}
            </button>
          </form>
        </div>
      </section>

      {/* FEW FACTS */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">Few facts about us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {[
            "1‑year warranty for all retrofit systems",
            "Only genuine parts and equipment",
            "Specializing exclusively in Land Rover, Jaguar vehicles",
            "8+ years experience, 1400+ JLR vehicles",
            "600+ posts in Instagram with JLR upgrades"
          ].map((fact, i) => (
            <div key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
              * {fact}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTS UK */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Contacts in the UK</h2>
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          <p>Unit 29 Integra:ME, Parkwood Industrial Estate, Bircholt Road, Maidstone, ME15 9GQ</p>
          <p>
            <a href="tel:+447840000321" className="hover:text-[var(--accent-gold)]">+44 784 0000 321</a>
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Schedule</h3>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>* Mon–Fri 10:00–19:00</li>
            <li>* Sat — working by agreement</li>
            <li>* Sun — day off</li>
          </ul>
        </div>
      </section>

      {/* TEAM */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">Our team</h2>
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

      {/* WHY CHOOSE */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">Why choose chip tuning from LR-Chip?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Power and torque",
              description: "Up to 30% increase in power and torque. Lively response, dynamic acceleration and confidence when overtaking."
            },
            {
              title: "Fuel savings",
              description: "Up to 15% reduction in fuel consumption through optimization of mixture formation and boost maps."
            },
            {
              title: "Safety and reliability",
              description: "We work within safe factory limits. Engine life is not affected."
            },
            {
              title: "Comfort and ease",
              description: "On request — correct shutdown of EGR and DPF, optimization of transmission logic for smoother shifts."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-[var(--border-color)] p-6">
              <h3 className="font-semibold mb-3">{item.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">Chip tuning process — fast and professional</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { num: "1", title: "Diagnostics", desc: "Free computer check of systems and errors." },
            { num: "2", title: "Reading/Setup", desc: "We read the original ECU software and create an individual profile for your engine and driving style." },
            { num: "3", title: "Flashing", desc: "We upload the optimized calibration to the control unit." },
            { num: "4", title: "Test drive and result", desc: "Control measurements, adaptations and demonstration of changes." }
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
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">We work with all Land Rover and Jaguar models</h2>
        <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
          <p><strong>Land Rover:</strong> Range Rover, Range Rover Sport, Velar, Evoque, Discovery, Defender and more.</p>
          <p><strong>Jaguar:</strong> F-Pace, E-Pace, XE, XF, XJ, F-Type and more.</p>
          <p><strong>Engines:</strong> Petrol and diesel, including modern hybrids (PHEV).</p>
        </div>
      </section>

      {/* EXPERTISE */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">LR-Chip — expertise you can trust</h2>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          {[
            "**Narrow specialization:** We work exclusively with Land Rover and Jaguar — we know their ECU nuances.",
            "**Individual maps:** No 'universal boxes' — personal calibration for your vehicle's condition.",
            "**Professional tools:** Alientech, Magic Motorsport and certified software.",
            "**Guarantees and confidentiality:** Written warranty on work and data security.",
            "**Free return to stock:** When selling the vehicle, we will restore factory settings at no extra charge."
          ].map((item, i) => (
            <div key={i}>* {item}</div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8">Frequently asked questions (FAQ)</h2>
        <div className="space-y-6">
          {[
            {
              q: "Does chip tuning void the factory warranty?",
              a: "Chip tuning may affect dealer warranty if the malfunction is directly related to software changes. We work within safe limits and provide our own warranty on work."
            },
            {
              q: "Is the remap visible during dealer diagnostics?",
              a: "Our methods minimize detectability during standard dealer diagnostics. However, specialized checks may detect software changes."
            },
            {
              q: "How long does the process take?",
              a: "Usually 2–4 hours, depending on the model, ECU type and selected options (EGR/DPF/transmission)."
            },
            {
              q: "Is it harmful to the engine and transmission?",
              a: "No, with proper calibration we maintain temperature and load limits, which does not reduce the life of the units."
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
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Ready to transform your Land Rover or Jaguar?</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Contact us today for a free consultation and accurate cost estimate.
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
              className="h-12 rounded-md border border-[var(--border-color)] px-4 bg-transparent text-sm"
              placeholder="Name"
              required
            />
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="h-12 rounded-md border border-[var(--border-color)] px-4 bg-transparent text-sm"
              placeholder="Phone"
              required
            />
            <input
              type="text"
              className="h-12 rounded-md border border-[var(--border-color)] px-4 bg-transparent text-sm"
              placeholder="Vehicle model"
            />
            <textarea
              className="h-24 rounded-md border border-[var(--border-color)] px-4 py-3 bg-transparent text-sm resize-none"
              placeholder="Comment"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-12 rounded-md bg-[var(--accent-gold)] text-black text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit request"}
              </button>
              <a
                href="tel:+447840000321"
                className="flex-1 h-12 rounded-md border border-[var(--border-color)] text-sm inline-flex items-center justify-center"
              >
                Call us
          </a>
          <a
                href="https://wa.me/447840000321"
                className="flex-1 h-12 rounded-md border border-[var(--border-color)] text-sm inline-flex items-center justify-center"
              >
                WhatsApp
              </a>
            </div>
          </form>
        </div>
      </section>

      {/* OFFER MODAL */}
      {offerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOfferOpen(false)} />
          <div className="relative z-[61] w-full max-w-2xl rounded-2xl bg-white text-black p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Close" className="absolute right-3 top-3 sm:right-4 sm:top-4 text-zinc-500 hover:text-black text-xl" onClick={() => setOfferOpen(false)}>✕</button>
            <h3 className="text-lg sm:text-xl font-semibold pr-8">Get an offer</h3>
            <form onSubmit={handleOfferSubmit} className="mt-4 sm:mt-6 grid gap-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 sm:h-12 rounded-md border border-zinc-200 px-4 text-xs sm:text-sm"
                placeholder="YOUR NAME"
                required
              />
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="h-10 sm:h-12 rounded-md border border-zinc-200 px-4 text-xs sm:text-sm"
                placeholder="VEHICLE VIN NUMBER"
                required
              />
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="h-10 sm:h-12 rounded-md border border-zinc-200 px-4 text-xs sm:text-sm"
                placeholder="MOBILE NUMBER OR EMAIL ADDRESS"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="h-10 sm:h-12 rounded-md bg-[#ffd000] text-black text-sm sm:text-base font-medium disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "GET AN OFFER"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COOKIE BAR */}
      {!cookieAccepted && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-[#3b3b3b] text-white/90 shadow-lg">
          <div className="container-padded mx-auto max-w-6xl py-3 px-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="text-[10px] sm:text-xs flex-1">This website stores cookies on your computer to provide more personalized services to you.</div>
            <button className="w-full sm:w-auto sm:ml-auto h-8 px-4 rounded bg-[#ffd000] text-black text-xs font-medium hover:opacity-90 transition-opacity" onClick={() => setCookieAccepted(true)}>Accept</button>
          </div>
        </div>
      )}
      
      {/* Add padding to main content when cookie bar is visible */}
      {!cookieAccepted && (
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
