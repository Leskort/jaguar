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
    
    services[brand][model][year][category].push(service);
    console.log(`[POST /api/admin/services] Service added to array. New length: ${services[brand][model][year][category].length}`);
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
    console.log("Services loaded:", {
      hasData: !!services && typeof services === 'object',
      brands: Object.keys(services || {}),
      hasBrand: !!services[brand],
      hasModel: !!services[brand]?.[model],
      hasYear: !!services[brand]?.[model]?.[year],
      hasCategory: !!services[brand]?.[model]?.[year]?.[category],
      categoryLength: services[brand]?.[model]?.[year]?.[category]?.length,
      requestedIndex: index
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
      categoryArray.push(service);
      console.log("Service added as new (array was empty)");
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
      console.log("Old service:", oldService?.title);
      categoryArray[index] = service;
      console.log("New service:", service.title);
    }
    
    console.log("Service updated in memory, saving to storage...");
    
    try {
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      console.log("✅ Service saved successfully to storage");
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
    
    if (services[brand]?.[model]?.[year]?.[category]?.[index]) {
      services[brand][model][year][category].splice(index, 1);
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      return NextResponse.json({ success: true });
    }
    
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

