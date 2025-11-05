"use client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 border border-[var(--border-color)] rounded-full px-1 py-1 bg-white dark:bg-[var(--space-black)]">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors min-h-[32px] sm:min-h-0 ${
          language === 'en'
            ? 'bg-[var(--accent-gold)] text-black'
            : 'text-[var(--foreground)] hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ru')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors min-h-[32px] sm:min-h-0 ${
          language === 'ru'
            ? 'bg-[var(--accent-gold)] text-black'
            : 'text-[var(--foreground)] hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        RU
      </button>
    </div>
  );
}

