import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onReport }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav style={{ background: "#fff", borderBottom: "1.5px solid #e2e8f0", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <span style={{ fontSize: 26 }}>🏙️</span>
        <span style={{ fontWeight: 900, fontSize: 20, color: "#1e293b", letterSpacing: -0.5 }}>CivicAlert</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user ? (
          <>
            <button onClick={onReport} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              + Report Issue
            </button>
            <Link to="/dashboard" style={{ textDecoration: "none", fontWeight: 600, color: "#64748b", fontSize: 14 }}>Dashboard</Link>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                {user.username[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{user.username}</span>
            </div>
            <button onClick={handleLogout} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 600 }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: "none", fontWeight: 600, color: "#64748b", fontSize: 14 }}>Login</Link>
            <Link to="/register" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "8px 18px", fontWeight: 700, fontSize: 14 }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
