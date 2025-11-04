import { servicesData } from '@/data/services';
import Image from 'next/image';

export default function ServiceCatalogPage({ params }: { params: { brand: string, model: string, year: string } }) {
  const { brand, model, year } = params;
  
  // Проверяем что параметры существуют
  if (!brand || !model || !year) {
    return (
      <div className="container-padded mx-auto max-w-6xl py-24 text-lg text-center">
        Invalid vehicle parameters.
      </div>
    );
  }
  
  // Нормализуем ключи для поиска в servicesData
  const normalizedBrand = brand.toLowerCase();
  const normalizedModel = model.toLowerCase();
  
  // Ищем данные с нормализованными ключами
  const opts = (servicesData[normalizedBrand]?.[normalizedModel]?.[year]) ?? [];
  
  if (!opts.length) {
    return (
      <div className="container-padded mx-auto max-w-6xl py-24 text-lg text-center">
        No options found for your vehicle.
        {/* Для отладки - покажем какие ключи ищем */}
        <div className="mt-4 text-sm text-gray-500">
          Looking for: {normalizedBrand} / {normalizedModel} / {year}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-padded mx-auto max-w-6xl py-12">
      <h1 className="text-2xl font-semibold mb-8 uppercase tracking-tight">
        Options for {brand.replace(/-/g, ' ')} / {model.replace(/-/g, ' ')} {year}
      </h1>

      {/* Каталог карточек */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {opts.map(opt => (
          <div key={opt.title} className="rounded-2xl border border-[var(--border-color)] bg-white overflow-hidden shadow-sm flex flex-col">
            <div className="relative h-40 w-full bg-silver/20">
              <Image src={opt.image} alt={opt.title} fill className="object-cover" unoptimized />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="font-medium mb-2">{opt.title}</div>
              <div className="text-xs text-zinc-500">Requirements: {opt.requirements}</div>
              <div className="text-xl font-semibold mt-2 mb-3">{opt.price}</div>
              <button className="h-8 rounded bg-[var(--accent-gold)] text-black text-sm font-medium mb-2">Add to cart</button>
              <details>
                <summary className="cursor-pointer text-xs mt-auto select-none text-zinc-600 underline">Details</summary>
                <div className="pt-2 text-xs text-zinc-700">{opt.description}</div>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}