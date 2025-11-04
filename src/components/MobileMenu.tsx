"use client";
import Link from "next/link";
import { useState } from "react";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

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
            className={`fixed top-16 left-0 right-0 bg-white border-b border-[var(--border-color)] z-50 md:hidden transition-transform duration-300 ${
              isOpen ? "translate-y-0" : "-translate-y-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container-padded mx-auto py-4">
              <div className="flex flex-col gap-4">
                <Link
                  href="/vehicles"
                  className="text-sm font-medium hover:text-[var(--accent-gold)] transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  VEHICLES
                </Link>
                <Link
                  href="/our-works"
                  className="text-sm font-medium hover:text-[var(--accent-gold)] transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  OUR WORKS
                </Link>
                <Link
                  href="/car-projects"
                  className="text-sm font-medium hover:text-[var(--accent-gold)] transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  CAR PROJECTS
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium hover:text-[var(--accent-gold)] transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  CONTACTS
                </Link>
                <div className="border-t border-[var(--border-color)] pt-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <a
                      href="tel:+447840000321"
                      className="text-sm font-medium hover:text-[var(--accent-gold)] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      0784 0000 321
                    </a>
                    <a
                      href="tel:+441622801501"
                      className="text-sm font-medium hover:text-[var(--accent-gold)] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      01622 801 501
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}

