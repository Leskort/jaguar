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
    const services = await getServices();
    
    // Ensure structure exists
    if (!services[brand]) services[brand] = {};
    if (!services[brand][model]) services[brand][model] = {};
    if (!services[brand][model][year]) services[brand][model][year] = {};
    if (!services[brand][model][year][category]) services[brand][model][year][category] = [];
    
    services[brand][model][year][category].push(service);
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving service:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { brand, model, year, category, index, service } = await request.json();
    const services = await getServices();
    
    if (services[brand]?.[model]?.[year]?.[category]?.[index]) {
      services[brand][model][year][category][index] = service;
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

