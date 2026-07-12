import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../lib/api";
import { ArrowLeft, Package } from "lucide-react";

const CONDITIONS = ["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"] as const;

export default function RegisterAssetPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    newCategoryName: "",
    serialNumber: "",
    acquisitionDate: "",
    acquisitionCost: "",
    condition: "GOOD",
    location: "",
    departmentId: "",
    newDepartmentName: "",
    isBookable: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch categories for the dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.data),
  });

  // Fetch departments for the dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get("/departments").then((r) => r.data.data),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalCategoryId = form.categoryId;
      if (form.categoryId === "NEW") {
        const catRes = await api.post("/categories", { name: form.newCategoryName });
        finalCategoryId = catRes.data.data.id;
      }

      let finalDeptId = form.departmentId;
      if (form.departmentId === "NEW") {
        const deptRes = await api.post("/departments", { name: form.newDepartmentName });
        finalDeptId = deptRes.data.data.id;
      }

      const payload: Record<string, any> = {
        name: form.name,
        categoryId: finalCategoryId,
        condition: form.condition,
        isBookable: form.isBookable,
      };
      if (form.serialNumber)     payload.serialNumber     = form.serialNumber;
      if (form.acquisitionDate)  payload.acquisitionDate  = new Date(form.acquisitionDate).toISOString();
      if (form.acquisitionCost)  payload.acquisitionCost  = parseFloat(form.acquisitionCost);
      if (form.location)         payload.location         = form.location;
      if (finalDeptId && finalDeptId !== "NEW") payload.departmentId = finalDeptId;

      await api.post("/assets", payload);
      toast.success("Asset registered successfully!");
      navigate("/assets");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to register asset.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => navigate("/assets")}
          className="btn-secondary"
          style={{ padding: "0.5rem" }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Register New Asset
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.2rem" }}>
            Add a new asset to the organization's inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Asset Name */}
          <div>
            <label className="label">Asset Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Dell Latitude 5540"
              required
              minLength={2}
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category <span style={{ color: "var(--danger)" }}>*</span></label>
            <select
              className="select"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">— Select a category —</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="NEW">+ Add New Category</option>
            </select>
            {form.categoryId === "NEW" && (
              <input
                className="input"
                style={{ marginTop: "0.5rem" }}
                name="newCategoryName"
                value={form.newCategoryName}
                onChange={handleChange}
                placeholder="Enter new category name..."
                required
              />
            )}
          </div>

          {/* Department */}
          <div>
            <label className="label">Department (optional)</label>
            <select
              className="select"
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
            >
              <option value="">— No department —</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
              <option value="NEW">+ Add New Department</option>
            </select>
            {form.departmentId === "NEW" && (
              <input
                className="input"
                style={{ marginTop: "0.5rem" }}
                name="newDepartmentName"
                value={form.newDepartmentName}
                onChange={handleChange}
                placeholder="Enter new department name..."
                required
              />
            )}
          </div>

          {/* Serial Number */}
          <div>
            <label className="label">Serial Number</label>
            <input
              className="input"
              name="serialNumber"
              value={form.serialNumber}
              onChange={handleChange}
              placeholder="e.g. SN-7734-XZ"
            />
          </div>

          {/* Condition + Location row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="label">Condition</label>
              <select className="select" name="condition" value={form.condition} onChange={handleChange}>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <input
                className="input"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Room 204, Block A"
              />
            </div>
          </div>

          {/* Acquisition Date + Cost row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="label">Acquisition Date</label>
              <input
                className="input"
                type="date"
                name="acquisitionDate"
                value={form.acquisitionDate}
                onChange={handleChange}
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div>
              <label className="label">Acquisition Cost (₹)</label>
              <input
                className="input"
                type="number"
                name="acquisitionCost"
                value={form.acquisitionCost}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Bookable toggle */}
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "0.875rem 1rem",
            background: "var(--bg-base)", borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)"
          }}>
            <input
              type="checkbox"
              id="isBookable"
              name="isBookable"
              checked={form.isBookable}
              onChange={handleChange}
              style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer" }}
            />
            <div>
              <label htmlFor="isBookable" style={{ fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", color: "var(--text-primary)" }}>
                Allow Booking
              </label>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                Employees can reserve this asset for a time slot
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ padding: "0.75rem 1.5rem" }}
          >
            <Package size={16} />
            {loading ? "Registering..." : "Register Asset"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/assets")}
            style={{ padding: "0.75rem 1.5rem" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
