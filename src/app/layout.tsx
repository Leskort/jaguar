import type { Metadata } from "next";
import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NavLinks from "@/components/NavLinks";
import Footer from "@/components/Footer";
import { TelegramIcon, InstagramIcon, WhatsAppIcon } from "@/components/SocialIcons";
import "./globals.css";

export const metadata: Metadata = {
  title: "Britline JLR — Apple-Level Premium Security",
  description:
    "Exclusive retrofit service for Land Rover & Jaguar. Any factory system installed post-production.",
  metadataBase: new URL("https://www.britline-jlr.com"),
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)]">
        <LanguageProvider>
          <header className="sticky top-0 z-50 glass">
            <nav className="container-padded mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
              <Link href="/" className="shrink-0 logo-glow">Britline JLR</Link>
              
              {/* Desktop Navigation - показывается на lg и выше (1024px+) */}
              <div className="hidden lg:flex items-center gap-1.5 lg:gap-2 xl:gap-3 2xl:gap-4 text-xs lg:text-sm xl:text-base">
                <NavLinksClient />
              </div>
              
              {/* Desktop Right Side - показывается на lg и выше (1024px+) */}
              <div className="hidden lg:flex items-center gap-1.5 lg:gap-2 xl:gap-3 2xl:gap-4 shrink-0">
                <LanguageSwitcher />
                <div className="flex items-center gap-1 lg:gap-1.5 xl:gap-2">
                  <a
                    href="https://t.me/lr_chip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 dark:text-zinc-200 hover:text-[var(--accent-gold)] dark:hover:text-[var(--accent-gold)] transition-colors"
                    aria-label="Telegram"
                  >
                    <TelegramIcon size={16} className="lg:w-[18px] lg:h-[18px]" />
                  </a>
                  <a
                    href="https://instagram.com/ir_chip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 dark:text-zinc-200 hover:text-[var(--accent-gold)] dark:hover:text-[var(--accent-gold)] transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon size={16} className="lg:w-[18px] lg:h-[18px]" />
                  </a>
                  <a
                    href="https://wa.me/447840000321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 dark:text-zinc-200 hover:text-[var(--accent-gold)] dark:hover:text-[var(--accent-gold)] transition-colors"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon size={16} className="lg:w-[18px] lg:h-[18px]" />
                  </a>
                </div>
                {/* Телефоны - показываются только на xl и выше (1280px+) */}
                <div className="hidden xl:flex items-center gap-2 2xl:gap-3 text-xs xl:text-sm font-medium">
                  <a href="tel:+447840000321" className="hover:opacity-80 transition-opacity whitespace-nowrap">0784 0000 321</a>
                  <a href="tel:+441622801501" className="hover:opacity-80 transition-opacity whitespace-nowrap">01622 801 501</a>
                </div>
              </div>
              
              {/* Mobile Menu Button - показывается только на мобильных */}
              <MobileMenu />
            </nav>
          </header>
          <main className="min-h-[calc(100dvh-56px)] sm:min-h-[calc(100dvh-64px)]">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}

function NavLinksClient() {
  return <NavLinks />;
}
