"use client";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { TelegramIcon, InstagramIcon, WhatsAppIcon } from "./SocialIcons";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      {/* Burger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex flex-col gap-1.5 p-2"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
            isOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <nav
            className={`fixed top-16 left-0 right-0 bg-white dark:bg-[var(--space-black)] border-b border-[var(--border-color)] z-50 md:hidden transition-transform duration-300 ${
              isOpen ? "translate-y-0" : "-translate-y-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container-padded mx-auto py-4">
              <div className="flex flex-col gap-4">
                <Link
                  href="/vehicles"
                  className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t('vehicles')}
                </Link>
                <Link
                  href="/our-works"
                  className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t('ourWorks')}
                </Link>
                <Link
                  href="/car-projects"
                  className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t('carProjects')}
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t('contacts')}
                </Link>
                <div className="border-t border-[var(--border-color)] pt-4 mt-2">
                  <LanguageSwitcher fullWidth={true} />
                </div>
                <div className="border-t border-[var(--border-color)] pt-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <a
                      href="tel:+447840000321"
                      className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      0784 0000 321
                    </a>
                    <a
                      href="tel:+441622801501"
                      className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      01622 801 501
                    </a>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <a
                      href="https://t.me/lr_chip"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--accent-gold)] transition-colors"
                      aria-label="Telegram"
                      onClick={() => setIsOpen(false)}
                    >
                      <TelegramIcon size={24} />
                    </a>
                    <a
                      href="https://instagram.com/ir_chip"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--accent-gold)] transition-colors"
                      aria-label="Instagram"
                      onClick={() => setIsOpen(false)}
                    >
                      <InstagramIcon size={24} />
                    </a>
                    <a
                      href="https://wa.me/447840000321"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--accent-gold)] transition-colors"
                      aria-label="WhatsApp"
                      onClick={() => setIsOpen(false)}
                    >
                      <WhatsAppIcon size={24} />
                    </a>
                  </div>
                </div>
                <div className="pt-4">
                  <a
                    href="/contact"
                    className="block w-full text-center px-6 py-3 rounded-lg bg-[var(--accent-gold)] text-black font-semibold hover:opacity-90 transition-opacity"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('getAnOffer')}
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}



