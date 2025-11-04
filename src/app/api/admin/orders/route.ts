import { NextResponse } from "next/server";
import { getStorageData, saveStorageData } from "@/lib/storage";

const STORAGE_KEY = "orders";
const FALLBACK_PATH = "src/data/orders.json";

async function getOrders() {
  try {
    const data = await getStorageData(STORAGE_KEY, FALLBACK_PATH);
    if (data && Array.isArray(data)) {
      return data;
    }
    return [];
  } catch {
    return [];
  }
}

export async function GET() {
  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const order = await request.json();
    const orders = await getOrders();
    
    const newOrder = {
      ...order,
      id: `order-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    
    orders.push(newOrder);
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, orders);
    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }
    
    const orders = await getOrders();
    const orderIndex = orders.findIndex((order: any) => order.id === id);
    
    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
      updatedAt: new Date().toISOString(),
    };
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, orders);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }
    
    const orders = await getOrders();
    const filteredOrders = orders.filter((order: any) => order.id !== orderId);
    
    await writeFile(DATA_FILE, JSON.stringify(filteredOrders, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}

