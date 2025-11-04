export default function CarProjectsPage() {
  return (
    <section className="container-padded mx-auto max-w-6xl py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Car Projects</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">Gallery-style project layout coming soon.</p>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-video rounded-xl bg-silver/20" />
        ))}
      </div>
    </section>
  );
}





