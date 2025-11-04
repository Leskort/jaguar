import type { Metadata } from "next";
import Link from "next/link";
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
          <nav className="container-padded mx-auto flex h-16 items-center justify-between">
            <Link href="/" className="font-medium tracking-tight">LR-CHIP</Link>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <Link href="/vehicles" className="hover:opacity-80">VEHICLES</Link>
              <Link href="/our-works" className="hover:opacity-80">OUR WORKS</Link>
              <Link href="/car-projects" className="hover:opacity-80">CAR PROJECTS</Link>
              <Link href="/contact" className="hover:opacity-80">CONTACTS</Link>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              <a href="tel:+447840000321" className="hover:opacity-80">0784 0000 321</a>
              <a href="tel:+441622801501" className="hover:opacity-80">01622 801 501</a>
            </div>
          </nav>
        </header>
        <main className="min-h-[calc(100dvh-112px)]">{children}</main>
        <footer className="border-t border-[var(--border-color)]">
          <div className="container-padded mx-auto py-10 text-sm text-zinc-600">
            <div className="flex flex-col gap-2">
              <span>United Kingdom — Unit 29 Integra:ME, Parkwood Industrial Estate, Maidstone ME15 9GQ</span>
              <span>Ukraine — Kraynya st. 1, Kyiv 02217</span>
              <span>Email: ir.chip.com.ua@gmail.com · Instagram: @ir_chip</span>
              <span>Schedule: Mon–Fri 10:00–19:00, Sat by appointment, Sun closed</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
