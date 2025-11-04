import Link from "next/link";

export default function AccessoriesPage() {
  return (
    <div>
      {/* Hero Section with blurred car background */}
      <section className="relative min-h-[60dvh] flex items-center bg-[var(--space-black)] text-white">
        <div className="absolute inset-0 opacity-30 bg-[url('/window.svg')] bg-cover bg-center pointer-events-none" />
      </section>

      {/* Main Content */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Image on Left */}
          <div className="order-2 lg:order-1">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[var(--accent-gold)]">
              <div className="absolute inset-0 bg-silver/20 flex items-center justify-center">
                <span className="text-zinc-400 text-sm">Accessories Image</span>
              </div>
            </div>
          </div>

          {/* Text on Right */}
          <div className="order-1 lg:order-2">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 uppercase">Other Services and Accessories</h1>
            <div className="space-y-4 text-base sm:text-lg text-zinc-700 dark:text-zinc-300">
              <p>
                We continuously develop new services for LAND ROVER, JAGUAR brand:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Exterior tuning, styling, restyling.</li>
                <li>Services for the sale and installation of factory accessories (electrically deployable side steps, tow bars, mud flaps, etc.).</li>
                <li>Services for the installation of various electronic anti-theft security systems.</li>
                <li>Installation of more advanced braking systems.</li>
                <li>Binding, replacement or updating of different LAND ROVER, JAGUAR electronic modules.</li>
                <li>Adapting vehicles from other markets to the European one (installing navigation maps, adjusting radio frequencies, replacing front and rear lights, replacing charging sockets for electric vehicles, adjusting or replacing instrument clusters, changing service intervals, etc.).</li>
              </ul>
              <p className="mt-6">
                You can view services by choosing a vehicle model.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-block px-8 py-4 rounded-lg bg-[var(--accent-gold)] text-black font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                GET AN OFFER
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative min-h-[40dvh] flex items-center justify-center bg-[var(--space-black)] text-white">
        <div className="absolute inset-0 opacity-30 bg-[url('/window.svg')] bg-cover bg-center pointer-events-none" />
        <div className="relative z-10">
          <Link
            href="/contact"
            className="inline-block px-8 py-4 rounded-lg bg-[var(--accent-gold)] text-black font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            GET AN OFFER
          </Link>
        </div>
      </section>
    </div>
  );
}


