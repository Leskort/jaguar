"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

type Vehicle = {
  brand: string;
  value: string;
  title: string;
  image: string;
  years: Array<{ value: string; label: string }>;
  order?: number;
};

export default function VehiclesAdminPage() {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  const [formData, setFormData] = useState<Vehicle>({
    brand: "land-rover",
    value: "",
    title: "",
    image: "",
    years: [{ value: "", label: "" }],
  });

  useEffect(() => {
    loadVehicles();
    
    // Auto-refresh every 10 seconds (silently, without loading indicator)
    const interval = setInterval(() => {
      loadVehicles(false);
    }, 10000);
    
    // Refresh when window gains focus (silently)
    const handleFocus = () => {
      loadVehicles(false);
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    loadImages(formData.brand);
  }, [formData.brand]);

  const loadVehicles = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const res = await fetch("/api/admin/vehicles");
      const data = await res.json();
      const vehiclesArray = Array.isArray(data) ? data : [];
      
      // Only update if data actually changed
      setVehicles(prevVehicles => {
        const prevIds = prevVehicles.map((v, i) => `${i}-${v.brand}-${v.value}`).sort().join(',');
        const newIds = vehiclesArray.map((v, i) => `${i}-${v.brand}-${v.value}`).sort().join(',');
        if (prevIds !== newIds || prevVehicles.length !== vehiclesArray.length) {
          setRefreshKey(prev => prev + 1);
          return vehiclesArray;
        }
        return prevVehicles;
      });
      
      return vehiclesArray;
    } catch (error) {
      console.error("Failed to load vehicles:", error);
      if (showLoading) {
        setVehicles([]);
        setRefreshKey(prev => prev + 1);
      }
      return [];
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadImages = async (brand: string) => {
    setLoadingImages(true);
    try {
      const res = await fetch(`/api/admin/vehicle-images?brand=${brand}`);
      const data = await res.json();
      setAvailableImages(data.images || []);
    } catch (error) {
      console.error("Failed to load images:", error);
      setAvailableImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleAddYear = () => {
    setFormData({
      ...formData,
      years: [...formData.years, { value: "", label: "" }],
    });
  };

  const handleYearChange = (index: number, field: "value" | "label", val: string) => {
    const newYears = [...formData.years];
    newYears[index][field] = val;
    setFormData({ ...formData, years: newYears });
  };

  const handleRemoveYear = (index: number) => {
    setFormData({
      ...formData,
      years: formData.years.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate brand is set
      if (!formData.brand || formData.brand.trim() === "") {
      alert(t('pleaseSelectOrEnterBrand'));
      return;
    }
    
    setSaving(true);

    try {
      let response;
      if (editingIndex !== null) {
        response = await fetch("/api/admin/vehicles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index: editingIndex, vehicle: formData }),
        });
      } else {
        response = await fetch("/api/admin/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      
      if (!response.ok) {
        let errorData: any = {};
        let errorText = "";
        try {
          errorText = await response.text();
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || `HTTP ${response.status}` };
          }
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        const errorMsg = errorData.message || errorData.error || "Failed to save vehicle";
        console.error("[Vehicles Admin] Server error:", errorData);
        throw new Error(errorMsg);
      }
      
      // Reload vehicles to show updated data
      await loadVehicles();
      setFormData({
        brand: "land-rover",
        value: "",
        title: "",
        image: "",
        years: [{ value: "", label: "" }],
      });
      setShowAddForm(false);
      setEditingIndex(null);
    } catch (error) {
      console.error("[Vehicles Admin] Error saving vehicle:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save vehicle";
      alert(`Failed to save vehicle: ${errorMessage}\n\nCheck browser console and Netlify logs for details.`);
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === vehicles.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;

    try {
      const response = await fetch("/api/admin/vehicles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromIndex: index, toIndex: newIndex }),
      });
      
      if (!response.ok) {
        let errorData: any = {};
        try {
          const errorText = await response.text();
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || `HTTP ${response.status}` };
          }
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        const errorMsg = errorData.message || errorData.error || "Failed to move vehicle";
        throw new Error(errorMsg);
      }
      
      // Reload vehicles to show updated order
      await loadVehicles();
    } catch (error) {
      console.error("[Vehicles Admin] Error moving vehicle:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to move vehicle";
      alert(`Failed to move vehicle: ${errorMessage}\n\nCheck browser console and Netlify logs for details.`);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm(t('areYouSureDeleteVehicle'))) return;

    try {
      const response = await fetch("/api/admin/vehicles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      
      if (!response.ok) {
        let errorData: any = {};
        try {
          const errorText = await response.text();
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || `HTTP ${response.status}` };
          }
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        const errorMsg = errorData.message || errorData.error || "Failed to delete vehicle";
        throw new Error(errorMsg);
      }
      
      // Reload vehicles to show updated data
      await loadVehicles();
    } catch (error) {
      console.error("[Vehicles Admin] Error deleting vehicle:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete vehicle";
      alert(`Failed to delete vehicle: ${errorMessage}\n\nCheck browser console and Netlify logs for details.`);
    }
  };

  if (loading) {
    return (
      <div className="container-padded mx-auto max-w-6xl py-12">
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="container-padded mx-auto max-w-6xl py-6 sm:py-12 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">{t('manageVehicles')}</h1>
        <Link href="/admin" className="text-sm text-zinc-600 hover:underline w-full sm:w-auto text-center sm:text-left">{t('backToAdmin')}</Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setSelectedBrand("all")}
            className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              selectedBrand === "all"
                ? "bg-[var(--accent-gold)] text-black"
                : "border border-[var(--border-color)] hover:bg-white/5"
            }`}
          >
            {t('all')} ({vehicles.length})
          </button>
          {Array.from(new Set(vehicles.map(v => v.brand)))
            .sort((a, b) => {
              // Sort: land-rover first, jaguar second, then alphabetically
              if (a === "land-rover") return -1;
              if (b === "land-rover") return 1;
              if (a === "jaguar") return -1;
              if (b === "jaguar") return 1;
              return a.localeCompare(b);
            })
            .map(brand => {
              const count = vehicles.filter(v => v.brand === brand).length;
              const displayName = brand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    selectedBrand === brand
                      ? "bg-[var(--accent-gold)] text-black"
                      : "border border-[var(--border-color)] hover:bg-white/5"
                  }`}
                >
                  {displayName.toUpperCase()} ({count})
                </button>
              );
            })}
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingIndex(null);
            setFormData({
              brand: "land-rover",
              value: "",
              title: "",
              image: "",
              years: [{ value: "", label: "" }],
            });
          }}
          className="px-6 py-3 sm:py-2 rounded-full bg-[var(--accent-gold)] text-black font-medium text-base sm:text-sm w-full sm:w-auto"
        >
          + {t('addVehicle')}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-[var(--border-color)] p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{editingIndex !== null ? t('editVehicle') : t('addVehicle')}</h2>
          
          <div className="grid gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('brand')}</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={vehicles.some(v => v.brand === formData.brand) || formData.brand === "land-rover" || formData.brand === "jaguar" ? formData.brand : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData({ ...formData, brand: e.target.value, image: "" });
                      loadImages(e.target.value);
                    }
                  }}
                  className="flex-1 h-12 sm:h-10 rounded border border-[var(--border-color)] px-4 bg-transparent text-base sm:text-sm"
                >
                  <option value="">-- Select existing brand --</option>
                  <option value="land-rover">Land Rover</option>
                  <option value="jaguar">Jaguar</option>
                  {Array.from(new Set(vehicles.map(v => v.brand)))
                    .filter(b => b !== "land-rover" && b !== "jaguar")
                    .sort()
                    .map(brand => (
                      <option key={brand} value={brand}>{brand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))
                  }
                </select>
                <span className="self-center text-sm text-zinc-500 hidden sm:inline">or</span>
                <input
                  type="text"
                  value={vehicles.some(v => v.brand === formData.brand) || formData.brand === "land-rover" || formData.brand === "jaguar" ? "" : formData.brand}
                  onChange={(e) => {
                    const newBrand = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                    setFormData({ ...formData, brand: newBrand, image: "" });
                    if (newBrand) {
                      loadImages(newBrand);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value) {
                      const newBrand = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                      setFormData(prev => ({ ...prev, brand: newBrand }));
                      loadImages(newBrand);
                    }
                  }}
                  className="flex-1 h-12 sm:h-10 rounded border border-[var(--border-color)] px-4 bg-transparent text-base sm:text-sm"
                  placeholder="Enter new brand (e.g., range-rover)"
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">Select existing brand from dropdown or enter a new one (lowercase with hyphens)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('vehicleValue')} (e.g., discovery-5-l462)</label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full h-12 sm:h-10 rounded border border-[var(--border-color)] px-4 bg-transparent text-base sm:text-sm"
                placeholder="discovery-5-l462"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('vehicleTitle')} (e.g., DISCOVERY 5 / L462)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-12 sm:h-10 rounded border border-[var(--border-color)] px-4 bg-transparent text-base sm:text-sm"
                placeholder="DISCOVERY 5 / L462"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('selectImage')}</label>
              {loadingImages ? (
                <div className="text-sm text-zinc-500">{t('loadingImages')}</div>
              ) : availableImages.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full h-12 sm:h-10 rounded border border-[var(--border-color)] px-4 bg-transparent text-base sm:text-sm"
                    required
                  >
                    <option value="">-- Select an image --</option>
                    {availableImages.map((imgPath) => {
                      const fileName = imgPath.split("/").pop() || imgPath;
                      return (
                        <option key={imgPath} value={imgPath}>
                          {fileName}
                        </option>
                      );
                    })}
                  </select>
                  {formData.image && (
                    <div className="mt-2">
                      <div className="text-xs text-zinc-500 mb-2">Preview:</div>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[var(--border-color)] bg-silver/10">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">{formData.image}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-zinc-500">
                  No images found in /vehicles/{formData.brand}/
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('years')}</label>
              {formData.years.map((year, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={year.value}
                    onChange={(e) => handleYearChange(index, "value", e.target.value)}
                    className="flex-1 h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
                    placeholder="2017-2020"
                    required
                  />
                  <input
                    type="text"
                    value={year.label}
                    onChange={(e) => handleYearChange(index, "label", e.target.value)}
                    className="flex-1 h-10 rounded border border-[var(--border-color)] px-4 bg-transparent"
                    placeholder="2017–2020"
                    required
                  />
                  {formData.years.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveYear(index)}
                      className="px-4 py-2 rounded border border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {t('removeYear')}
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddYear}
                className="mt-2 text-sm text-[var(--accent-gold)] hover:underline"
              >
                + {t('addYear')}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-full bg-[var(--accent-gold)] text-black font-medium disabled:opacity-50"
              >
                {saving ? t('saving') : editingIndex !== null ? t('save') : t('addVehicle')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingIndex(null);
                }}
                className="px-6 py-2 rounded border border-[var(--border-color)]"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </form>
      )}

      {(() => {
        const filteredVehicles = selectedBrand === "all"
          ? vehicles
          : vehicles.filter(v => v.brand === selectedBrand);

        // Group vehicles by brand when showing all
        if (selectedBrand === "all") {
          // Get all unique brands, sorted
          const allBrands = Array.from(new Set(vehicles.map(v => v.brand))).sort((a, b) => {
            // Sort: land-rover first, jaguar second, then alphabetically
            if (a === "land-rover") return -1;
            if (b === "land-rover") return 1;
            if (a === "jaguar") return -1;
            if (b === "jaguar") return 1;
            return a.localeCompare(b);
          });

          return (
            <div className="space-y-8">
              {allBrands.map(brand => {
                const brandVehicles = vehicles.filter(v => v.brand === brand);
                const displayName = brand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                return (
                  <div key={`${brand}-${refreshKey}`}>
                    <h2 className="text-xl font-semibold mb-4 text-[var(--accent-gold)]">
                      {displayName.toUpperCase()} ({brandVehicles.length})
                    </h2>
                    <div className="space-y-4" key={`${brand}-list-${refreshKey}`}>
                      {brandVehicles.map((vehicle, localIndex) => {
                        const globalIndex = vehicles.findIndex(v => v === vehicle);
                        return (
                          <div key={`${globalIndex}-${refreshKey}`} className="rounded-2xl border border-[var(--border-color)] p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleMove(globalIndex, "up")}
                                  disabled={globalIndex === 0 || vehicles[globalIndex - 1]?.brand !== brand}
                                  className="px-2 py-1 rounded border border-[var(--border-color)] text-xs hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={t('moveUp')}
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => handleMove(globalIndex, "down")}
                                  disabled={globalIndex === vehicles.length - 1 || vehicles[globalIndex + 1]?.brand !== brand}
                                  className="px-2 py-1 rounded border border-[var(--border-color)] text-xs hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={t('moveDown')}
                                >
                                  ↓
                                </button>
                              </div>
                              {vehicle.image && (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border-color)] bg-silver/20 flex-shrink-0">
                                  <Image
                                    src={vehicle.image}
                                    alt={vehicle.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{vehicle.title}</div>
                                <div className="text-sm text-zinc-600">
                                  {vehicle.brand} / {vehicle.value} / {vehicle.years.map((y) => y.label).join(", ")}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFormData(vehicle);
                                  setEditingIndex(globalIndex);
                                  setShowAddForm(true);
                                }}
                                className="px-4 py-2 rounded border border-[var(--border-color)] text-sm hover:bg-zinc-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(globalIndex)}
                                className="px-4 py-2 rounded border border-red-300 text-red-600 text-sm hover:bg-red-50"
                              >
                                {t('delete')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        // Filtered view (single brand)
        return (
          <div className="space-y-4" key={`filtered-${refreshKey}`}>
            {filteredVehicles.map((vehicle, localIndex) => {
              const globalIndex = vehicles.findIndex(v => v === vehicle);
              return (
                <div key={`${globalIndex}-${refreshKey}`} className="rounded-2xl border border-[var(--border-color)] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMove(globalIndex, "up")}
                        disabled={globalIndex === 0}
                        className="px-2 py-1 rounded border border-[var(--border-color)] text-xs hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMove(globalIndex, "down")}
                        disabled={globalIndex === vehicles.length - 1}
                        className="px-2 py-1 rounded border border-[var(--border-color)] text-xs hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                    {vehicle.image && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border-color)] bg-silver/20 flex-shrink-0">
                        <Image
                          src={vehicle.image}
                          alt={vehicle.title}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{vehicle.title}</div>
                      <div className="text-sm text-zinc-600">
                        {vehicle.brand} / {vehicle.value} / {vehicle.years.map((y) => y.label).join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setFormData(vehicle);
                        setEditingIndex(globalIndex);
                        setShowAddForm(true);
                      }}
                      className="px-4 py-2 rounded border border-[var(--border-color)] text-sm hover:bg-zinc-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(globalIndex)}
                      className="px-4 py-2 rounded border border-red-300 text-red-600 text-sm hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
