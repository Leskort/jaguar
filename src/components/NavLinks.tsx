"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NavLinks() {
  const { t } = useLanguage();
  
  return (
    <>
      <Link href="/vehicles" className="hover:opacity-80 transition-opacity">{t('vehicles')}</Link>
      <Link href="/our-works" className="hover:opacity-80 transition-opacity">{t('ourWorks')}</Link>
      <Link href="/car-projects" className="hover:opacity-80 transition-opacity">{t('carProjects')}</Link>
      <Link href="/contact" className="hover:opacity-80 transition-opacity">{t('contacts')}</Link>
    </>
  );
}



