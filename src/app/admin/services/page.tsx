"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type ServiceOption = {
  title: string;
  image: string;
  price: string;
  requirements: string;
  description: string;
  status?: "in-stock" | "unavailable" | "coming-soon";
};

type Vehicle = {
  brand: string;
  value: string;
  title: string;
  image: string;
  years: Array<{ value: string; label: string }>;
};

type ServiceWithVehicle = ServiceOption & {
  brand: string;
  model: string;
  year: string;
  category: string;
  index: number;
};

export default function ServicesAdminPage() {
  const [services, setServices] = useState<any>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("land-rover");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("features-activation");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "filtered">("all");
  const [filterBrand, setFilterBrand] = useState<"all" | "land-rover" | "jaguar">("all");
  const [filterModel, setFilterModel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<ServiceOption>({
    title: "",
    image: "",
    price: "",
    requirements: "No",
    description: "",
    status: "in-stock",
  });

  useEffect(() => {
    loadServices();
    loadVehicles();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const res = await fetch("/api/admin/vehicles");
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    }
  };

  // Get available models from vehicles (not from services)
  const availableVehicles = vehicles.filter(v => v.brand === selectedBrand);
  const selectedVehicle = availableVehicles.find(v => v.value === selectedModel);
  const availableYears = selectedVehicle?.years || [];

  // Get services data for selected vehicle
  const brandData = services[selectedBrand];
  const modelData = brandData?.[selectedModel];
  const yearData = modelData?.[selectedYear] as Record<string, ServiceOption[]> | undefined;
  const availableCategories = yearData ? Object.keys(yearData) : [];

  // Collect all services with vehicle information
  const getAllServices = (): ServiceWithVehicle[] => {
    const allServices: ServiceWithVehicle[] = [];
    
    if (services && typeof services === 'object' && !Array.isArray(services)) {
      for (const brand in services) {
        if (services[brand] && typeof services[brand] === 'object') {
          for (const model in services[brand]) {
            if (services[brand][model] && typeof services[brand][model] === 'object') {
              for (const year in services[brand][model]) {
                if (services[brand][model][year] && typeof services[brand][model][year] === 'object') {
                  for (const category in services[brand][model][year]) {
                    const serviceArray = services[brand][model][year][category];
                    if (Array.isArray(serviceArray)) {
                      serviceArray.forEach((service: ServiceOption, index: number) => {
                        allServices.push({
                          ...service,
                          brand,
                          model,
                          year,
                          category,
                          index,
                        });
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return allServices;
  };

  const allServices = getAllServices();

  // Filter all services
  const filteredAllServices = allServices.filter((service) => {
    if (filterBrand !== "all" && service.brand !== filterBrand) return false;
    if (filterModel !== "all" && service.model !== filterModel) return false;
    if (searchQuery && !service.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Get vehicle title by model value
  const getVehicleTitle = (brand: string, modelValue: string): string => {
    const vehicle = vehicles.find(v => v.brand === brand && v.value === modelValue);
    return vehicle?.title || modelValue;
  };

  const categoryLabels: Record<string, string> = {
    "features-activation": "Features Activation",
    "retrofits": "Retrofits",
    "power-upgrade": "Power Upgrade",
    "accessories": "Accessories",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingIndex !== null) {
        // Update existing service
        await fetch("/api/admin/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: selectedBrand,
            model: selectedModel,
            year: selectedYear,
            category: selectedCategory,
            index: editingIndex,
            service: formData,
          }),
        });
      } else {
        // Add new service
        await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: selectedBrand,
            model: selectedModel,
            year: selectedYear,
            category: selectedCategory,
            service: formData,
          }),
        });
      }
      await loadServices();
      setFormData({
        title: "",
        image: "",
        price: "",
        requirements: "No",
        description: "",
        status: "in-stock",
      });
      setShowAddForm(false);
      setEditingIndex(null);
    } catch (error) {
      alert("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-padded mx-auto max-w-6xl py-12">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-padded mx-auto max-w-6xl py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Manage Services</h1>
        <Link href="/admin" className="text-sm text-zinc-600 hover:underline">← Back to Admin</Link>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex gap-4 items-center">
        <button
          onClick={() => setViewMode("all")}
          className={`px-4 py-2 rounded border ${
            viewMode === "all"
              ? "bg-[var(--accent-gold)] text-black border-[var(--accent-gold)]"
              : "border-[var(--border-color)]"
          }`}
        >
          All Services ({allServices.length})
        </button>
        <button
          onClick={() => setViewMode("filtered")}
          className={`px-4 py-2 rounded border ${
            viewMode === "filtered"
              ? "bg-[var(--accent-gold)] text-black border-[var(--accent-gold)]"
              : "border-[var(--border-color)]"
          }`}
        >
          Add/Edit Services
        </button>
      </div>

      {/* All Services View */}
      {viewMode === "all" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 flex-wrap items-center">
            <select
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value as "all" | "land-rover" | "jaguar");
                setFilterModel("all");
              }}
              className="h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
            >
              <option value="all">All Brands</option>
              <option value="land-rover">Land Rover</option>
              <option value="jaguar">Jaguar</option>
            </select>

            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
              disabled={filterBrand === "all"}
            >
              <option value="all">All Models</option>
              {filterBrand !== "all" &&
                vehicles
                  .filter((v) => v.brand === filterBrand)
                  .map((vehicle) => (
                    <option key={vehicle.value} value={vehicle.value}>
                      {vehicle.title}
                    </option>
                  ))}
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title..."
              className="h-10 rounded border border-[var(--border-color)] px-4 bg-transparent flex-1 min-w-[200px]"
            />
          </div>

          {/* Services Table */}
          <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Service</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                        {allServices.length === 0
                          ? "No services found. Add services using the 'Add/Edit Services' view."
                          : "No services match your filters."}
                      </td>
                    </tr>
                  ) : (
                    filteredAllServices.map((service, idx) => (
                      <tr key={`${service.brand}-${service.model}-${service.year}-${service.category}-${service.index}`} className="border-t border-[var(--border-color)] hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{service.title}</div>
                          {service.description && (
                            <div className="text-xs text-zinc-500 mt-1 line-clamp-1">
                              {service.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-medium capitalize">{service.brand.replace("-", " ")}</div>
                            <div className="text-xs text-zinc-500">
                              {getVehicleTitle(service.brand, service.model)} / {service.year}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                            {categoryLabels[service.category] || service.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{service.price}</td>
                        <td className="px-4 py-3">
                          {service.status === "in-stock" && (
                            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              IN STOCK
                            </span>
                          )}
                          {service.status === "unavailable" && (
                            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              UNAVAILABLE
                            </span>
                          )}
                          {service.status === "coming-soon" && (
                            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              COMING SOON
                            </span>
                          )}
                          {!service.status && (
                            <span className="text-xs px-2 py-1 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                              No status
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedBrand(service.brand);
                                setSelectedModel(service.model);
                                setSelectedYear(service.year);
                                setSelectedCategory(service.category);
                                setFormData(service);
                                setEditingIndex(service.index);
                                setShowAddForm(true);
                                setViewMode("filtered");
                              }}
                              className="px-3 py-1 text-xs rounded border border-[var(--border-color)] hover:bg-zinc-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Are you sure you want to delete "${service.title}"?`)) return;
                                
                                try {
                                  await fetch("/api/admin/services", {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      brand: service.brand,
                                      model: service.model,
                                      year: service.year,
                                      category: service.category,
                                      index: service.index,
                                    }),
                                  });
                                  await loadServices();
                                } catch (error) {
                                  alert("Failed to delete service");
                                }
                              }}
                              className="px-3 py-1 text-xs rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Services View */}
      {viewMode === "filtered" && (
        <>

      <div className="mb-6 flex gap-4 flex-wrap">
        <select
          value={selectedBrand}
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            setSelectedModel("");
            setSelectedYear("");
          }}
          className="h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
        >
          <option value="land-rover">Land Rover</option>
          <option value="jaguar">Jaguar</option>
        </select>

        <select
          value={selectedModel}
          onChange={(e) => {
            setSelectedModel(e.target.value);
            setSelectedYear("");
          }}
          className="h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
          disabled={availableVehicles.length === 0}
        >
          <option value="">Select Model</option>
          {availableVehicles.map((vehicle) => (
            <option key={vehicle.value} value={vehicle.value}>
              {vehicle.title}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            const newYearData = modelData?.[e.target.value] as Record<string, ServiceOption[]> | undefined;
            const newCategories = newYearData ? Object.keys(newYearData) : [];
            setSelectedCategory(newCategories[0] || "features-activation");
          }}
          className="h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
          disabled={availableYears.length === 0}
        >
          <option value="">Select Year</option>
          {availableYears.map((year, index) => (
            <option key={index} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
        >
          <option value="">Select Category</option>
          <option value="features-activation">Features Activation</option>
          <option value="retrofits">Retrofits</option>
          <option value="power-upgrade">Power Upgrade</option>
          <option value="accessories">Accessories</option>
        </select>

        {selectedModel && selectedYear && selectedCategory && (
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingIndex(null);
              setFormData({
                title: "",
                image: "",
                price: "",
                requirements: "No",
                description: "",
                status: "in-stock",
              });
            }}
            className="px-6 py-2 rounded-full bg-[var(--accent-gold)] text-black font-medium"
          >
            + Add Service
          </button>
        )}
      </div>

      {availableVehicles.length === 0 && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
          No vehicles found for {selectedBrand}. Please add vehicles first in <Link href="/admin/vehicles" className="underline font-medium">Manage Vehicles</Link>.
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-[var(--border-color)] p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingIndex !== null ? "Edit" : "Add"} Service to {selectedBrand} / {selectedModel} / {selectedYear} / {selectedCategory}
          </h2>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
                placeholder="DYNAMIC MODE"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
                placeholder="/services/dynamic-mode.jpg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
                placeholder="£150"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Requirements</label>
              <select
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
                required
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status (Optional)</label>
              <select
                value={formData.status || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    status: value === "" ? undefined : value as "in-stock" | "unavailable" | "coming-soon"
                  });
                }}
                className="w-full h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
              >
                <option value="">No Status</option>
                <option value="in-stock">IN STOCK</option>
                <option value="unavailable">UNAVAILABLE</option>
                <option value="coming-soon">COMING SOON</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-24 rounded border border-[var(--border-color)] px-4 py-2 bg-transparent"
                placeholder="Factory dynamic program activation for enhanced driving experience."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-full bg-[var(--accent-gold)] text-black font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : editingIndex !== null ? "Update Service" : "Add Service"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingIndex(null);
                  setFormData({
                    title: "",
                    image: "",
                    price: "",
                    requirements: "No",
                    description: "",
                    status: "in-stock",
                  });
                }}
                className="px-6 py-2 rounded border border-[var(--border-color)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Display existing services for selected vehicle */}
      {yearData && selectedCategory && yearData[selectedCategory] && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Existing Services ({yearData[selectedCategory].length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yearData[selectedCategory].map((service, index) => (
              <div key={index} className="rounded-xl border border-[var(--border-color)] overflow-hidden bg-white">
                <div className="relative h-32 bg-silver/20">
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  {service.status && (
                    <>
                      {service.status === "in-stock" && (
                        <div className="absolute bottom-2 right-2 bg-[var(--accent-gold)] text-black px-2 py-1 rounded text-xs font-bold">
                          IN STOCK
                        </div>
                      )}
                      {(service.status === "unavailable" || service.status === "coming-soon") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="text-sm font-bold text-white uppercase">
                            {service.status === "coming-soon" ? "COMING SOON" : "UNAVAILABLE"}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-medium text-sm mb-2">{service.title}</div>
                  <div className="text-xs text-zinc-500 mb-1">
                    Requirements: {service.requirements}
                  </div>
                  <div className="text-lg font-semibold mb-3">{service.price}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(service);
                        setEditingIndex(index);
                        setShowAddForm(true);
                      }}
                      className="flex-1 px-4 py-2 rounded border border-[var(--border-color)] text-sm hover:bg-zinc-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Are you sure you want to delete "${service.title}"?`)) return;
                        
                        try {
                          await fetch("/api/admin/services", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              brand: selectedBrand,
                              model: selectedModel,
                              year: selectedYear,
                              category: selectedCategory,
                              index,
                            }),
                          });
                          await loadServices();
                        } catch (error) {
                          alert("Failed to delete service");
                        }
                      }}
                      className="flex-1 px-4 py-2 rounded border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
