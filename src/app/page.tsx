"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const modelYearOptions = [
  {
    brand: "land-rover",
    value: "DEFENDER-l316",
    title: "DEFENDER / L316",
    years: [
      { value: "2007-2016", label: "2007–2016" },
    ]
  },
  {
    brand: "land-rover",
    value: "DISCOVERY4-l319",
    title: "DISCOVERY 4 / L319",
    years: [
      { value: "2010-2016", label: "2010–2016" },
    ]
  },
  {
    brand: "land-rover",
    value: "discovery-5-l462",
    title: "DISCOVERY 5 / L462",
    years: [
      { value: "2017-2020", label: "2017–2020" },
      { value: "2021+", label: "2021+" }
    ]
  },
  {
    brand: "land-rover",
    value: "discovery-sport-l550",
    title: "DISCOVERY SPORT / L550",
    years: [
      { value: "2015-2019", label: "2015-2019" },
      { value: "2020", label: "2020" },
      { value: "2021+", label: "2021+" } 
    ]
  },
  {
    brand: "land-rover",
    value: "freelander-2-l359",
    title: "FREELANDER 2 / L359",
    years: [
      { value: "2006-2014", label: "2006-2014" },
    ]
  },
  {
    brand: "land-rover",
    value: "new-defender-2020-l663",
    title: "NEW DEFENDER 2020 / L663",
    years: [
      { value: "2020+", label: "2020+" },
    ]
  },
  {
    brand: "land-rover",
    value: "new-range-rover-l460",
    title: "NEW RANGE ROVER / L460",
    years: [
      { value: "2022+", label: "2022+" },
    ]
  },
  {
    brand: "land-rover",
    value: "new-range-rover-evoque-l551",
    title: "NEW RANGE ROVER EVOQUE / L551",
    years: [
      { value: "2019-2020", label: "2019-2020" },
      { value: "2021+", label: "2021+" }
    ]
  },
  {
    brand: "land-rover",
    value: "new-range-rover-sport-l461",
    title: "NEW RANGE ROVER SPORT / L461",
    years: [
      { value: "2023+", label: "2023+" },
    ]
  },
  {
    brand: "land-rover",
    value: "range-rover-l322",
    title: "RANGE ROVER / L322",
    years: [
      { value: "2010-2012", label: "2010-2012" },
    ]
  },
  {
    brand: "land-rover",
    value: "range-rover-l405",
    title: "RANGE ROVER / L405",
    years: [
      { value: "2013-2016", label: "2013-2016" },
      { value: "2017", label: "2017" },
      { value: "2018-2021", label: "2018-2021" }
    ]
  },
  {
    brand: "land-rover",
    value: "range-rover-evoque-l538",
    title: "RANGE ROVER EVOQUE / L538",
    years: [
      { value: "2012-2015", label: "2012-2015" },
      { value: "2016-2019", label: "2016-2019" }
    ]
  },
  {
    brand: "land-rover",
    value: "range-rover-sport-l320",
    title: "RANGE ROVER SPORT / L320",
    years: [
      { value: "2010-2013", label: "2010-2013" },
    ]
  },
  {
    brand: "land-rover",
    value: "range-rover-sport-l494",
    title: "RANGE ROVER SPORT / L494",
    years: [
      { value: "2014-2016", label: "2014-2016" },
      { value: "2017", label: "2017" },
      { value: "2018-2022", label: "2018-2022" }
    ]
  },
  {
    brand: "land-rover",
    value: "range-rover-velar-l560",
    title: "RANGE ROVER VELAR / L560",
    years: [
      { value: "2017-2020", label: "2017-2020" },
      { value: "2021+", label: "2021+" }
    ]
  },
  {
    brand: "jaguar",
    value: "e-pace",
    title: "E-PACE",
    years: [
      { value: "2017-2020", label: "2017–2020" },
      { value: "2021+", label: "2021+" }
    ]
  },
  {
    brand: "jaguar",
    value: "f-pace",
    title: "F-PACE",
    years: [
      { value: "2016-2020", label: "2016–2020" },
      { value: "2021+", label: "2021+" }
    ]
  },
  {
    brand: "jaguar",
    value: "e-type",
    title: "E-TYPE",
    years: [
      { value: "2014+", label: "2014+" }
    ]
  },
  {
    brand: "jaguar",
    value: "i-pace",
    title: "I-PACE",
    years: [
      { value: "2018-2020", label: "2018–2020" },
      { value: "2021+", label: "2021+" }
    ]
  },
  {
    brand: "jaguar",
    value: "xe",
    title: "XE",
    years: [
      { value: "2015-2020", label: "2015–2020" },
      { value: "2021+", label: "2021+" }
    ]
  },
  {
    brand: "jaguar",
    value: "xf",
    title: "XF",
    years: [
      { value: "2012-2015", label: "2012–2015" },
      { value: "2016-2020", label: "2016-2020" },
      { value: "2021+", label: "2021+" }
    ]
  },
  {
    brand: "jaguar",
    value: "xj",
    title: "XJ",
    years: [
      { value: "2010-2019", label: "2010–2019" }
    ]
  },
  // ...добавьте остальные модели и года дальше
];

function VehicleYearQuickSelector() {
  const router = useRouter();
  const [brand, setBrand] = useState("land-rover");
  const brandModelList = modelYearOptions.filter(m => m.brand === brand);
  const [model, setModel] = useState(brandModelList[0]?.value ?? "");
  // Найти выбранную модель
  const selectedModelObj = brandModelList.find(m => m.value === model) || brandModelList[0];
  const [year, setYear] = useState(selectedModelObj?.years[0]?.value ?? "");

  // Реагировать на смену бренда
  function handleBrandChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const b = e.target.value;
    setBrand(b);
    const modelsOfBrand = modelYearOptions.filter(m => m.brand === b);
    setModel(modelsOfBrand[0]?.value ?? "");
    setYear(modelsOfBrand[0]?.years[0]?.value ?? "");
  }
  // На смену модели
  function handleModelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const mval = e.target.value;
    setModel(mval);
    const modelObj = brandModelList.find(m => m.value === mval);
    setYear(modelObj?.years[0]?.value ?? "");
  }
  // На смену года
  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setYear(e.target.value);
  }
  return (
    <form
      className="flex flex-col md:flex-row gap-3"
      onSubmit={e => {
        e.preventDefault();
        router.push(`/services/${brand}/${model}/${year}`);
      }}
    >
      <select
        className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm"
        value={brand}
        onChange={handleBrandChange}
      >
        <option value="land-rover">LAND ROVER</option>
        <option value="jaguar">JAGUAR</option>
      </select>
      <select
        className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm"
        value={model}
        onChange={handleModelChange}
      >
        {brandModelList.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.title}</option>
        ))}
      </select>
      <select
        className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm"
        value={year}
        onChange={handleYearChange}
      >
        {selectedModelObj?.years.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button type="submit" className="h-10 px-6 rounded-full bg-[var(--accent-gold)] text-black text-sm font-medium md:ml-auto">
        GO TO SERVICES
      </button>
    </form>
  );
}

export default function Home() {
  const [offerOpen, setOfferOpen] = useState(false);
  const [cookieAccepted, setCookieAccepted] = useState(false);

  const brandOptions = [
    { name: "Land Rover", value: "land-rover" },
    { name: "Jaguar", value: "jaguar" }
  ];
  const categoryOptions = [
    { key: "features-activation", title: "Features activation" },
    { key: "retrofits", title: "Retrofits" },
    { key: "power-upgrade", title: "Power upgrade" },
    { key: "accessories", title: "Accessories" },
  ];

  const modelOptions: Record<string, { title: string; value: string }[]> = {
    "land-rover": [
      { title: "New Range Rover Sport", value: "new-range-rover-sport-2023-plus" },
      { title: "New Range Rover", value: "new-range-rover-2022-plus" },
      { title: "New Defender", value: "new-defender-2020-plus" },
      { title: "Range Rover Velar", value: "range-rover-velar-2017-plus" },
      { title: "Discovery Sport", value: "discovery-sport-2015-plus" },
      { title: "Discovery 5", value: "discovery-5-2017-plus" },
      { title: "New Range Rover Evoque", value: "range-rover-evoque-2019-plus" },
      { title: "Range Rover Sport", value: "range-rover-sport-2014-2022" },
      { title: "Range Rover ", value: "range-rover-2013-2021" },
      { title: "Range Rover Evoque ", value: "range-rover-evoque-2012-2015" },
      { title: "Discovery 4", value: "discovery-4-2010-2016" },
      { title: "Range Rover Sport ", value: "range-rover-sport-2010-2013" },
      { title: "Range Rover ", value: "range-rover-2010-2012" },
      { title: "Defender ", value: "defender-2007-2016" },
      { title: "Freelander 2 ", value: "freelander-2-2006-2014" },
    ],
    "jaguar": [
      { title: "E-Pace", value: "e-pace-2017-plus" },
      { title: "F-Pace", value: "f-pace-2016-plus" },
      { title: "F-Type", value: "f-type-2014-plus" },
      { title: "I-Pace", value: "i-pace-2018-plus" },
      { title: "XE", value: "xe-2015-plus" },
      { title: "XF", value: "xf-2012-2015" },
      { title: "XF", value: "xf-2016-plus" },
      { title: "XJ", value: "xj-2010-2019" },
    ]
  };

  function VehicleQuickSelector() {
    const router = useRouter();
    const [brand, setBrand] = useState("land-rover");
    const [model, setModel] = useState(modelOptions["land-rover"][0].value);
    const [category, setCategory] = useState(categoryOptions[0].key);
    // Обновлять выбранную модель при смене бренда
    function handleBrandChange(e: React.ChangeEvent<HTMLSelectElement>) {
      const b = e.target.value;
      setBrand(b);
      setModel(modelOptions[b][0].value);
    }
    return (
      <form
        className="flex flex-col md:flex-row gap-3"
        onSubmit={e => {
          e.preventDefault();
          router.push(`/vehicles/${brand}/${model}/${category}`);
        }}
      >
        <select
          className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm"
          value={brand}
          onChange={handleBrandChange}
        >
          {brandOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.name}</option>
          ))}
        </select>
        <select
          className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm"
          value={model}
          onChange={e => setModel(e.target.value)}
        >
          {modelOptions[brand].map(opt => (
            <option key={opt.value} value={opt.value}>{opt.title}</option>
          ))}
        </select>
        <select
          className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          {categoryOptions.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.title}</option>
          ))}
        </select>
        <button type="submit" className="h-10 px-6 rounded-full bg-[var(--accent-gold)] text-black text-sm font-medium md:ml-auto">
          GET AN OFFER
        </button>
      </form>
    );
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[80dvh] flex items-center bg-[var(--space-black)] text-white">
        <div className="absolute inset-0 opacity-30 bg-[url('/window.svg')] bg-cover bg-center pointer-events-none" />
        <div className="relative z-10 container-padded mx-auto max-w-6xl py-20">
          <div className="text-xs tracking-[0.2em]">LOOKING FOR A COMPANY TO RETROFIT</div>
          <h1 className="mt-2 text-[clamp(28px,4.5vw,48px)] font-semibold leading-tight max-w-3xl">
            LAND ROVER, JAGUAR?
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-300">
            We offer a full range of retrofits, upgrades, and feature activations for JLR vehicles. Genuine parts, factory-level quality.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button onClick={(e) => { e.stopPropagation(); setOfferOpen(true); }} className="h-10 px-5 rounded-full bg-[var(--accent-gold)] text-black text-sm font-medium inline-flex items-center">GET AN OFFER</button>
            <button className="h-10 px-5 rounded-full border border-white/20 text-sm">CONTACTS</button>
          </div>
          <div className="mt-10 text-center">↓</div>
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="container-padded mx-auto max-w-6xl py-10">
        <h2 className="sr-only">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {["Features activation","Retrofits","Power upgrade","Accessories"].map((t) => (
            <div key={t} className="rounded-xl border border-[var(--border-color)] p-3 text-center text-sm">
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* Форма выбора с редиректом */}
      <section className="container-padded mx-auto max-w-6xl py-6">
        <VehicleYearQuickSelector />
      </section>

      {/* GALLERY STRIP */}
      <section className="container-padded mx-auto max-w-[100vw] overflow-hidden py-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="min-w-[260px] aspect-video rounded-xl bg-silver/20" />
          ))}
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="container-padded mx-auto max-w-6xl py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <article key={i} className="rounded-2xl border border-[var(--border-color)] p-6">
              <h3 className="text-lg font-medium">Why choose LR-CHIP</h3>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Factory-grade diagnostics, coding, and genuine part installation.</p>
              <button className="mt-4 text-sm underline">More</button>
            </article>
          ))}
        </div>
      </section>

      {/* CONTACT FORM SHORT */}
      <section className="container-padded mx-auto max-w-6xl py-12">
        <div className="rounded-2xl border border-[var(--border-color)] p-6 grid md:grid-cols-[1fr,360px] gap-6">
          <div>
            <h3 className="text-xl font-semibold">LR-CHIP RETROFITTING SPECIALIST</h3>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">Leave a request and we will get back to you with options and pricing for your specific VIN.</p>
          </div>
          <form className="grid gap-3">
            <input className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm" placeholder="Your name" />
            <input className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm" placeholder="Vehicle VIN number" />
            <input className="h-10 rounded-full border border-[var(--border-color)] px-4 bg-transparent text-sm" placeholder="Mobile number or email address" />
            <button className="h-10 rounded-full bg-[var(--accent-gold)] text-black text-sm font-medium">GET AN OFFER</button>
          </form>
        </div>
      </section>

      {/* MORE GALLERIES */}
      <section className="container-padded mx-auto max-w-6xl py-10">
        <div className="grid sm:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-silver/20" />
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="container-padded mx-auto max-w-6xl py-12">
        <h3 className="text-xl font-semibold">Our team</h3>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-silver/20" />
              <div className="mt-2 text-sm">Specialist</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-padded mx-auto max-w-6xl py-12">
        <div className="flex items-center justify-center">
          <button onClick={(e) => { e.stopPropagation(); setOfferOpen(true); }} className="h-12 px-8 rounded-full bg-[var(--accent-gold)] text-black font-medium">GET AN OFFER</button>
        </div>
      </section>

      {/* OFFER MODAL */}
      {offerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOfferOpen(false)} />
          <div className="relative z-[61] w-[92vw] max-w-2xl rounded-2xl bg-white text-black p-6" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Close" className="absolute right-4 top-4 text-zinc-500" onClick={() => setOfferOpen(false)}>✕</button>
            <h3 className="text-xl font-semibold">Get an offer</h3>
            <form className="mt-6 grid gap-3">
              <input className="h-12 rounded-md border border-zinc-200 px-4 text-sm" placeholder="YOUR NAME" />
              <input className="h-12 rounded-md border border-zinc-200 px-4 text-sm" placeholder="VEHICLE VIN NUMBER" />
              <input className="h-12 rounded-md border border-zinc-200 px-4 text-sm" placeholder="MOBILE NUMBER OR EMAIL ADDRESS" />
              <button type="button" className="h-12 rounded-md bg-[#ffd000] text-black font-medium">GET AN OFFER</button>
            </form>
          </div>
        </div>
      )}

      {/* COOKIE BAR */}
      {!cookieAccepted && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-[#3b3b3b] text-white/90">
          <div className="container-padded mx-auto max-w-6xl py-3 flex items-center gap-4">
            <div className="text-xs">This website stores cookies on your computer to provide more personalized services to you.</div>
            <button className="ml-auto h-8 px-4 rounded bg-[#ffd000] text-black text-xs" onClick={() => setCookieAccepted(true)}>Accept</button>
          </div>
        </div>
      )}
    </div>
  );
}
