import Link from "next/link";

export default function PowerUpgradePage() {
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
                <span className="text-zinc-400 text-sm">Power Upgrade Image</span>
              </div>
            </div>
          </div>

          {/* Text on Right */}
          <div className="order-1 lg:order-2">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 uppercase">Power Upgrade</h1>
            <div className="space-y-4 text-base sm:text-lg text-zinc-700 dark:text-zinc-300">
              <p>
                Manufacturers release vehicles with varying power characteristics due to market preferences. The same engine can have different power outputs in different markets.
              </p>
              <p>
                Factory power software is available for most models. Before applying factory power software, we perform technical checks of: engine, boost system, fuel/injection, cooling, intake, exhaust, emission, gearbox, transfer box, drive shafts, differentials, and brake system.
              </p>
              <p>
                For proven reliable engines, we also offer non-factory power software (Stage 1 and Stage 2 upgrades).
              </p>
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



