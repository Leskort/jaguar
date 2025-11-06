"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

type Work = {
  id: string;
  image: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  order: number;
  createdAt: string;
};

export default function OurWorksPage() {
  const { t, language } = useLanguage();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const res = await fetch("/api/admin/works");
      const data = await res.json();
      const worksArray = Array.isArray(data) ? data : [];
      setWorks(worksArray);
    } catch (error) {
      console.error("Failed to load works:", error);
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <section className="container-padded mx-auto max-w-6xl py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t('ourWorks').replace('OUR WORKS', 'Our Works').replace('НАШИ РАБОТЫ', 'Наши работы')}</h1>
      
      {loading ? (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <article key={i} className="rounded-2xl border border-[var(--border-color)] overflow-hidden">
              <div className="h-48 bg-silver/20 dark:bg-zinc-800/30" />
              <div className="p-4 text-sm font-medium">{t('project')} #{i + 1}</div>
            </article>
          ))}
        </div>
      ) : works.length === 0 ? (
        <div className="mt-10 text-center text-zinc-600 dark:text-zinc-400">
          {t('noWorksFound')}
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {works.map((work) => (
            <article key={work.id} className="rounded-2xl border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-silver/20 dark:bg-zinc-800/30">
                {work.image ? (
                  <Image
                    src={work.image}
                    alt={language === 'ru' ? work.titleRu : work.titleEn}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">
                  {language === 'ru' ? work.titleRu : work.titleEn}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {language === 'ru' ? work.descriptionRu : work.descriptionEn}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
      
      <div className="mt-10 flex items-center justify-center">
        <Link href="/contact" className="h-12 px-6 rounded-full bg-[var(--accent-gold)] text-black font-medium hover:opacity-90 transition-opacity">
          {t('getAnOffer')}
        </Link>
      </div>
    </section>
  );
}






