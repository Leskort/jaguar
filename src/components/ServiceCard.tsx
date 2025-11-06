"use client";
import Image from "next/image";
import { useCartStore, type CartItem } from "@/store/cart";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useMemo, useCallback, useRef } from "react";

type ServiceCardProps = {
  option: {
    title: string;
    image: string;
    price: string;
    requirements: string;
    description?: string; // Legacy field for backward compatibility
    descriptionEn?: string;
    descriptionRu?: string;
    status?: "in-stock" | "unavailable" | "coming-soon";
  };
  brand: string;
  model: string;
  year: string;
  uniqueId?: string; // Optional unique identifier to ensure uniqueness
};

// Global counter to ensure uniqueness across all card instances
let globalCardCounter = 0;

function ServiceCard({ option, brand, model, year, uniqueId }: ServiceCardProps) {
  const { t, language } = useLanguage();
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  
  // Create a TRULY unique instance ID that never changes for this component instance
  // Use a combination of counter, timestamp, and multiple random values to ensure uniqueness
  const instanceIdRef = useRef<string | null>(null);
  if (instanceIdRef.current === null) {
    globalCardCounter += 1;
    // Use multiple sources of randomness to ensure uniqueness even in rapid renders
    const timestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const random1 = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    // Combine counter, timestamp, and two random strings for absolute uniqueness
    instanceIdRef.current = `card-${globalCardCounter}-${timestamp}-${random1}-${random2}`;
  }
  const instanceId = instanceIdRef.current;
  
  // Debug: log when component renders
  console.log('ServiceCard render:', instanceId, 'title:', option.title);
  
  // Create unique itemId using uniqueId if provided, otherwise use a combination of fields
  // Use useMemo to ensure stable reference
  // Include all identifying fields to ensure absolute uniqueness
  const itemId = useMemo(() => {
    if (uniqueId) {
      return `${brand}-${model}-${year}-${uniqueId}`;
    }
    // Create a hash-like string from all identifying fields
    const identifier = `${brand}-${model}-${year}-${option.title}-${option.price}-${option.image}-${option.requirements}`;
    return identifier;
  }, [brand, model, year, uniqueId, option.title, option.price, option.image, option.requirements]);
  
  // Subscribe only to check if THIS specific item is in the cart
  // Use a selector that extracts only the boolean value for this specific item
  // This way, the component only re-renders when THIS item's cart status changes
  const alreadyInCart = useCartStore((state) => {
    // Check if this specific item exists in cart
    const found = state.items.find((item) => item.id === itemId);
    return found !== undefined && 
           found.title === option.title && 
           found.price === option.price &&
           found.image === option.image;
  });
  
  const [imgError, setImgError] = useState(false);
  // Use instanceId in state key to ensure complete isolation
  // Initialize state with a function to ensure it's unique per instance
  const [isDetailsOpen, setIsDetailsOpen] = useState(() => false);
  
  // Create unique details ID for this specific card instance using instanceId
  const detailsId = useMemo(() => `details-${instanceId}`, [instanceId]);

  // Memoize the toggle handler to ensure it's stable and isolated
  // Use instanceId in closure to ensure handler is unique per card
  const handleToggleDetails = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Use the captured instanceId to ensure we're updating the right card
    const cardInstanceId = instanceId;
    // Debug: log which card is being toggled
    console.log('Toggling details for instanceId:', cardInstanceId, 'itemId:', itemId);
    // Use functional update with explicit instance check
    setIsDetailsOpen((prev) => {
      // This state update is scoped to this specific component instance
      // React will only update the state for this specific card
      console.log('State update for instanceId:', cardInstanceId, 'prev:', prev, 'new:', !prev);
      return !prev;
    });
  }, [instanceId, itemId]);

  const handleAddToCart = useCallback(() => {
    const cartItem: CartItem = {
      id: itemId,
      title: option.title,
      image: option.image,
      price: option.price,
      requirements: option.requirements,
      description: option.description,
      descriptionEn: option.descriptionEn,
      descriptionRu: option.descriptionRu,
      brand,
      model,
      year,
    };
    addItem(cartItem);
  }, [itemId, option.title, option.image, option.price, option.requirements, option.description, option.descriptionEn, option.descriptionRu, brand, model, year, addItem, instanceId]);

  const handleRemoveFromCart = useCallback(() => {
    removeItem(itemId);
  }, [itemId, removeItem, instanceId]);

  const status = option.status;
  const isUnavailable = status === "unavailable" || status === "coming-soon";
  
  // Validate image path
  const imagePath = option.image && option.image.trim() !== "" && !option.image.includes(".фв") 
    ? option.image 
    : null;

  return (
    <div 
      className="rounded-2xl border border-[var(--border-color)] bg-white overflow-hidden shadow-sm flex flex-col"
      data-service-card={itemId}
      data-instance-id={instanceId}
      style={{ 
        isolation: 'isolate',
        contain: 'layout style paint',
        willChange: 'auto'
      }}
    >
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
        <div 
          className="mt-auto" 
          id={detailsId} 
          data-card-id={itemId} 
          data-instance-id={instanceId}
          style={{ isolation: 'isolate' }}
        >
          <button
            type="button"
            onClick={handleToggleDetails}
            className="cursor-pointer text-xs select-none text-zinc-600 underline flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-400 transition-colors w-full text-left bg-transparent border-0 p-0"
            aria-expanded={isDetailsOpen}
            aria-controls={`${detailsId}-content`}
            data-card-id={itemId}
            data-instance-id={instanceId}
            data-details-button={instanceId}
            style={{ isolation: 'isolate' }}
          >
            {t('details')} <span className={`inline-block transition-transform duration-200 ${isDetailsOpen ? 'rotate-180' : ''}`}>↓</span>
          </button>
          {isDetailsOpen && (
            <div 
              id={`${detailsId}-content`} 
              className="pt-2 text-xs text-zinc-700 dark:text-zinc-300"
              data-card-id={itemId}
              data-instance-id={instanceId}
              style={{ isolation: 'isolate' }}
            >
              {(() => {
                if (language === 'ru') {
                  return option.descriptionRu || option.description || '';
                } else {
                  return option.descriptionEn || option.description || '';
                }
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Don't use memo - let React handle re-renders naturally
// The instanceId and isolated state will ensure cards don't interfere with each other
export default ServiceCard;

