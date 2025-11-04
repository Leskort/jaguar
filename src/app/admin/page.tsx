"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
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
    <div className="container-padded mx-auto max-w-6xl py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded border border-red-300 text-red-600 text-sm hover:bg-red-50"
        >
          Logout
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/admin/vehicles"
          className="rounded-2xl border border-[var(--border-color)] p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Vehicles</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add, edit, or remove vehicles from the catalog
          </p>
        </Link>

        <Link
          href="/admin/services"
          className="rounded-2xl border border-[var(--border-color)] p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Services</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add, edit, or remove service cards for vehicles
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="rounded-2xl border border-[var(--border-color)] p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">View Orders</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            View and manage customer orders
          </p>
        </Link>
      </div>
    </div>
  );
}
