"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

type OrderStatus = "pending" | "reviewed" | "contacted" | "completed" | "cancelled";

type Order = {
  id: string;
  customerName: string;
  vehicleVIN: string;
  contact: string;
  items: Array<{ title: string; price: string; brand: string; model: string; year: string; image?: string }>;
  total: string;
  vehicle: {
    brand: string;
    model: string;
    year: string;
  };
  type?: string;
  status?: OrderStatus;
  createdAt: string;
  updatedAt?: string;
};

type Vehicle = {
  brand: string;
  value: string;
  title: string;
  image: string;
  years: Array<{ value: string; label: string }>;
  order?: number;
};

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    loadOrders();
    loadVehicles();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
      return data;
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
      setRefreshKey(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const res = await fetch("/api/admin/vehicles");
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
      setVehicles([]);
    }
  };

  // Helper function to find vehicle image by brand, model, and year
  const getVehicleImage = (brand: string, model: string, year: string): string | null => {
    // Find vehicle by brand and model (value)
    const vehicle = vehicles.find(v => 
      v.brand === brand && 
      v.value === model
    );
    
    if (!vehicle || !vehicle.image) {
      return null;
    }
    
    // Check if the order year matches any of the vehicle's year ranges
    // Year can be like "2010-2016" or "2017"
    const orderYear = parseInt(year.split('-')[0]); // Get first year if range
    
    const yearMatch = vehicle.years.some(y => {
      const yearRange = y.value; // e.g., "2010-2016"
      if (yearRange.includes('-')) {
        const [start, end] = yearRange.split('-').map(yr => parseInt(yr.trim()));
        return orderYear >= start && orderYear <= end;
      } else {
        return parseInt(yearRange) === orderYear;
      }
    });
    
    return yearMatch ? vehicle.image : null;
  };

  const getStatusStyle = (status: OrderStatus) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-blue-100 text-blue-800",
      contacted: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status] || styles.pending;
  };

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter(order => (order.status || "pending") === statusFilter);

  if (loading) {
    return (
      <div className="container-padded mx-auto max-w-6xl py-12">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container-padded mx-auto max-w-6xl py-6 sm:py-12 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">View Orders</h1>
        <Link href="/admin" className="text-sm text-zinc-600 hover:underline w-full sm:w-auto text-center sm:text-left">← Back to Admin</Link>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 sm:gap-3 flex-wrap">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-[var(--accent-gold)] text-black"
              : "border border-[var(--border-color)] hover:bg-white/5"
          }`}
        >
          ALL ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
            statusFilter === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "border border-[var(--border-color)] hover:bg-white/5"
          }`}
        >
          PENDING ({orders.filter(o => (o.status || "pending") === "pending").length})
        </button>
        <button
          onClick={() => setStatusFilter("reviewed")}
          className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
            statusFilter === "reviewed"
              ? "bg-blue-100 text-blue-800"
              : "border border-[var(--border-color)] hover:bg-white/5"
          }`}
        >
          REVIEWED ({orders.filter(o => o.status === "reviewed").length})
        </button>
        <button
          onClick={() => setStatusFilter("contacted")}
          className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
            statusFilter === "contacted"
              ? "bg-green-100 text-green-800"
              : "border border-[var(--border-color)] hover:bg-white/5"
          }`}
        >
          CONTACTED ({orders.filter(o => o.status === "contacted").length})
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
            statusFilter === "completed"
              ? "bg-green-100 text-green-800"
              : "border border-[var(--border-color)] hover:bg-white/5"
          }`}
        >
          COMPLETED ({orders.filter(o => o.status === "completed").length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 mb-4">
            {orders.length === 0 ? "No orders yet" : `No orders with status "${statusFilter}"`}
          </p>
          <p className="text-sm text-zinc-400">
            {orders.length === 0
              ? "Orders will appear here when customers submit requests through \"GET AN OFFER\""
              : "Try selecting a different status filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-[var(--border-color)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold">Order #{order.id}</div>
                  <div className="text-sm text-zinc-500">
                    Created: {new Date(order.createdAt).toLocaleString()}
                    {order.updatedAt && (
                      <span className="ml-2">• Updated: {new Date(order.updatedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={order.status || "pending"}
                    onChange={async (e) => {
                      const newStatus = e.target.value as OrderStatus;
                      try {
                        const res = await fetch("/api/admin/orders", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: order.id, status: newStatus }),
                        });
                        
                        if (res.ok) {
                          // Reload orders immediately to show updated data
                          await loadOrders();
                        } else {
                          const errorText = await res.text();
                          alert(`Failed to update order status: ${errorText || res.statusText}`);
                        }
                      } catch (error) {
                        console.error("Error updating order status:", error);
                        const errorMessage = error instanceof Error ? error.message : "Failed to update order status";
                        alert(`Failed to update order status: ${errorMessage}`);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border border-[var(--border-color)] ${getStatusStyle(order.status || "pending")}`}
                  >
                    <option value="pending">PENDING</option>
                    <option value="reviewed">REVIEWED</option>
                    <option value="contacted">CONTACTED</option>
                    <option value="completed">COMPLETED</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                  <button
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to delete order #${order.id}?`)) return;
                      
                      try {
                        const res = await fetch(`/api/admin/orders?id=${order.id}`, {
                          method: "DELETE",
                        });
                        
                        if (res.ok) {
                          // Reload orders immediately to show updated data
                          await loadOrders();
                        } else {
                          const errorText = await res.text();
                          alert(`Failed to delete order: ${errorText || res.statusText}`);
                        }
                      } catch (error) {
                        console.error("Error deleting order:", error);
                        const errorMessage = error instanceof Error ? error.message : "Failed to delete order";
                        alert(`Failed to delete order: ${errorMessage}`);
                      }
                    }}
                    className="px-4 py-2 rounded border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <div className="font-medium mb-2">Customer Information</div>
                  <div className="text-zinc-600 space-y-1">
                    <div>Name: {order.customerName}</div>
                    <div>Contact: {order.contact}</div>
                    <div>VIN: {order.vehicleVIN}</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">Vehicle</div>
                  {order.type === "general-inquiry" ? (
                    <div className="text-zinc-400">General Inquiry</div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {(() => {
                        const vehicleImage = getVehicleImage(
                          order.vehicle.brand,
                          order.vehicle.model,
                          order.vehicle.year
                        );
                        return vehicleImage ? (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border-color)] bg-silver/20 flex-shrink-0">
                            <Image
                              src={vehicleImage}
                              alt={`${order.vehicle.brand} ${order.vehicle.model}`}
                              fill
                              className="object-cover"
                              unoptimized
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-lg border border-[var(--border-color)] bg-silver/20 flex-shrink-0 flex items-center justify-center text-zinc-400 text-xs text-center px-1">
                            No image
                          </div>
                        );
                      })()}
                      <div className="text-zinc-600">
                        {order.vehicle.brand.replace('-', ' ')} / {order.vehicle.model.replace(/-/g, ' ')} / {order.vehicle.year}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {order.items && order.items.length > 0 ? (
                <div className="border-t border-[var(--border-color)] pt-4">
                  <div className="font-medium mb-3">Items</div>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        {item.image && !item.image.includes(".фв") ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--border-color)] bg-silver/20 flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                              unoptimized
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg border border-[var(--border-color)] bg-silver/20 flex-shrink-0 flex items-center justify-center text-zinc-400 text-xs text-center px-1">
                            No image
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-zinc-900">{item.title}</div>
                          {item.brand && item.model && (
                            <div className="text-xs text-zinc-500">
                              {item.brand.replace('-', ' ')} / {item.model.replace(/-/g, ' ')} / {item.year}
                            </div>
                          )}
                        </div>
                        <div className="font-medium text-zinc-900">{item.price}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold">{order.total}</span>
                  </div>
                </div>
              ) : (
                <div className="border-t border-[var(--border-color)] pt-4">
                  <div className="text-sm text-zinc-500">General inquiry - no specific items selected</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
