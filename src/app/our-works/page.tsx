export default function OurWorksPage() {
  return (
    <section className="container-padded mx-auto max-w-6xl py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Our Works</h1>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <article key={i} className="rounded-2xl border border-[var(--border-color)] overflow-hidden">
            <div className="h-48 bg-silver/20" />
            <div className="p-4 text-sm font-medium">Project #{i + 1}</div>
          </article>
        ))}
      </div>
      <div className="mt-10 flex items-center justify-center">
        <button className="h-12 px-6 rounded-full bg-[var(--accent-gold)] text-black font-medium">GET AN OFFER</button>
      </div>
    </section>
  );
}






