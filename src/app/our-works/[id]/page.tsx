"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

type Work = {
  id: string;
  images: string[];
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  order: number;
  createdAt: string;
};

export default function WorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadWork(params.id as string);
    }
  }, [params.id]);

  const loadWork = async (id: string) => {
    try {
      const res = await fetch("/api/admin/works");
      const data = await res.json();
      const worksArray = Array.isArray(data) ? data : [];
      const foundWork = worksArray.find((w: Work) => w.id === id);
      setWork(foundWork || null);
    } catch (error) {
      console.error("Failed to load work:", error);
      setWork(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container-padded mx-auto max-w-6xl py-16">
        <div className="text-center text-zinc-600 dark:text-zinc-400">
          {t('loading')}
        </div>
      </section>
    );
  }

  if (!work) {
    return (
      <section className="container-padded mx-auto max-w-6xl py-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">{t('workNotFound') || 'Work not found'}</h1>
          <Link
            href="/our-works"
            className="text-[var(--accent-gold)] hover:underline"
          >
            {t('backToWorks') || '← Back to Our Works'}
          </Link>
        </div>
      </section>
    );
  }

  const title = language === 'ru' ? work.titleRu : work.titleEn;
  const description = language === 'ru' ? work.descriptionRu : work.descriptionEn;
  const mainImage = work.images && work.images.length > 0 ? work.images[selectedImageIndex] : null;
  const hasMultipleImages = work.images && work.images.length > 1;

  const nextImage = () => {
    if (hasMultipleImages) {
      setSelectedImageIndex((prev) => (prev + 1) % work.images.length);
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setSelectedImageIndex((prev) => (prev - 1 + work.images.length) % work.images.length);
    }
  };

  return (
    <section className="container-padded mx-auto max-w-6xl py-8 sm:py-16">
      {/* Back button */}
      <Link
        href="/our-works"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-[var(--accent-gold)] mb-6 transition-colors"
      >
        <span>←</span>
        <span>{t('backToWorks') || 'Back to Our Works'}</span>
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[var(--border-color)] bg-silver/20 dark:bg-zinc-800/30 group">
            {mainImage ? (
              <>
                <Image
                  src={mainImage}
                  alt={title}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
                {/* Navigation arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <span className="text-xl">←</span>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <span className="text-xl">→</span>
                    </button>
                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                      {selectedImageIndex + 1} / {work.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                {t('noImage')}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {work.images && work.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {work.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-[var(--accent-gold)] ring-2 ring-[var(--accent-gold)]/20'
                      : 'border-[var(--border-color)] opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4">{title}</h1>
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Link
              href="/contact"
              className="inline-block h-12 px-6 rounded-full bg-[var(--accent-gold)] text-black font-medium hover:opacity-90 transition-opacity"
            >
              {t('getAnOffer')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

