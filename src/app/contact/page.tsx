export default function ContactPage() {
  return (
    <section className="container-padded mx-auto max-w-6xl py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-color)] p-6">
          <h2 className="text-xl font-medium">United Kingdom</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Unit 29 Integra:ME, Parkwood Industrial Estate, Maidstone ME15 9GQ</p>
          <a href="tel:+447840000321" className="mt-3 inline-block text-sm hover:opacity-80">+44 784 0000 321</a>
        </div>
        <div className="rounded-2xl border border-[var(--border-color)] p-6">
          <h2 className="text-xl font-medium">Ukraine</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Kraynya st. 1, Kyiv 02217</p>
          <a href="tel:+380670000321" className="mt-3 inline-block text-sm hover:opacity-80">+38 067 0000 321</a>
        </div>
      </div>
      <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">Secure callback form with encrypted submission coming soon.</p>
    </section>
  );
}



