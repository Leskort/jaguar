import ServicesPageClient from '@/components/ServicesPageClient';
import { readFile } from 'fs/promises';
import { join } from 'path';

type ServiceOption = {
  title: string;
  image: string;
  price: string;
  requirements: string;
  description: string;
  status?: "in-stock" | "unavailable" | "coming-soon";
};

async function getServices() {
  const DATA_FILE = join(process.cwd(), "src/data/services.json");
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // Fallback to static data if file doesn't exist
    const { servicesData } = await import('@/data/services');
    return servicesData;
  }
}

export default async function ServiceCatalogPage({ params }: { params: Promise<{ brand: string, model: string, year: string }> }) {
  const { brand, model, year } = await params;
  
  const servicesData = await getServices();
  const brandData = servicesData[brand];
  const modelData = brandData?.[model];
  const categoriesData = (modelData?.[year] as Record<string, ServiceOption[]>) ?? {};
  
  if (!categoriesData || Object.keys(categoriesData).length === 0) {
    return (
      <div className="container-padded mx-auto max-w-6xl py-24 text-lg text-center">
        <p>No options found for your vehicle.</p>
        <div className="text-sm text-zinc-500 mt-4 space-y-1">
          <p>Received: Brand={brand}, Model={model}, Year={year}</p>
          <p>Please add services for this vehicle in the admin panel.</p>
        </div>
      </div>
    );
  }
  return (
    <ServicesPageClient
      brand={brand}
      model={model}
      year={year}
      categoriesData={categoriesData as Record<string, ServiceOption[]>}
    />
  );
}


