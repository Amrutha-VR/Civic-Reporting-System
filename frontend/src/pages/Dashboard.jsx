import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import IssueCard from "../components/IssueCard";
import IssueModal from "../components/IssueModal";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.get(`/issues/?search=${user.username}`).then(r => {
      setIssues(r.data.issues.filter(i => i.reporter === user.username));
    }).finally(() => setLoading(false));
  }, [user]);

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === "Open").length,
    inprog: issues.filter(i => i.status === "In Progress").length,
    resolved: issues.filter(i => i.status === "Resolved").length,
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px" }}>
      {/* Profile */}
      <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 18, padding: "24px 28px", marginBottom: 24, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 24 }}>
            {user?.username[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{user?.username}</div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>{user?.email} · {user?.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 18 }}>
          {[["Total Reported", stats.total], ["Open", stats.open], ["In Progress", stats.inprog], ["Resolved", stats.resolved]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900 }}>{v}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, color: "#1e293b" }}>My Reported Issues</h2>
      {loading && <div style={{ color: "#94a3b8", textAlign: "center", padding: 30 }}>Loading...</div>}
      {!loading && issues.length === 0 && <div style={{ color: "#94a3b8", textAlign: "center", padding: 30 }}>You haven't reported any issues yet.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {issues.map(i => <IssueCard key={i.id} issue={i} onClick={() => setSelected(i)} onUpdated={() => {}} />)}
      </div>
      {selected && <IssueModal issue={selected} onClose={() => setSelected(null)} onUpdated={() => {}} />}
    </div>
  );
}
