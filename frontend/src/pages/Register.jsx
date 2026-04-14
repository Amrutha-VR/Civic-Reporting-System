import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!form.username || !form.email || !form.password) { toast.error("Fill all fields"); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success("Account created! Welcome 🎉");
      navigate("/");
    } catch (e) {
      toast.error(e.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  };

  const fields = [
    { k: "username", label: "Username", type: "text" },
    { k: "email", label: "Email", type: "email" },
    { k: "password", label: "Password", type: "password" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e293b,#0f172a,#1e1b4b)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52 }}>🏙️</div>
          <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 900, letterSpacing: -1 }}>CivicAlert</h1>
          <p style={{ color: "#94a3b8", marginTop: 6 }}>Join your community</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 28px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "#1e293b" }}>Create Account</h2>
          {fields.map(({ k, label, type }) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
              <input type={type} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} onKeyDown={e => e.key === "Enter" && handle()} style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <button onClick={handle} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontWeight: 800, cursor: "pointer", fontSize: 16, marginTop: 6, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating..." : "Create Account →"}
          </button>
          <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#64748b" }}>
            Already have an account? <Link to="/login" style={{ color: "#6366f1", fontWeight: 700 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
