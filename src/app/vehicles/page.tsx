"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const VehicleCard = ({ model, brand }: { model: typeof landRoverModels[0]; brand: "land-rover" | "jaguar" }) => {
  const [imgError, setImgError] = useState(false);
  
  // Extract year range from title (handles spaces and en-dash: "2023+", "2014 - 2022", "2015 +", "2019–2020")
  const yearMatch = model.title.match(/(\d{4}\s*(?:\+|[\-\u2013]\s*\d{4})?)/);
  const yearRange = yearMatch ? yearMatch[1] : "";

  // Extract model name without year
  const modelName = model.title.replace(/\s*\d{4}\s*(?:\+|[\-\u2013]\s*\d{4})?\s*$/, "").trim();

  return (
    <Link
      href={`/vehicles/${brand}/${model.slug}/features-activation`}
      className="group block rounded-2xl border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      <div className="relative h-48 bg-silver/20 overflow-hidden">
        {!imgError ? (
          <Image
            src={model.image}
            alt={model.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs">
            {model.title}
          </div>
        )}
        {/* Arrow with year on hover */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col items-center">
            <div className="text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
              {yearRange}
            </div>
            <div className="text-white text-xl mt-1">↓</div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="text-sm font-medium group-hover:text-[var(--accent-gold)] transition-colors duration-200">
          {modelName}
        </div>
        <div className="mt-1 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
          {yearRange}
        </div>
      </div>
    </Link>
  );
};

const landRoverModels = [
  { title: "New Range Rover Sport 2023+", slug: "new-range-rover-sport-2023-plus", image: "/vehicles/land-rover/new-range-rover-sport-2023plus.jpg" },
  { title: "New Range Rover 2022+", slug: "new-range-rover-2022-plus", image: "/vehicles/land-rover/new-range-rover-2022plus.jpg" },
  { title: "New Defender 2020+", slug: "new-defender-2020-plus", image: "/vehicles/land-rover/new-defender-2020plus.jpg" },
  { title: "Range Rover Velar 2017-2020", slug: "range-rover-velar-2017-plus", image: "/vehicles/land-rover/range-rover-velar-2017-2020.jpg" },
  { title: "Discovery Sport 2015-2019", slug: "discovery-sport-2015-plus", image: "/vehicles/land-rover/discovery-sport-2015-2019.jpg" },
  { title: "Discovery 5 2017-2020", slug: "discovery-5-2017-plus", image: "/vehicles/land-rover/discovery-5-2017-2020.jpg" },
  { title: "New Range Rover Evoque 2019–2020", slug: "range-rover-evoque-2019-plus", image: "/vehicles/land-rover/new-range-rover-evoque-2019–2020.jpg" },
  { title: "Range Rover Sport 2014-2016", slug: "range-rover-sport-2014-2022", image: "/vehicles/land-rover/range-rover-sport-2014-2016.jpg" },
  { title: "Range Rover 2013-2021", slug: "range-rover-2013-2021", image: "/vehicles/land-rover/range-rover-2013.jpg" },
  { title: "Range Rover Evoque 2012-2015", slug: "range-rover-evoque-2012-2015", image: "/vehicles/land-rover/range-rover-evoque-2012-2015.jpg" },
  { title: "Discovery 4 2010-2016", slug: "discovery-4-2010-2016", image: "/vehicles/land-rover/discovery-4-2010.jpg" },
  { title: "Range Rover Sport 2010-2013", slug: "range-rover-sport-2010-2013", image: "/vehicles/land-rover/range-rover-sport-2010.jpg" },
  { title: "Range Rover 2010-2012", slug: "range-rover-2010-2012", image: "/vehicles/land-rover/range-rover-2010.jpg" },
  { title: "Defender 2007-2016", slug: "defender-2007-2016", image: "/vehicles/land-rover/defender-2007.jpg" },
  { title: "Freelander 2 2006-2014", slug: "freelander-2-2006-2014", image: "/vehicles/land-rover/freelander-2-2006.jpg" },
];

const jaguarModels = [
  { title: "E-Pace 2017-2020", slug: "e-pace-2017-plus", image: "/vehicles/jaguar/e-pace-2017-2020.jpg" },
  { title: "F-Pace 2016-2020", slug: "f-pace-2016-plus", image: "/vehicles/jaguar/f-pace-2016-2020.jpg" },
  { title: "F-Type 2014-2020", slug: "f-type-2014-plus", image: "/vehicles/jaguar/f-type-2014-2020.jpg" },
  { title: "I-Pace 2018-2020", slug: "i-pace-2018-plus", image: "/vehicles/jaguar/i-pace-2018-2020.jpg" },
  { title: "XE 2015-2020", slug: "xe-2015-plus", image: "/vehicles/jaguar/xe-2015-2020.jpg" },
  { title: "XF 2009–2015", slug: "xf-2012-2015", image: "/vehicles/jaguar/xf-2009–2015.jpg" },
  { title: "XF 2016-2020", slug: "xf-2016-plus", image: "/vehicles/jaguar/xf-2016-2020.jpg" },
  { title: "XJ 2010–2019", slug: "xj-2010-2019", image: "/vehicles/jaguar/xj-2010–2019.jpg" },
];

export default function VehiclesPage() {
  const [selectedBrand, setSelectedBrand] = useState<"land-rover" | "jaguar">("land-rover");

  const models = selectedBrand === "land-rover" ? landRoverModels : jaguarModels;
  const brandName = selectedBrand === "land-rover" ? "LAND ROVER" : "JAGUAR";

  return (
    <section className="container-padded mx-auto max-w-6xl py-16">
      <div className="flex items-center gap-8">
        <h1 className="text-4xl font-semibold tracking-tight">Vehicles</h1>
      </div>

      <div className="mt-10">
        <div className="flex gap-6 text-sm">
          <button
            onClick={() => setSelectedBrand("land-rover")}
            className={`px-4 py-2 rounded-full border transition-colors ${
              selectedBrand === "land-rover"
                ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]"
                : "border-[var(--border-color)] hover:bg-white/5"
            }`}
          >
            LAND ROVER
          </button>
          <button
            onClick={() => setSelectedBrand("jaguar")}
            className={`px-4 py-2 rounded-full border transition-colors ${
              selectedBrand === "jaguar"
                ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]"
                : "border-[var(--border-color)] hover:bg-white/5"
            }`}
          >
            JAGUAR
          </button>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {models.map((m) => (
            <VehicleCard key={m.slug} model={m} brand={selectedBrand} />
          ))}
        </div>
      </div>
    </section>
  );
}
