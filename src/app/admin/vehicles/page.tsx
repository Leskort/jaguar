"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Vehicle = {
  brand: string;
  value: string;
  title: string;
  image: string;
  years: Array<{ value: string; label: string }>;
  order?: number;
};

export default function VehiclesAdminPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<"all" | "land-rover" | "jaguar">("all");

  const [formData, setFormData] = useState<Vehicle>({
    brand: "land-rover",
    value: "",
    title: "",
    image: "",
    years: [{ value: "", label: "" }],
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    loadImages(formData.brand);
  }, [formData.brand]);

  const loadVehicles = async () => {
    try {
      const res = await fetch("/api/admin/vehicles");
      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    } finally {
      setLoading(false);
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
    setSaving(true);

    try {
      if (editingIndex !== null) {
        await fetch("/api/admin/vehicles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index: editingIndex, vehicle: formData }),
        });
      } else {
        await fetch("/api/admin/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
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
      alert("Failed to save vehicle");
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === vehicles.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;

    try {
      await fetch("/api/admin/vehicles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromIndex: index, toIndex: newIndex }),
      });
      await loadVehicles();
    } catch (error) {
      alert("Failed to move vehicle");
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await fetch("/api/admin/vehicles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      await loadVehicles();
    } catch (error) {
      alert("Failed to delete vehicle");
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
    <div className="container-padded mx-auto max-w-6xl py-6 sm:py-12 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">Manage Vehicles</h1>
        <Link href="/admin" className="text-sm text-zinc-600 hover:underline w-full sm:w-auto text-center sm:text-left">← Back to Admin</Link>
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
            ALL ({vehicles.length})
          </button>
          <button
            onClick={() => setSelectedBrand("land-rover")}
            className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              selectedBrand === "land-rover"
                ? "bg-[var(--accent-gold)] text-black"
                : "border border-[var(--border-color)] hover:bg-white/5"
            }`}
          >
            LAND ROVER ({vehicles.filter(v => v.brand === "land-rover").length})
          </button>
          <button
            onClick={() => setSelectedBrand("jaguar")}
            className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              selectedBrand === "jaguar"
                ? "bg-[var(--accent-gold)] text-black"
                : "border border-[var(--border-color)] hover:bg-white/5"
            }`}
          >
            JAGUAR ({vehicles.filter(v => v.brand === "jaguar").length})
          </button>
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
          + Add Vehicle
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-[var(--border-color)] p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{editingIndex !== null ? "Edit" : "Add"} Vehicle</h2>
          
          <div className="grid gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => {
                  setFormData({ ...formData, brand: e.target.value, image: "" });
                  loadImages(e.target.value);
                }}
                className="w-full h-12 sm:h-10 rounded border border-[var(--border-color)] px-4 bg-transparent text-base sm:text-sm"
                required
              >
                <option value="land-rover">Land Rover</option>
                <option value="jaguar">Jaguar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Model Slug (e.g., discovery-5-l462)</label>
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
              <label className="block text-sm font-medium mb-2">Display Title (e.g., DISCOVERY 5 / L462)</label>
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
              <label className="block text-sm font-medium mb-2">Select Image</label>
              {loadingImages ? (
                <div className="text-sm text-zinc-500">Loading images...</div>
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
              <label className="block text-sm font-medium mb-2">Years</label>
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
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddYear}
                className="mt-2 text-sm text-[var(--accent-gold)] hover:underline"
              >
                + Add Year
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-full bg-[var(--accent-gold)] text-black font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : editingIndex !== null ? "Update" : "Add"} Vehicle
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingIndex(null);
                }}
                className="px-6 py-2 rounded border border-[var(--border-color)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {(() => {
        const filteredVehicles = selectedBrand === "all"
          ? vehicles
          : vehicles.filter(v => v.brand === selectedBrand);

        const landRoverVehicles = vehicles.filter(v => v.brand === "land-rover");
        const jaguarVehicles = vehicles.filter(v => v.brand === "jaguar");

        // Group vehicles by brand when showing all
        if (selectedBrand === "all") {
          return (
            <div className="space-y-8">
              {/* Land Rover Section */}
              {landRoverVehicles.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-[var(--accent-gold)]">
                    LAND ROVER ({landRoverVehicles.length})
                  </h2>
                  <div className="space-y-4">
                    {landRoverVehicles.map((vehicle, localIndex) => {
                      const globalIndex = vehicles.findIndex(v => v === vehicle);
                      return (
                        <div key={globalIndex} className="rounded-2xl border border-[var(--border-color)] p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMove(globalIndex, "up")}
                                disabled={globalIndex === 0 || vehicles[globalIndex - 1]?.brand !== "land-rover"}
                                className="px-2 py-1 rounded border border-[var(--border-color)] text-xs hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => handleMove(globalIndex, "down")}
                                disabled={globalIndex === vehicles.length - 1 || vehicles[globalIndex + 1]?.brand !== "land-rover"}
                                className="px-2 py-1 rounded border border-[var(--border-color)] text-xs hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move down"
                              >
                                ↓
                              </button>
                            </div>
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
                </div>
              )}

              {/* Jaguar Section */}
              {jaguarVehicles.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-[var(--accent-gold)]">
                    JAGUAR ({jaguarVehicles.length})
                  </h2>
                  <div className="space-y-4">
                    {jaguarVehicles.map((vehicle, localIndex) => {
                      const globalIndex = vehicles.findIndex(v => v === vehicle);
                      return (
                        <div key={globalIndex} className="rounded-2xl border border-[var(--border-color)] p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMove(globalIndex, "up")}
                                disabled={globalIndex === 0 || vehicles[globalIndex - 1]?.brand !== "jaguar"}
                                className="px-2 py-1 rounded border border-[var(--border-color)] text-xs hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => handleMove(globalIndex, "down")}
                                disabled={globalIndex === vehicles.length - 1 || vehicles[globalIndex + 1]?.brand !== "jaguar"}
                                className="px-2 py-1 rounded border border-[var(--border-color)] text-xs hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move down"
                              >
                                ↓
                              </button>
                            </div>
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
                </div>
              )}
            </div>
          );
        }

        // Filtered view (single brand)
        return (
          <div className="space-y-4">
            {filteredVehicles.map((vehicle, localIndex) => {
              const globalIndex = vehicles.findIndex(v => v === vehicle);
              return (
                <div key={globalIndex} className="rounded-2xl border border-[var(--border-color)] p-4 flex items-center justify-between">
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
