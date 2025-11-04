"use client";
import Image from "next/image";
import { useCartStore, type CartItem } from "@/store/cart";
import { useState } from "react";

type ServiceCardProps = {
  option: {
    title: string;
    image: string;
    price: string;
    requirements: string;
    description: string;
    status?: "in-stock" | "unavailable" | "coming-soon";
  };
  brand: string;
  model: string;
  year: string;
};

export default function ServiceCard({ option, brand, model, year }: ServiceCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const items = useCartStore((state) => state.items);

  const itemId = `${brand}-${model}-${year}-${option.title}`;
  const alreadyInCart = items.some((item) => item.id === itemId);

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: itemId,
      title: option.title,
      image: option.image,
      price: option.price,
      requirements: option.requirements,
      description: option.description,
      brand,
      model,
      year,
    };
    addItem(cartItem);
  };

  const handleRemoveFromCart = () => {
    removeItem(itemId);
  };

  const status = option.status;
  const isUnavailable = status === "unavailable" || status === "coming-soon";

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-white overflow-hidden shadow-sm flex flex-col">
      <div className="relative h-40 w-full bg-silver/20">
        <Image 
          src={option.image} 
          alt={option.title} 
          fill 
          className={`object-cover ${isUnavailable ? 'grayscale opacity-60' : ''}`}
          unoptimized 
        />
        {/* Status Badge */}
        {status === "in-stock" && (
          <div className="absolute bottom-2 right-2 bg-[var(--accent-gold)] text-black px-3 py-1 rounded text-xs font-bold">
            IN STOCK
          </div>
        )}
        {status === "unavailable" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-2xl font-bold text-white uppercase">
              UNAVAILABLE
            </div>
          </div>
        )}
        {status === "coming-soon" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-2xl font-bold text-white uppercase">
              COMING SOON
            </div>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="font-medium mb-2 text-sm">{option.title}</div>
        <div className="text-xs text-zinc-500 flex items-center gap-1">
          {option.requirements === "Yes" && <span className="text-orange-500">▲</span>}
          Requirements: {option.requirements}
        </div>
        <div className="flex items-center justify-between mt-2 mb-3">
          <div className="text-xl font-semibold">{option.price}</div>
          {alreadyInCart ? (
            <button
              onClick={handleRemoveFromCart}
              disabled={isUnavailable}
              className="h-8 px-4 rounded bg-[var(--accent-gold)] text-black text-sm font-medium flex items-center gap-2 hover:bg-[var(--accent-gold)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="w-4 h-4 bg-[var(--accent-gold)] border border-black/20 flex items-center justify-center">
                ✓
              </span>
              REMOVE
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isUnavailable}
              className="h-8 px-4 rounded bg-[var(--accent-gold)] text-black text-sm font-medium flex items-center gap-2 hover:bg-[var(--accent-gold)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="w-4 h-4 border border-black/20"></span>
              ADD
            </button>
          )}
        </div>
        <details className="mt-auto">
          <summary className="cursor-pointer text-xs select-none text-zinc-600 underline flex items-center gap-1">
            Details <span>↓</span>
          </summary>
          <div className="pt-2 text-xs text-zinc-700">{option.description}</div>
        </details>
      </div>
    </div>
  );
}

