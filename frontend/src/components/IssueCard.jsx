import { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUS_COLOR = { Open: "#ef4444", "In Progress": "#f59e0b", Resolved: "#22c55e" };
const STATUS_BG = { Open: "#fef2f2", "In Progress": "#fffbeb", Resolved: "#f0fdf4" };

export default function IssueCard({ issue, onClick, onUpdated }) {
  const { user } = useAuth();
  const [votes, setVotes] = useState(issue.votes);
  const [voted, setVoted] = useState(issue.voted_by?.includes(user?.username));

  const handleVote = async (e) => {
    e.stopPropagation();
    if (!user) { toast.error("Login to vote"); return; }
    try {
      const res = await api.post(`/issues/${issue.id}/vote`);
      setVotes(res.data.votes);
      setVoted(res.data.voted);
      onUpdated?.();
    } catch { toast.error("Failed to vote"); }
  };

  return (
    <div onClick={onClick} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "14px 16px", cursor: "pointer", transition: "box-shadow .15s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ background: "#f1f5f9", color: "#64748b", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{issue.category}</span>
            <span style={{ background: STATUS_BG[issue.status], color: STATUS_COLOR[issue.status], padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${STATUS_COLOR[issue.status]}40` }}>{issue.status}</span>
          </div>
          <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15, marginBottom: 4 }}>{issue.title}</div>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>📍 {issue.address}</div>
        </div>
        <button onClick={handleVote} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: voted ? "#eef2ff" : "#f8fafc", border: `1.5px solid ${voted ? "#6366f1" : "#e2e8f0"}`, borderRadius: 10, padding: "6px 12px", cursor: "pointer", color: voted ? "#6366f1" : "#94a3b8", fontWeight: 700, fontSize: 13, minWidth: 46 }}>
          <span style={{ fontSize: 14 }}>▲</span>{votes}
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, color: "#94a3b8", fontSize: 12 }}>
        <span>👤 {issue.reporter}</span>
        <span>💬 {issue.comments?.length || 0} · 📅 {issue.created_at?.slice(0, 10)}</span>
      </div>
    </div>
  );
}
