"use client";
import Image from "next/image";

export default function BrandLogos() {
  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="container-padded mx-auto max-w-7xl px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 xl:gap-24">
          {/* Land Rover Logo */}
          <BrandLogoCard
            brand="Land Rover"
            description="British Excellence"
          />
          
          {/* Divider */}
          <div className="hidden lg:block w-px h-32 bg-gradient-to-b from-transparent via-[var(--accent-gold)]/30 to-transparent" />
          
          {/* Jaguar Logo */}
          <BrandLogoCard
            brand="Jaguar"
            description="Pure Performance"
          />
        </div>
      </div>
    </section>
  );
}

interface BrandLogoCardProps {
  brand: string;
  description: string;
}

function BrandLogoCard({ brand, description }: BrandLogoCardProps) {
  return (
    <div className="relative w-full max-w-sm lg:max-w-md">
      {/* Main card */}
      <div className="relative h-72 sm:h-80 lg:h-96 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-6 sm:p-8">
          {/* Logo Container */}
          <div className="mb-6 sm:mb-8 flex items-center justify-center w-full">
            {brand === "Land Rover" ? (
              <LandRoverLogo />
            ) : (
              <JaguarLogo />
            )}
          </div>
          
          {/* Brand name */}
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-zinc-900 dark:text-white text-center tracking-tight">
            {brand}
          </h3>
          
          {/* Accent line - элегантная полоска с градиентом */}
          <div 
            className="mb-4 mx-auto"
            style={{
              width: '140px',
              height: '4px',
              background: 'linear-gradient(to right, rgba(0, 255, 65, 0.2) 0%, rgba(0, 255, 65, 0.7) 15%, #00ff41 35%, #00ff41 65%, rgba(0, 255, 65, 0.7) 85%, rgba(0, 255, 65, 0.2) 100%)',
              borderRadius: '2px',
              boxShadow: '0 0 15px rgba(0, 255, 65, 0.9), 0 0 8px rgba(0, 255, 65, 0.5)',
              display: 'block',
              position: 'relative',
              zIndex: 1,
              minHeight: '4px',
            }}
          />
          
          {/* Description */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-light tracking-wide text-center max-w-xs">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function LandRoverLogo() {
  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 flex items-center justify-center">
      <Image
        src="/logos/land-rover.png"
        alt="Land Rover Logo"
        width={224}
        height={224}
        className="object-contain"
        unoptimized
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
}

function JaguarLogo() {
  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 flex items-center justify-center">
      <Image
        src="/logos/jaguar.png"
        alt="Jaguar Logo"
        width={224}
        height={224}
        className="object-contain"
        unoptimized
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
}
