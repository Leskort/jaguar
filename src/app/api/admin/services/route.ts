import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const DATA_FILE = join(process.cwd(), "src/data/services.json");

async function getServices() {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // Если файла нет, возвращаем дефолтные данные
    const { servicesData } = await import("@/data/services");
    return servicesData;
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
    
    await writeFile(DATA_FILE, JSON.stringify(services, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { brand, model, year, category, index, service } = await request.json();
    const services = await getServices();
    
    if (services[brand]?.[model]?.[year]?.[category]?.[index]) {
      services[brand][model][year][category][index] = service;
      await writeFile(DATA_FILE, JSON.stringify(services, null, 2));
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { brand, model, year, category, index } = await request.json();
    const services = await getServices();
    
    if (services[brand]?.[model]?.[year]?.[category]?.[index]) {
      services[brand][model][year][category].splice(index, 1);
      await writeFile(DATA_FILE, JSON.stringify(services, null, 2));
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

