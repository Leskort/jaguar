"use client";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import ServiceCard from "./ServiceCard";
import Link from "next/link";

type ServiceOption = {
  title: string;
  image: string;
  price: string;
  requirements: string;
  description: string;
  status?: "in-stock" | "unavailable" | "coming-soon";
};

type ServicesPageClientProps = {
  brand: string;
  model: string;
  year: string;
  categoriesData: Record<string, ServiceOption[]>;
};

const categoryLabels: Record<string, string> = {
  "features-activation": "FEATURES ACTIVATION",
  "retrofits": "RETROFITS",
  "power-upgrade": "POWER UPGRADE",
  "accessories": "ACCESSORIES",
};

export default function ServicesPageClient({ brand, model, year, categoriesData }: ServicesPageClientProps) {
  // Get available categories from data
  const availableCategories = Object.keys(categoriesData);
  const [activeCategory, setActiveCategory] = useState(availableCategories[0] || "");
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    name: "",
    vin: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);
  
  const itemCount = useCartStore((state) => state.getItemCount());
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const checkAndClearForNewVehicle = useCartStore((state) => state.checkAndClearForNewVehicle);

  // Check and clear cart if vehicle changed
  useEffect(() => {
    checkAndClearForNewVehicle(brand, model, year);
  }, [brand, model, year, checkAndClearForNewVehicle]);

  // Get options for active category
  const currentOptions = categoriesData[activeCategory] || [];

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        customerName: orderFormData.name,
        vehicleVIN: orderFormData.vin,
        contact: orderFormData.contact,
        items: items,
        total: totalPrice,
        vehicle: {
          brand,
          model,
          year,
        },
      };

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        alert("Order submitted successfully! We will contact you soon.");
        clearCart();
        setShowOrderForm(false);
        setShowCart(false);
        setOrderFormData({ name: "", vin: "", contact: "" });
      } else {
        alert("Failed to submit order. Please try again.");
      }
    } catch (error) {
      alert("Failed to submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-padded mx-auto max-w-6xl py-8">
      {/* Breadcrumb */}
      <div className="text-xs uppercase text-zinc-500 mb-4">
        {brand.replace('-', ' ').toUpperCase()} / {model.replace(/-/g, ' ').toUpperCase()} {year}
      </div>

      {/* Category Tabs + Cart */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-3 flex-wrap">
          {availableCategories.map((catKey) => (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                activeCategory === catKey
                  ? "bg-[var(--accent-gold)] text-black"
                  : "border border-[var(--border-color)] hover:bg-white/5"
              }`}
            >
              {categoryLabels[catKey] || catKey.toUpperCase()}
            </button>
          ))}
        </div>
        {/* Cart Icon */}
        <button
          onClick={() => setShowCart(true)}
          className="flex items-center gap-2 hover:opacity-80"
        >
          <div className="relative">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-700">
              <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H16.55C17.3 13 17.96 12.59 18.3 11.97L21.88 6H5.21L4.27 4H1V2ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="currentColor"/>
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--accent-gold)] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-sm font-medium">ADDED</span>
        </button>
      </div>

      {/* Category Title */}
      <h2 className="text-xl font-semibold mb-6 uppercase">
        {categoryLabels[activeCategory] || activeCategory.toUpperCase()}
      </h2>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {currentOptions.map((opt: ServiceOption) => (
          <ServiceCard key={opt.title} option={opt} brand={brand} model={model} year={year} />
        ))}
      </div>

      {/* Total + CTA Footer */}
      {itemCount > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-[var(--border-color)] py-6 mt-8">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="text-sm text-zinc-500 mb-1">TOTAL</div>
              <div className="text-2xl font-semibold">{totalPrice}</div>
            </div>
            <button
              onClick={() => {
                setShowCart(false);
                setShowOrderForm(true);
              }}
              className="px-8 py-4 rounded-full bg-[var(--accent-gold)] text-black font-medium hover:bg-[var(--accent-gold)]/90"
            >
              GET AN OFFER
            </button>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCart(false)} />
          <div className="relative z-[61] w-[92vw] max-w-2xl rounded-2xl bg-white text-black p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-zinc-500 hover:text-black"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {items.length === 0 ? (
              <p className="text-center py-8 text-zinc-500">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-[var(--border-color)] rounded-lg">
                      <div className="relative w-20 h-20 bg-silver/20 rounded overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-zinc-500 mb-2">
                          {item.brand.replace('-', ' ')} / {item.model.replace(/-/g, ' ')} / {item.year}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold">{item.price}</div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-red-600 hover:text-red-800 underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--border-color)] pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-semibold">{totalPrice}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 px-4 py-2 rounded border border-[var(--border-color)] hover:bg-zinc-50"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={() => {
                        setShowCart(false);
                        setShowOrderForm(true);
                      }}
                      className="flex-1 px-4 py-2 rounded-full bg-[var(--accent-gold)] text-black font-medium hover:bg-[var(--accent-gold)]/90"
                    >
                      GET AN OFFER
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowOrderForm(false)} />
          <div className="relative z-[61] w-[92vw] max-w-2xl rounded-2xl bg-white text-black p-6" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Close"
              className="absolute right-4 top-4 text-zinc-500 hover:text-black"
              onClick={() => setShowOrderForm(false)}
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-6">Get an offer</h3>
            <form onSubmit={handleOrderSubmit} className="grid gap-3">
              <input
                type="text"
                value={orderFormData.name}
                onChange={(e) => setOrderFormData({ ...orderFormData, name: e.target.value })}
                className="h-12 rounded-md border border-zinc-200 px-4 text-sm"
                placeholder="YOUR NAME"
                required
              />
              <input
                type="text"
                value={orderFormData.vin}
                onChange={(e) => setOrderFormData({ ...orderFormData, vin: e.target.value })}
                className="h-12 rounded-md border border-zinc-200 px-4 text-sm"
                placeholder="VEHICLE VIN NUMBER"
                required
              />
              <input
                type="text"
                value={orderFormData.contact}
                onChange={(e) => setOrderFormData({ ...orderFormData, contact: e.target.value })}
                className="h-12 rounded-md border border-zinc-200 px-4 text-sm"
                placeholder="MOBILE NUMBER OR EMAIL ADDRESS"
                required
              />
              <div className="mt-2 p-4 bg-zinc-50 rounded-lg">
                <div className="text-sm text-zinc-600 mb-2">Order Summary:</div>
                <div className="text-xs text-zinc-500 space-y-1">
                  {items.map((item) => (
                    <div key={item.id}>
                      {item.title} - {item.price}
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-200 flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold">{totalPrice}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="h-12 rounded-md bg-[#ffd000] text-black font-medium disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "GET AN OFFER"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

