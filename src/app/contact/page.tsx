"use client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  
  return (
    <section className="container-padded mx-auto max-w-6xl py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t('contact')}</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-color)] p-6">
          <h2 className="text-xl font-medium">{t('unitedKingdom')}</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Unit 29 Integra:ME, Parkwood Industrial Estate, Maidstone ME15 9GQ</p>
          <a href="tel:+447840000321" className="mt-3 inline-block text-sm hover:opacity-80">+44 784 0000 321</a>
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] p-6">
          <h2 className="text-xl font-medium">{t('ukraine')}</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Kraynya st. 1, Kyiv 02217</p>
          <a href="tel:+380670000321" className="mt-3 inline-block text-sm hover:opacity-80">+38 067 0000 321</a>
        </div>
      </div>
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">{t('callbackFormComingSoon')}</p>
    </section>
  );
}






