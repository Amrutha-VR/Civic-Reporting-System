import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!form.username || !form.password) { toast.error("Fill all fields"); return; }
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (e) {
      toast.error(e.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e293b,#0f172a,#1e1b4b)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🏙️</div>
          <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 900, letterSpacing: -1 }}>CivicAlert</h1>
          <p style={{ color: "#94a3b8", marginTop: 6 }}>Community-powered civic issue reporting</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 28px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "#1e293b" }}>Sign In</h2>
          {["username", "password"].map(k => (
            <div key={k} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
              <input type={k === "password" ? "password" : "text"} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} onKeyDown={e => e.key === "Enter" && handle()} style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          <button onClick={handle} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontWeight: 800, cursor: "pointer", fontSize: 16, marginTop: 6, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
          <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "#64748b" }}>
            Don't have an account? <Link to="/register" style={{ color: "#6366f1", fontWeight: 700 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
