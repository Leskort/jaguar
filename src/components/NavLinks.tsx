"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NavLinks() {
  const { t } = useLanguage();
  
  return (
    <>
      <Link href="/vehicles" className="hover:opacity-80 transition-opacity whitespace-nowrap">{t('vehicles')}</Link>
      <Link href="/our-works" className="hover:opacity-80 transition-opacity whitespace-nowrap">{t('ourWorks')}</Link>
      <Link href="/car-projects" className="hover:opacity-80 transition-opacity whitespace-nowrap">{t('carProjects')}</Link>
      <Link href="/contact" className="hover:opacity-80 transition-opacity whitespace-nowrap">{t('contacts')}</Link>
    </>
  );
}







