import type { Metadata } from "next";
import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NavLinks from "@/components/NavLinks";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "LR-CHIP — Apple-Level Premium Security",
  description:
    "Exclusive retrofit service for Land Rover & Jaguar. Any factory system installed post-production.",
  metadataBase: new URL("https://www.lr-chip.example"),
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
            <nav className="container-padded mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
              <Link href="/" className="font-medium tracking-tight text-sm sm:text-base">LR-CHIP</Link>
              <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm">
                <NavLinksClient />
              </div>
              <div className="hidden md:flex items-center gap-3 lg:gap-4">
                <LanguageSwitcher />
                <div className="flex items-center gap-3 lg:gap-4 text-xs sm:text-sm font-medium">
                  <a href="tel:+447840000321" className="hover:opacity-80 transition-opacity whitespace-nowrap">0784 0000 321</a>
                  <a href="tel:+441622801501" className="hover:opacity-80 transition-opacity whitespace-nowrap">01622 801 501</a>
                </div>
              </div>
              <MobileMenu />
            </nav>
          </header>
          <main className="min-h-[calc(100dvh-112px)]">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}

function NavLinksClient() {
  return <NavLinks />;
}
