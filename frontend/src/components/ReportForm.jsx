import { useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const CATEGORIES = ["Pothole","Broken Streetlight","Garbage Overflow","Water Leakage","Graffiti","Fallen Tree","Damaged Sidewalk","Illegal Dumping","Traffic Signal","Other"];

export default function ReportForm({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", category: CATEGORIES[0], description: "", address: "", lat: "", lng: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const getLocation = () => {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      p => { set("lat", p.coords.latitude.toFixed(6)); set("lng", p.coords.longitude.toFixed(6)); setLocLoading(false); },
      () => { toast.error("Could not get location"); setLocLoading(false); }
    ) || (setLocLoading(false), toast.error("Geolocation not supported"));
  };

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target.result);
    r.readAsDataURL(f);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.address.trim()) e.address = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      await api.post("/issues/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Issue reported successfully! 🚨");
      onCreated?.();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to submit");
    } finally { setSubmitting(false); }
  };

  const Field = ({ label, k, type = "text", multiline }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
      {multiline
        ? <textarea value={form[k]} onChange={e => set(k, e.target.value)} rows={3} style={{ width: "100%", border: `1.5px solid ${errors[k] ? "#ef4444" : "#e5e7eb"}`, borderRadius: 10, padding: "9px 12px", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        : <input type={type} value={form[k]} onChange={e => set(k, e.target.value)} style={{ width: "100%", border: `1.5px solid ${errors[k] ? "#ef4444" : "#e5e7eb"}`, borderRadius: 10, padding: "9px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />}
      {errors[k] && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 2 }}>{errors[k]}</div>}
    </div>
  );

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "92vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>🚨 Report an Issue</h2>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#64748b", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <Field label="Issue Title *" k="title" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 14, background: "#fff", boxSizing: "border-box" }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Description *" k="description" multiline />
          <Field label="Address / Location *" k="address" />

          {/* Geotagging */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>📍 GPS Coordinates</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="Latitude" value={form.lat} onChange={e => set("lat", e.target.value)} style={{ flex: 1, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none" }} />
              <input placeholder="Longitude" value={form.lng} onChange={e => set("lng", e.target.value)} style={{ flex: 1, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none" }} />
              <button onClick={getLocation} style={{ background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 10, padding: "0 14px", cursor: "pointer", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>
                {locLoading ? "⏳" : "📡 Auto"}
              </button>
            </div>
          </div>

          {/* Photo Upload */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>📷 Photo Evidence</label>
            <label style={{ display: "block", border: "2px dashed #cbd5e1", borderRadius: 12, padding: 20, textAlign: "center", cursor: "pointer", background: "#f8fafc" }}>
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
              {preview
                ? <img src={preview} alt="preview" style={{ maxHeight: 130, borderRadius: 8, objectFit: "cover" }} />
                : <div style={{ color: "#94a3b8", fontSize: 13 }}>📁 Click to upload image<br /><span style={{ fontSize: 11 }}>PNG, JPG up to 10MB</span></div>}
            </label>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 12, padding: 12, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>Cancel</button>
            <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: 12, fontWeight: 700, cursor: "pointer", fontSize: 15, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
