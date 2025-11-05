"use client";
import Image from "next/image";
import { useCartStore, type CartItem } from "@/store/cart";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const items = useCartStore((state) => state.items);
  const [imgError, setImgError] = useState(false);

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
  
  // Validate image path
  const imagePath = option.image && option.image.trim() !== "" && !option.image.includes(".фв") 
    ? option.image 
    : null;

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-white overflow-hidden shadow-sm flex flex-col">
      <div className="relative h-40 w-full bg-silver/20">
        {imagePath && !imgError ? (
          <Image 
            src={imagePath} 
            alt={option.title} 
            fill 
            className={`object-cover ${isUnavailable ? 'grayscale opacity-60' : ''}`}
            unoptimized 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs px-2 text-center">
            {option.title}
          </div>
        )}
        {/* Status Badge */}
        {status === "in-stock" && (
          <div className="absolute bottom-2 right-2 bg-[var(--accent-gold)] text-black px-3 py-1 rounded text-xs font-bold">
            {t('inStock')}
          </div>
        )}
        {status === "unavailable" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-2xl font-bold text-white uppercase">
              {t('unavailable')}
            </div>
          </div>
        )}
        {status === "coming-soon" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-2xl font-bold text-white uppercase">
              {t('comingSoon')}
            </div>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="font-medium mb-2 text-sm">{option.title}</div>
        <div className="text-xs text-zinc-500 flex items-center gap-1">
          {option.requirements === "Yes" && <span className="text-orange-500">▲</span>}
          {t('requirements')}: {option.requirements === "Yes" ? t('yes') : t('no')}
        </div>
        <div className="flex items-center justify-between mt-2 mb-3 gap-2">
          <div className="text-lg sm:text-xl font-semibold">{option.price}</div>
          {alreadyInCart ? (
            <button
              onClick={handleRemoveFromCart}
              disabled={isUnavailable}
              className="h-10 sm:h-8 px-4 sm:px-3 rounded-full bg-[var(--accent-gold)] text-black text-sm font-semibold flex items-center gap-2 hover:bg-[var(--accent-gold)]/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 shadow-md hover:shadow-lg transition-all"
            >
              <span className="w-5 h-5 sm:w-4 sm:h-4 bg-black/10 rounded flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              <span>{t('remove')}</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isUnavailable}
              className="h-10 sm:h-8 px-4 sm:px-3 rounded-full bg-[var(--accent-gold)] text-black text-sm font-semibold flex items-center gap-2 hover:bg-[var(--accent-gold)]/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 shadow-md hover:shadow-lg transition-all"
            >
              <span className="w-5 h-5 sm:w-4 sm:h-4 border-2 border-black/30 rounded"></span>
              <span>{t('add')}</span>
            </button>
          )}
        </div>
        <details className="mt-auto">
          <summary className="cursor-pointer text-xs select-none text-zinc-600 underline flex items-center gap-1">
            {t('details')} <span>↓</span>
          </summary>
          <div className="pt-2 text-xs text-zinc-700">{option.description}</div>
        </details>
      </div>
    </div>
  );
}

