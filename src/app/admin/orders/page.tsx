"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

type OrderStatus = "pending" | "reviewed" | "contacted" | "completed" | "cancelled";

type Order = {
  id: string;
  customerName: string;
  vehicleVIN: string;
  contact: string;
  items: Array<{ title: string; price: string; brand: string; model: string; year: string }>;
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

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
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
    <div className="container-padded mx-auto max-w-6xl py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">View Orders</h1>
        <Link href="/admin" className="text-sm text-zinc-600 hover:underline">← Back to Admin</Link>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            statusFilter === "all"
              ? "bg-[var(--accent-gold)] text-black"
              : "border border-[var(--border-color)] hover:bg-white/5"
          }`}
        >
          ALL ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            statusFilter === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "border border-[var(--border-color)] hover:bg-white/5"
          }`}
        >
          PENDING ({orders.filter(o => (o.status || "pending") === "pending").length})
        </button>
        <button
          onClick={() => setStatusFilter("reviewed")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            statusFilter === "reviewed"
              ? "bg-blue-100 text-blue-800"
              : "border border-[var(--border-color)] hover:bg-white/5"
          }`}
        >
          REVIEWED ({orders.filter(o => o.status === "reviewed").length})
        </button>
        <button
          onClick={() => setStatusFilter("contacted")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            statusFilter === "contacted"
              ? "bg-green-100 text-green-800"
              : "border border-[var(--border-color)] hover:bg-white/5"
          }`}
        >
          CONTACTED ({orders.filter(o => o.status === "contacted").length})
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
                          await loadOrders();
                        } else {
                          alert("Failed to update order status");
                        }
                      } catch (error) {
                        alert("Failed to update order status");
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
                          await loadOrders();
                        } else {
                          alert("Failed to delete order");
                        }
                      } catch (error) {
                        alert("Failed to delete order");
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
                  <div className="text-zinc-600">
                    {order.type === "general-inquiry" ? (
                      <span className="text-zinc-400">General Inquiry</span>
                    ) : (
                      <>
                        {order.vehicle.brand.replace('-', ' ')} / {order.vehicle.model.replace(/-/g, ' ')} / {order.vehicle.year}
                      </>
                    )}
                  </div>
                </div>
              </div>
              {order.items && order.items.length > 0 ? (
                <div className="border-t border-[var(--border-color)] pt-4">
                  <div className="font-medium mb-2">Items</div>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-zinc-600">
                        <span>{item.title}</span>
                        <span className="font-medium">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex justify-between items-center">
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
