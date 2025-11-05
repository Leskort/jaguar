"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check if authenticated
    fetch("/api/admin/check-auth")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          setIsAuth(true);
        }
      })
      .catch(() => router.push("/admin/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (!isAuth) return null;

  return (
    <div className="container-padded mx-auto max-w-6xl py-6 sm:py-12 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">{t('adminPanel')}</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded border border-red-300 text-red-600 text-sm hover:bg-red-50 w-full sm:w-auto"
        >
          {t('logout')}
        </button>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <Link
          href="/admin/vehicles"
          className="rounded-2xl border border-[var(--border-color)] p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">{t('manageVehicles')}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t('addEditOrRemoveVehicles')}
          </p>
        </Link>

        <Link
          href="/admin/services"
          className="rounded-2xl border border-[var(--border-color)] p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">{t('manageServices')}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t('addEditOrRemoveServices')}
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="rounded-2xl border border-[var(--border-color)] p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">{t('viewOrders')}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t('viewAndManageOrders')}
          </p>
        </Link>
      </div>
    </div>
  );
}
