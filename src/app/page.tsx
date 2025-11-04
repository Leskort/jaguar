"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Vehicle = {
  brand: string;
  value: string;
  title: string;
  image: string;
  years: Array<{ value: string; label: string }>;
};

function VehicleSelector() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("land-rover");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const res = await fetch("/api/admin/vehicles");
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    }
  };

  const availableModels = vehicles.filter(v => v.brand === selectedBrand);
  const selectedVehicle = availableModels.find(v => v.value === selectedModel);
  const availableYears = selectedVehicle?.years || [];

  const handleGoToServices = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBrand && selectedModel && selectedYear) {
      router.push(`/services/${selectedBrand}/${selectedModel}/${selectedYear}`);
    }
  };

  return (
    <form onSubmit={handleGoToServices} className="flex flex-col md:flex-row gap-3">
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
        <option value="land-rover">LAND ROVER</option>
        <option value="jaguar">JAGUAR</option>
      </select>

      <select
        value={selectedModel}
        onChange={(e) => {
          setSelectedModel(e.target.value);
          setSelectedYear("");
        }}
        className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm"
        required
        disabled={availableModels.length === 0}
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
        disabled={availableYears.length === 0}
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
        GO TO SERVICES
      </button>
    </form>
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
        items: [], // Empty for general inquiries
        total: "£0",
        vehicle: {
          brand: "",
          model: "",
          year: "",
        },
        type: "general-inquiry", // Mark as general inquiry from homepage
      };

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        alert("Request submitted successfully! We will contact you soon.");
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
          <div className="text-[10px] sm:text-xs tracking-[0.2em]">LOOKING FOR A COMPANY TO RETROFIT</div>
          <h1 className="mt-2 text-[clamp(28px,4.5vw,48px)] font-semibold leading-tight max-w-3xl">
            LAND ROVER, JAGUAR?
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-zinc-300">
            We offer a full range of retrofits, upgrades, and feature activations for JLR vehicles. Genuine parts, factory-level quality.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
            <button onClick={(e) => { e.stopPropagation(); setOfferOpen(true); }} className="h-10 px-4 sm:px-5 rounded-full bg-[var(--accent-gold)] text-black text-xs sm:text-sm font-medium inline-flex items-center">GET AN OFFER</button>
            <Link href="/contact" className="h-10 px-4 sm:px-5 rounded-full border border-white/20 text-xs sm:text-sm inline-flex items-center">CONTACTS</Link>
          </div>
          <div className="mt-8 sm:mt-10 text-center text-2xl">↓</div>
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="container-padded mx-auto max-w-6xl py-8 sm:py-10 px-4">
        <h2 className="sr-only">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {["Features activation","Retrofits","Power upgrade","Accessories"].map((t) => (
            <div key={t} className="rounded-xl border border-[var(--border-color)] p-3 text-center text-xs sm:text-sm">
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* VEHICLE SELECTOR */}
      <section className="container-padded mx-auto max-w-6xl py-8 sm:py-10 px-4">
        <VehicleSelector />
      </section>

      {/* GALLERY STRIP */}
      <section className="container-padded mx-auto max-w-[100vw] overflow-hidden py-4 sm:py-6 px-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="min-w-[200px] sm:min-w-[260px] aspect-video rounded-xl bg-silver/20 flex-shrink-0" />
          ))}
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="container-padded mx-auto max-w-6xl py-8 sm:py-12 px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <article key={i} className="rounded-2xl border border-[var(--border-color)] p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium">Why choose LR-CHIP</h3>
              <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Factory-grade diagnostics, coding, and genuine part installation.</p>
              <button className="mt-4 text-xs sm:text-sm underline">More</button>
            </article>
          ))}
        </div>
      </section>

      {/* CONTACT FORM SHORT */}
      <section className="container-padded mx-auto max-w-6xl py-8 sm:py-12 px-4">
        <div className="rounded-2xl border border-[var(--border-color)] p-4 sm:p-6 grid md:grid-cols-[1fr,360px] gap-4 sm:gap-6">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold">LR-CHIP RETROFITTING SPECIALIST</h3>
            <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">Leave a request and we will get back to you with options and pricing for your specific VIN.</p>
          </div>
          <form onSubmit={handleOfferSubmit} className="grid gap-3">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-xs sm:text-sm"
              placeholder="Your name"
              required
            />
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-xs sm:text-sm"
              placeholder="Vehicle VIN number"
              required
            />
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-xs sm:text-sm"
              placeholder="Mobile number or email address"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-full bg-[var(--accent-gold)] text-black text-xs sm:text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "GET AN OFFER"}
            </button>
          </form>
        </div>
      </section>

      {/* MORE GALLERIES */}
      <section className="container-padded mx-auto max-w-6xl py-8 sm:py-10 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-silver/20" />
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="container-padded mx-auto max-w-6xl py-8 sm:py-12 px-4">
        <h3 className="text-lg sm:text-xl font-semibold">Our team</h3>
        <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-silver/20" />
              <div className="mt-2 text-xs sm:text-sm">Specialist</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-padded mx-auto max-w-6xl py-8 sm:py-12 px-4">
        <div className="flex items-center justify-center">
          <button onClick={(e) => { e.stopPropagation(); setOfferOpen(true); }} className="h-10 sm:h-12 px-6 sm:px-8 rounded-full bg-[var(--accent-gold)] text-black text-sm sm:text-base font-medium">GET AN OFFER</button>
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
        <div className="fixed bottom-0 inset-x-0 z-50 bg-[#3b3b3b] text-white/90">
          <div className="container-padded mx-auto max-w-6xl py-3 px-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="text-[10px] sm:text-xs flex-1">This website stores cookies on your computer to provide more personalized services to you.</div>
            <button className="w-full sm:w-auto sm:ml-auto h-8 px-4 rounded bg-[#ffd000] text-black text-xs font-medium" onClick={() => setCookieAccepted(true)}>Accept</button>
          </div>
        </div>
      )}
    </div>
  );
}
