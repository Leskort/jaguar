"use client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CarProjectsPage() {
  const { t } = useLanguage();
  
  return (
    <section className="container-padded mx-auto max-w-6xl py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t('carProjects').replace('CAR PROJECTS', 'Car Projects').replace('ПРОЕКТЫ', 'Проекты')}</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{t('galleryComingSoon')}</p>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-video rounded-xl bg-silver/20" />
        ))}
      </div>
    </section>
  );
}






