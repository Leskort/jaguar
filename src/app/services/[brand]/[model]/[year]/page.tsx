import ServicesPageClient from '@/components/ServicesPageClient';
import { getStorageData } from '@/lib/storage';

type ServiceOption = {
  title: string;
  image: string;
  price: string;
  requirements: string;
  description: string;
  status?: "in-stock" | "unavailable" | "coming-soon";
};

async function getServices() {
  const STORAGE_KEY = "services";
  const FALLBACK_PATH = "src/data/services.json";
  
  try {
    const data = await getStorageData(STORAGE_KEY, FALLBACK_PATH);
    // Only return if it's a valid object with data, otherwise return empty object
    if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
      return data;
    }
    return {};
  } catch (error) {
    console.error("Failed to load services:", error);
    // Return empty object if loading fails
    return {};
  }
}

export default async function ServiceCatalogPage({ params }: { params: Promise<{ brand: string, model: string, year: string }> }) {
  const { brand, model, year } = await params;
  
  const servicesData = await getServices();
  const brandData = servicesData[brand];
  const modelData = brandData?.[model];
  const allCategoriesData = (modelData?.[year] as Record<string, ServiceOption[]>) ?? {};
  
  // Filter out empty categories (only keep categories with at least one service)
  const categoriesData: Record<string, ServiceOption[]> = {};
  for (const [catKey, services] of Object.entries(allCategoriesData)) {
    if (Array.isArray(services) && services.length > 0) {
      categoriesData[catKey] = services;
    }
  }
  
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


