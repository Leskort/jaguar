import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const DATA_FILE = join(process.cwd(), "src/data/vehicles.json");

async function getVehicles() {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
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
    
    await writeFile(DATA_FILE, JSON.stringify(updated, null, 2));
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
    
    await writeFile(DATA_FILE, JSON.stringify(vehicles, null, 2));
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
    
    await writeFile(DATA_FILE, JSON.stringify(vehicles, null, 2));
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
    
    await writeFile(DATA_FILE, JSON.stringify(vehicles, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

