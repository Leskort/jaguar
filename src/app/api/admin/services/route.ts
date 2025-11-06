import { NextResponse } from "next/server";
import { getStorageData, saveStorageData } from "@/lib/storage";

const STORAGE_KEY = "services";
const FALLBACK_PATH = "src/data/services.json";

// Helper to check if we're on Netlify
function isNetlifyEnvironment() {
  return !!(
    process.env.NETLIFY === "true" ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

async function getServices() {
  try {
    const data = await getStorageData(STORAGE_KEY, FALLBACK_PATH);
    // Only return if it's a valid object with data, otherwise return empty object
    if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
      return data;
    }
    return {};
  } catch {
    // Return empty object if file doesn't exist or is invalid
    return {};
  }
}

export async function GET() {
  const services = await getServices();
  
  // Log a sample service to verify descriptionEn and descriptionRu are present
  if (services && typeof services === 'object') {
    for (const brand in services) {
      if (services[brand] && typeof services[brand] === 'object') {
        for (const model in services[brand]) {
          if (services[brand][model] && typeof services[brand][model] === 'object') {
            for (const year in services[brand][model]) {
              if (services[brand][model][year] && typeof services[brand][model][year] === 'object') {
                for (const category in services[brand][model][year]) {
                  const serviceArray = services[brand][model][year][category];
                  if (Array.isArray(serviceArray) && serviceArray.length > 0) {
                    const sampleService = serviceArray[0];
                    console.log("[GET /api/admin/services] Sample service:", JSON.stringify(sampleService, null, 2));
                    console.log("[GET /api/admin/services] Sample service description fields:", {
                      description: sampleService?.description,
                      descriptionEn: sampleService?.descriptionEn,
                      descriptionRu: sampleService?.descriptionRu
                    });
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  return NextResponse.json(services);
}

// Normalize brand and model - lowercase, trim, replace spaces with hyphens
function normalizeBrandModel(value: string): string {
  if (!value) return value;
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function POST(request: Request) {
  try {
    const rawRequest = await request.json();
    // Normalize brand and model to ensure consistent format
    const brand = normalizeBrandModel(rawRequest.brand || '');
    const model = normalizeBrandModel(rawRequest.model || '');
    const year = rawRequest.year;
    const category = rawRequest.category;
    const service = rawRequest.service;
    
    console.log("[POST /api/admin/services] Request received:", { brand, model, year, category, serviceTitle: service?.title });
    console.log("[POST /api/admin/services] Service data:", JSON.stringify(service, null, 2));
    console.log("[POST /api/admin/services] Description fields:", { 
      description: service?.description, 
      descriptionEn: service?.descriptionEn, 
      descriptionRu: service?.descriptionRu 
    });
    console.log("[POST /api/admin/services] Environment check:", {
      isNetlify: isNetlifyEnvironment(),
      NETLIFY: process.env.NETLIFY,
      AWS_LAMBDA: process.env.AWS_LAMBDA_FUNCTION_NAME
    });
    
    const services = await getServices();
    console.log("[POST /api/admin/services] Current services loaded, adding new service...");
    
    // Ensure structure exists
    if (!services[brand]) services[brand] = {};
    if (!services[brand][model]) services[brand][model] = {};
    if (!services[brand][model][year]) services[brand][model][year] = {};
    if (!services[brand][model][year][category]) services[brand][model][year][category] = [];
    
    // IMPORTANT: Ensure all fields are preserved when adding service
    const serviceToAdd = {
      title: service.title,
      image: service.image,
      price: service.price,
      requirements: service.requirements,
      description: service.description,
      descriptionEn: service.descriptionEn,
      descriptionRu: service.descriptionRu,
      status: service.status,
    };
    
    services[brand][model][year][category].push(serviceToAdd);
    console.log(`[POST /api/admin/services] Service added to array. New length: ${services[brand][model][year][category].length}`);
    console.log(`[POST /api/admin/services] Added service with descriptions:`, {
      description: serviceToAdd.description,
      descriptionEn: serviceToAdd.descriptionEn,
      descriptionRu: serviceToAdd.descriptionRu
    });
    console.log("[POST /api/admin/services] Saving to storage...");
    
    try {
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      console.log("[POST /api/admin/services] ✅ Service saved successfully to storage");
      return NextResponse.json({ success: true });
    } catch (saveError) {
      console.error("[POST /api/admin/services] ❌ Error saving to storage:", saveError);
      const saveErrorMessage = saveError instanceof Error ? saveError.message : String(saveError);
      const saveErrorStack = saveError instanceof Error ? saveError.stack : undefined;
      console.error("[POST /api/admin/services] Error stack:", saveErrorStack);
      return NextResponse.json({ 
        error: "Failed to save to storage",
        message: saveErrorMessage,
        stack: process.env.NODE_ENV === "development" ? saveErrorStack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[POST /api/admin/services] ❌ Error in handler:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[POST /api/admin/services] Error message:", errorMessage);
    console.error("[POST /api/admin/services] Error stack:", errorStack);
    return NextResponse.json({ 
      error: "Failed to save",
      message: errorMessage,
      details: process.env.NODE_ENV === "development" ? { errorMessage, errorStack } : undefined
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const requestBody = await request.json();
    // Normalize brand and model to ensure consistent format
    const brand = normalizeBrandModel(requestBody.brand || '');
    const model = normalizeBrandModel(requestBody.model || '');
    const year = requestBody.year;
    const category = requestBody.category;
    const index = requestBody.index;
    const service = requestBody.service;
    
    console.log("=== PUT REQUEST ===");
    console.log("Request body:", JSON.stringify(requestBody, null, 2));
    console.log("Extracted values:", { brand, model, year, category, index, serviceTitle: service?.title });
    console.log("Service data:", JSON.stringify(service, null, 2));
    console.log("Description fields:", { 
      description: service?.description, 
      descriptionEn: service?.descriptionEn, 
      descriptionRu: service?.descriptionRu 
    });
    console.log("Index type:", typeof index, "Index value:", index);
    
    // Validate input
    if (typeof index !== 'number' || index < 0 || !Number.isInteger(index)) {
      console.error("Invalid index:", { index, type: typeof index });
      return NextResponse.json({ 
        error: "Invalid index",
        message: `Index must be a non-negative integer, got: ${index} (type: ${typeof index})`
      }, { status: 400 });
    }
    
    console.log("Loading services from storage...");
    const services = await getServices();
    
    // DEBUG: Check for duplicate entries with empty model/year
    if (services[brand]) {
      const emptyModelKey = '';
      if (services[brand][emptyModelKey] && services[brand][emptyModelKey][year] && services[brand][emptyModelKey][year][category]) {
        const emptyKeyArray = services[brand][emptyModelKey][year][category];
        console.log(`[PUT] WARNING: Found ${emptyKeyArray.length} service(s) with empty model key in [${brand}][${emptyModelKey}][${year}][${category}]`);
        emptyKeyArray.forEach((svc: any, idx: number) => {
          console.log(`[PUT] Empty key service [${idx}]:`, {
            title: svc?.title,
            hasDescriptionEn: !!svc?.descriptionEn,
            hasDescriptionRu: !!svc?.descriptionRu,
            descriptionRu: svc?.descriptionRu
          });
        });
      }
    }
    
    console.log("Services loaded:", {
      hasData: !!services && typeof services === 'object',
      brands: Object.keys(services || {}),
      hasBrand: !!services[brand],
      hasModel: !!services[brand]?.[model],
      hasYear: !!services[brand]?.[model]?.[year],
      hasCategory: !!services[brand]?.[model]?.[year]?.[category],
      categoryLength: services[brand]?.[model]?.[year]?.[category]?.length,
      requestedIndex: index,
      // Check what's at the requested index
      serviceAtIndex: services[brand]?.[model]?.[year]?.[category]?.[index] ? {
        title: services[brand][model][year][category][index].title,
        hasDescriptionEn: !!services[brand][model][year][category][index].descriptionEn,
        hasDescriptionRu: !!services[brand][model][year][category][index].descriptionRu
      } : null
    });
    
    // Ensure structure exists
    if (!services[brand]) {
      console.log(`Creating brand structure: ${brand}`);
      services[brand] = {};
    }
    if (!services[brand][model]) {
      console.log(`Creating model structure: ${model}`);
      services[brand][model] = {};
    }
    if (!services[brand][model][year]) {
      console.log(`Creating year structure: ${year}`);
      services[brand][model][year] = {};
    }
    if (!services[brand][model][year][category]) {
      console.log(`Creating category structure: ${category}`);
      services[brand][model][year][category] = [];
    }
    
    const categoryArray = services[brand][model][year][category];
    console.log("Category array:", {
      length: categoryArray.length,
      items: categoryArray.map((item: any, i: number) => ({ index: i, title: item?.title }))
    });
    
    // Check if index is valid
    if (categoryArray.length === 0) {
      console.log("Category array is empty, adding as new service instead of updating");
      // If array is empty, add as new service instead of updating
      // IMPORTANT: Ensure all fields are preserved when adding service
      const serviceToAdd = {
        title: service.title,
        image: service.image,
        price: service.price,
        requirements: service.requirements,
        description: service.description,
        descriptionEn: service.descriptionEn,
        descriptionRu: service.descriptionRu,
        status: service.status,
      };
      categoryArray.push(serviceToAdd);
      console.log("Service added as new (array was empty)");
      console.log("Added service with descriptions:", {
        description: serviceToAdd.description,
        descriptionEn: serviceToAdd.descriptionEn,
        descriptionRu: serviceToAdd.descriptionRu
      });
    } else if (index >= categoryArray.length) {
      console.error("Index out of bounds:", {
        index,
        arrayLength: categoryArray.length,
        availableIndexes: Array.from({ length: categoryArray.length }, (_, i) => i)
      });
      return NextResponse.json({ 
        error: "Index out of bounds",
        message: `Index ${index} is out of bounds. Array has ${categoryArray.length} items. Available indexes: 0-${categoryArray.length - 1}`
      }, { status: 400 });
    } else {
      // Update the service
      console.log(`Updating service at index ${index}...`);
      const oldService = categoryArray[index];
      console.log("Old service:", JSON.stringify(oldService, null, 2));
      console.log("Old service descriptions:", { 
        description: oldService?.description, 
        descriptionEn: oldService?.descriptionEn, 
        descriptionRu: oldService?.descriptionRu 
      });
      
      // IMPORTANT: Replace the entire service object to preserve all fields including descriptionEn and descriptionRu
      // Don't use spread operator as it might lose properties
      categoryArray[index] = {
        title: service.title,
        image: service.image,
        price: service.price,
        requirements: service.requirements,
        description: service.description,
        descriptionEn: service.descriptionEn,
        descriptionRu: service.descriptionRu,
        status: service.status,
      };
      
      console.log("New service after update:", JSON.stringify(categoryArray[index], null, 2));
      console.log("New service descriptions:", { 
        description: categoryArray[index]?.description, 
        descriptionEn: categoryArray[index]?.descriptionEn, 
        descriptionRu: categoryArray[index]?.descriptionRu 
      });
      
      // CLEANUP: If there's a duplicate entry with empty model/year keys, merge the descriptionRu/descriptionEn from it
      // and then remove the duplicate
      if (services[brand]) {
        const emptyModelKey = '';
        if (services[brand][emptyModelKey] && services[brand][emptyModelKey][year] && services[brand][emptyModelKey][year][category]) {
          const emptyKeyArray = services[brand][emptyModelKey][year][category];
          // Find service with same title
          const duplicateIndex = emptyKeyArray.findIndex((svc: any) => svc?.title === service.title);
          if (duplicateIndex >= 0) {
            const duplicate = emptyKeyArray[duplicateIndex];
            console.log(`[PUT] Found duplicate service with empty keys, merging descriptions...`);
            console.log(`[PUT] Duplicate has descriptionEn: ${!!duplicate?.descriptionEn}, descriptionRu: ${!!duplicate?.descriptionRu}`);
            
            // If the current service doesn't have descriptionEn/descriptionRu but duplicate does, use duplicate's values
            if (!categoryArray[index].descriptionEn && duplicate?.descriptionEn) {
              categoryArray[index].descriptionEn = duplicate.descriptionEn;
              console.log(`[PUT] Merged descriptionEn from duplicate`);
            }
            if (!categoryArray[index].descriptionRu && duplicate?.descriptionRu) {
              categoryArray[index].descriptionRu = duplicate.descriptionRu;
              console.log(`[PUT] Merged descriptionRu from duplicate: "${duplicate.descriptionRu}"`);
            }
            
            // Remove the duplicate entry
            emptyKeyArray.splice(duplicateIndex, 1);
            console.log(`[PUT] Removed duplicate entry with empty keys`);
            
            // If the array is now empty, clean up the structure
            if (emptyKeyArray.length === 0) {
              delete services[brand][emptyModelKey][year][category];
              if (Object.keys(services[brand][emptyModelKey][year]).length === 0) {
                delete services[brand][emptyModelKey][year];
                if (Object.keys(services[brand][emptyModelKey]).length === 0) {
                  delete services[brand][emptyModelKey];
                }
              }
              console.log(`[PUT] Cleaned up empty structure`);
            }
          }
        }
      }
    }
    
    console.log("Service updated in memory, saving to storage...");
    
    // Verify the service was saved correctly before writing to storage
    const savedServiceInMemory = services[brand]?.[model]?.[year]?.[category]?.[index];
    if (savedServiceInMemory) {
      console.log("Service in memory before save:", JSON.stringify(savedServiceInMemory, null, 2));
      console.log("Description fields in memory:", { 
        description: savedServiceInMemory.description, 
        descriptionEn: savedServiceInMemory.descriptionEn, 
        descriptionRu: savedServiceInMemory.descriptionRu 
      });
    }
    
    try {
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      console.log("✅ Service saved successfully to storage");
      
      // Verify the service was saved correctly after writing to storage
      const reloadedServices = await getServices();
      const reloadedService = reloadedServices[brand]?.[model]?.[year]?.[category]?.[index];
      if (reloadedService) {
        console.log("Service after reload from storage:", JSON.stringify(reloadedService, null, 2));
        console.log("Description fields after reload:", { 
          description: reloadedService.description, 
          descriptionEn: reloadedService.descriptionEn, 
          descriptionRu: reloadedService.descriptionRu 
        });
      }
      
      return NextResponse.json({ success: true });
    } catch (saveError) {
      console.error("❌ Error saving to storage:", saveError);
      const saveErrorMessage = saveError instanceof Error ? saveError.message : String(saveError);
      const saveErrorStack = saveError instanceof Error ? saveError.stack : undefined;
      console.error("Save error stack:", saveErrorStack);
      return NextResponse.json({ 
        error: "Failed to save to storage",
        message: saveErrorMessage,
        stack: process.env.NODE_ENV === "development" ? saveErrorStack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error in PUT handler:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", errorMessage);
    console.error("Error stack:", errorStack);
    return NextResponse.json({ 
      error: "Failed to update",
      message: errorMessage,
      details: {
        errorMessage,
        errorStack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        errorType: error?.constructor?.name
      }
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const rawRequest = await request.json();
    // Normalize brand and model to ensure consistent format
    const brand = normalizeBrandModel(rawRequest.brand || '');
    const model = normalizeBrandModel(rawRequest.model || '');
    const year = rawRequest.year;
    const category = rawRequest.category;
    const index = rawRequest.index;
    const services = await getServices();
    
    console.log("[DELETE /api/admin/services] Attempting to delete:", { brand, model, year, category, index });
    
    // Try to find the service with normalized values first
    let foundBrand = brand;
    let foundModel = model;
    
    if (services[brand]?.[model]?.[year]?.[category]?.[index]) {
      console.log("[DELETE /api/admin/services] Found service with normalized values");
      services[brand][model][year][category].splice(index, 1);
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      return NextResponse.json({ success: true });
    }
    
    // If not found, try to find with original (non-normalized) values
    const originalBrand = rawRequest.brand?.trim().toLowerCase() || '';
    const originalModel = rawRequest.model?.trim().toLowerCase() || '';
    
    if (services[originalBrand]?.[originalModel]?.[year]?.[category]?.[index]) {
      console.log("[DELETE /api/admin/services] Found service with original values:", { originalBrand, originalModel });
      services[originalBrand][originalModel][year][category].splice(index, 1);
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      return NextResponse.json({ success: true });
    }
    
    // If still not found, try to search through all brands and models to find matching service
    console.log("[DELETE /api/admin/services] Service not found with normalized or original values, searching all brands/models...");
    
    let serviceFound = false;
    for (const serviceBrand in services) {
      if (serviceBrand && typeof services[serviceBrand] === 'object') {
        // Check if brand matches (normalized or original)
        const normalizedServiceBrand = normalizeBrandModel(serviceBrand);
        if (normalizedServiceBrand !== brand && serviceBrand.toLowerCase() !== originalBrand) {
          continue;
        }
        
        for (const serviceModel in services[serviceBrand]) {
          if (services[serviceBrand][serviceModel] && typeof services[serviceBrand][serviceModel] === 'object') {
            // Check if model matches (normalized or original)
            const normalizedServiceModel = normalizeBrandModel(serviceModel);
            if (normalizedServiceModel !== model && serviceModel.toLowerCase() !== originalModel) {
              continue;
            }
            
            if (services[serviceBrand][serviceModel][year]?.[category]?.[index]) {
              console.log("[DELETE /api/admin/services] Found service with alternate format:", { serviceBrand, serviceModel });
              services[serviceBrand][serviceModel][year][category].splice(index, 1);
              await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
              serviceFound = true;
              break;
            }
          }
        }
        if (serviceFound) break;
      }
    }
    
    if (serviceFound) {
      return NextResponse.json({ success: true });
    }
    
    console.error("[DELETE /api/admin/services] Service not found after all attempts:", {
      requested: { brand, model, year, category, index },
      availableBrands: Object.keys(services || {}),
    });
    
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  } catch (error) {
    console.error("Error deleting service:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: "Failed to delete",
      message: errorMessage
    }, { status: 500 });
  }
}

