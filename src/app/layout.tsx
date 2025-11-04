import type { Metadata } from "next";
import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";
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
        <header className="sticky top-0 z-50 glass">
          <nav className="container-padded mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
            <Link href="/" className="font-medium tracking-tight text-sm sm:text-base">LR-CHIP</Link>
            <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm">
              <Link href="/vehicles" className="hover:opacity-80 transition-opacity">VEHICLES</Link>
              <Link href="/our-works" className="hover:opacity-80 transition-opacity">OUR WORKS</Link>
              <Link href="/car-projects" className="hover:opacity-80 transition-opacity">CAR PROJECTS</Link>
              <Link href="/contact" className="hover:opacity-80 transition-opacity">CONTACTS</Link>
            </div>
            <div className="hidden md:flex items-center gap-3 lg:gap-4 text-xs sm:text-sm font-medium">
              <a href="tel:+447840000321" className="hover:opacity-80 transition-opacity whitespace-nowrap">0784 0000 321</a>
              <a href="tel:+441622801501" className="hover:opacity-80 transition-opacity whitespace-nowrap">01622 801 501</a>
            </div>
            <MobileMenu />
          </nav>
        </header>
        <main className="min-h-[calc(100dvh-112px)]">{children}</main>
        <footer className="border-t border-[var(--border-color)] bg-white dark:bg-[var(--space-black)]">
          <div className="container-padded mx-auto py-12 sm:py-16 px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8">
              <div>
                <h3 className="font-semibold mb-4 text-sm">SCHEDULE</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  <li>* Mon–Fri 10:00 – 19:00</li>
                  <li>* Sat — working by agreement</li>
                  <li>* Sun — day off</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-sm">About us</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  <li><Link href="/our-works" className="hover:text-[var(--accent-gold)]">Our works</Link></li>
                  <li><Link href="/services" className="hover:text-[var(--accent-gold)]">Retrofits</Link></li>
                  <li><Link href="/services" className="hover:text-[var(--accent-gold)]">Features activation</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-sm">CONTACTS IN THE UK</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  <li>Unit 29 Integra:ME</li>
                  <li>Parkwood Industrial Estate</li>
                  <li>Bircholt Road, Maidstone</li>
                  <li>ME15 9GQ</li>
                  <li><a href="tel:+447840000321" className="hover:text-[var(--accent-gold)]">+44 784 0000 321</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-sm">CONTACTS IN UKRAINE</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  <li>Kraynya st. 1</li>
                  <li>Kyiv, 02217</li>
                  <li><a href="tel:+380670000321" className="hover:text-[var(--accent-gold)]">+38 067 0000 321</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-[var(--border-color)] pt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  <a href="mailto:lr.chip.com.ua@gmail.com" className="hover:text-[var(--accent-gold)]">lr.chip.com.ua@gmail.com</a>
                </div>
                <div className="flex gap-4">
                  <a href="https://instagram.com/ir_chip" target="_blank" rel="noopener noreferrer" className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--accent-gold)] text-xs sm:text-sm">IG</a>
                  <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--accent-gold)] text-xs sm:text-sm">YT</a>
                </div>
                <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  <Link href="/" className="font-semibold">LR‑Chip</Link>
                </div>
                <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  © Все права защищены
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
