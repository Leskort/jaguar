import { NextResponse } from "next/server";
import { getStorageData, saveStorageData } from "@/lib/storage";

const STORAGE_KEY = "services";
const FALLBACK_PATH = "src/data/services.json";

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

export async function POST(request: Request) {
  try {
    const { brand, model, year, category, service } = await request.json();
    console.log("POST request received:", { brand, model, year, category, serviceTitle: service?.title });
    
    const services = await getServices();
    console.log("Current services loaded, adding new service...");
    
    // Ensure structure exists
    if (!services[brand]) services[brand] = {};
    if (!services[brand][model]) services[brand][model] = {};
    if (!services[brand][model][year]) services[brand][model][year] = {};
    if (!services[brand][model][year][category]) services[brand][model][year][category] = [];
    
    services[brand][model][year][category].push(service);
    console.log(`Service added to array. New length: ${services[brand][model][year][category].length}`);
    console.log("Saving to storage...");
    
    try {
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      console.log("Service saved successfully to storage");
      return NextResponse.json({ success: true });
    } catch (saveError) {
      console.error("Error saving to storage:", saveError);
      const saveErrorMessage = saveError instanceof Error ? saveError.message : String(saveError);
      return NextResponse.json({ 
        error: "Failed to save to storage",
        message: saveErrorMessage
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error saving service:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error message:", errorMessage);
    console.error("Error stack:", errorStack);
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
    const { brand, model, year, category, index, service } = requestBody;
    
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
    if (index >= categoryArray.length) {
      console.error("Index out of bounds:", {
        index,
        arrayLength: categoryArray.length,
        availableIndexes: Array.from({ length: categoryArray.length }, (_, i) => i)
      });
      return NextResponse.json({ 
        error: "Index out of bounds",
        message: `Index ${index} is out of bounds. Array has ${categoryArray.length} items. Available indexes: 0-${categoryArray.length - 1}`
      }, { status: 400 });
    }
    
    // Update the service
    console.log(`Updating service at index ${index}...`);
    const oldService = categoryArray[index];
    console.log("Old service:", oldService?.title);
    categoryArray[index] = service;
    console.log("New service:", service.title);
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
    const { brand, model, year, category, index } = await request.json();
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

