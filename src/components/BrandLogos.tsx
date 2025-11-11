"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function BrandLogos() {
  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent-gold)]/5 to-transparent pointer-events-none" />
      
      <div className="container-padded mx-auto max-w-7xl px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 xl:gap-24">
          {/* Land Rover Logo */}
          <BrandLogoCard
            brand="Land Rover"
            description="British Excellence"
            delay={0}
          />
          
          {/* Divider */}
          <div className="hidden lg:block w-px h-32 bg-gradient-to-b from-transparent via-[var(--accent-gold)]/30 to-transparent" />
          
          {/* Jaguar Logo */}
          <BrandLogoCard
            brand="Jaguar"
            description="Pure Performance"
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
}

interface BrandLogoCardProps {
  brand: string;
  description: string;
  delay: number;
}

function BrandLogoCard({ brand, description, delay }: BrandLogoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="relative w-full max-w-sm lg:max-w-md"
    >
      {/* Main card */}
      <div className="relative h-72 sm:h-80 lg:h-96 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
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
          
          {/* Accent line - простая зеленая полоска */}
          <div className="w-20 h-0.5 sm:w-24 sm:h-[1px] lg:w-28 mb-4 bg-[#00ff41]" />
          
          {/* Description */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-light tracking-wide text-center max-w-xs">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
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
