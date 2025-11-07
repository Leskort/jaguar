import ServicesPageClient from '@/components/ServicesPageClient';
import NoServicesFound from '@/components/NoServicesFound';
import { getStorageData } from '@/lib/storage';

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

// Normalize URL parameters - decode, trim, lowercase, replace spaces with hyphens
function normalizeUrlParam(param: string): string {
  if (!param) return param;
  try {
    // Decode URL encoding (e.g., %20 -> space)
    const decoded = decodeURIComponent(param);
    // Normalize: trim, lowercase, replace spaces with hyphens
    return decoded.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  } catch {
    // If decoding fails, just normalize
    return param.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
}

export default async function ServiceCatalogPage({ params }: { params: Promise<{ brand: string, model: string, year: string }> }) {
  const rawParams = await params;
  
  // Normalize URL parameters to match stored data format
  const brand = normalizeUrlParam(rawParams.brand);
  const model = normalizeUrlParam(rawParams.model);
  const year = rawParams.year.trim(); // Year can contain hyphens, so we keep it as is but trim
  
  const servicesData = await getServices();
  
  // Try to find services with normalized keys first
  let brandData = servicesData[brand];
  let modelData = brandData?.[model];
  let allCategoriesData = (modelData?.[year] as Record<string, ServiceOption[]>) ?? {};
  
  // If not found, try to find with alternative normalizations or original keys
  if (!allCategoriesData || Object.keys(allCategoriesData).length === 0) {
    // Try to find by iterating through all brands and models
    for (const serviceBrand in servicesData) {
      if (!serviceBrand || typeof servicesData[serviceBrand] !== 'object') continue;
      
      // Normalize service brand for comparison
      const normalizedServiceBrand = normalizeUrlParam(serviceBrand);
      if (normalizedServiceBrand !== brand && serviceBrand.toLowerCase() !== brand) {
        continue;
      }
      
      for (const serviceModel in servicesData[serviceBrand]) {
        if (!serviceModel || typeof servicesData[serviceBrand][serviceModel] !== 'object') continue;
        
        // Normalize service model for comparison
        const normalizedServiceModel = normalizeUrlParam(serviceModel);
        if (normalizedServiceModel !== model && serviceModel.toLowerCase() !== model) {
          continue;
        }
        
        // Check all years for this model (year might be stored differently)
        const modelYearData = servicesData[serviceBrand][serviceModel];
        if (modelYearData && typeof modelYearData === 'object') {
          // Try exact year match first
          let yearData = modelYearData[year];
          
          // If not found, try trimmed year
          if (!yearData) {
            yearData = modelYearData[year.trim()];
          }
          
          // If still not found, try to find any year that contains the requested year
          if (!yearData) {
            for (const storedYear in modelYearData) {
              if (storedYear.includes(year) || year.includes(storedYear)) {
                yearData = modelYearData[storedYear];
                break;
              }
            }
          }
          
          if (yearData && typeof yearData === 'object') {
            brandData = servicesData[serviceBrand];
            modelData = servicesData[serviceBrand][serviceModel];
            allCategoriesData = yearData as Record<string, ServiceOption[]>;
            break;
          }
        }
      }
      if (allCategoriesData && Object.keys(allCategoriesData).length > 0) {
        break;
      }
    }
  }
  
  // Filter out empty categories (only keep categories with at least one service)
  const categoriesData: Record<string, ServiceOption[]> = {};
  for (const [catKey, services] of Object.entries(allCategoriesData)) {
    if (Array.isArray(services) && services.length > 0) {
      categoriesData[catKey] = services;
    }
  }
  
  if (!categoriesData || Object.keys(categoriesData).length === 0) {
    return <NoServicesFound />;
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


