import { NextResponse } from "next/server";
import { getStorageData, saveStorageData } from "@/lib/storage";

const STORAGE_KEY = "vehicles";
const FALLBACK_PATH = "src/data/vehicles.json";

async function getVehicles() {
  try {
    const data = await getStorageData(STORAGE_KEY, FALLBACK_PATH);
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    // Если файла нет, возвращаем дефолтные данные
    const { vehiclesData } = await import("@/data/vehicles");
    return vehiclesData;
  } catch {
    // Если файла нет, возвращаем дефолтные данные
    const { vehiclesData } = await import("@/data/vehicles");
    return vehiclesData;
  }
}

export async function GET() {
  const vehicles = await getVehicles();
  // Ensure all vehicles have order property and sort by it
  const vehiclesWithOrder = vehicles.map((vehicle: any, index: number) => ({
    ...vehicle,
    order: vehicle.order !== undefined ? vehicle.order : index,
  }));
  // Sort by order
  vehiclesWithOrder.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  return NextResponse.json(vehiclesWithOrder);
}

export async function POST(request: Request) {
  try {
    const vehicle = await request.json();
    const vehicles = await getVehicles();
    // Assign order based on current array length
    const newVehicle = { ...vehicle, order: vehicles.length };
    const updated = [...vehicles, newVehicle];
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, updated);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { index, vehicle } = await request.json();
    const vehicles = await getVehicles();
    // Preserve the order when updating
    const existingOrder = vehicles[index]?.order !== undefined ? vehicles[index].order : index;
    vehicles[index] = { ...vehicle, order: existingOrder };
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, vehicles);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { fromIndex, toIndex } = await request.json();
    const vehicles = await getVehicles();
    
    if (fromIndex < 0 || fromIndex >= vehicles.length || toIndex < 0 || toIndex >= vehicles.length) {
      return NextResponse.json({ error: "Invalid indices" }, { status: 400 });
    }
    
    // Move vehicle from one position to another
    const [movedVehicle] = vehicles.splice(fromIndex, 1);
    vehicles.splice(toIndex, 0, movedVehicle);
    
    // Reassign order values based on new positions
    vehicles.forEach((vehicle: any, index: number) => {
      vehicle.order = index;
    });
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, vehicles);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { index } = await request.json();
    const vehicles = await getVehicles();
    vehicles.splice(index, 1);
    
    // Reassign order values after deletion
    vehicles.forEach((vehicle: any, idx: number) => {
      vehicle.order = idx;
    });
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, vehicles);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

