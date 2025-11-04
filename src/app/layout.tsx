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
        <footer className="border-t border-[var(--border-color)]">
          <div className="container-padded mx-auto py-8 sm:py-10 px-4 sm:px-6 text-xs sm:text-sm text-zinc-600">
            <div className="flex flex-col gap-2">
              <span>United Kingdom — Unit 29 Integra:ME, Parkwood Industrial Estate, Maidstone ME15 9GQ</span>
              <span>Ukraine — Kraynya st. 1, Kyiv 02217</span>
              <span className="break-words">Email: ir.chip.com.ua@gmail.com · Instagram: @ir_chip</span>
              <span>Schedule: Mon–Fri 10:00–19:00, Sat by appointment, Sun closed</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
