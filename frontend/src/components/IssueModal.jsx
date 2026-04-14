import { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUSES = ["Open", "In Progress", "Resolved"];
const STATUS_COLOR = { Open: "#ef4444", "In Progress": "#f59e0b", Resolved: "#22c55e" };

export default function IssueModal({ issue, onClose, onUpdated }) {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [localIssue, setLocalIssue] = useState(issue);
  const [posting, setPosting] = useState(false);

  const handleVote = async () => {
    if (!user) { toast.error("Login to vote"); return; }
    try {
      const res = await api.post(`/issues/${localIssue.id}/vote`);
      setLocalIssue(i => ({ ...i, votes: res.data.votes }));
      onUpdated();
    } catch { toast.error("Failed to vote"); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    if (!user) { toast.error("Login to comment"); return; }
    setPosting(true);
    try {
      const res = await api.post(`/issues/${localIssue.id}/comment`, { text: comment });
      setLocalIssue(i => ({ ...i, comments: [...i.comments, res.data] }));
      setComment("");
      onUpdated();
    } catch { toast.error("Failed to post comment"); }
    finally { setPosting(false); }
  };

  const handleStatus = async (status) => {
    try {
      await api.patch(`/issues/${localIssue.id}/status`, { status });
      setLocalIssue(i => ({ ...i, status }));
      toast.success(`Status updated to ${status}`);
      onUpdated();
    } catch (e) { toast.error(e.response?.data?.error || "Failed"); }
  };

  const canChangeStatus = user && (user.username === localIssue.reporter || user.role === "admin");

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ background: "#f1f5f9", color: "#64748b", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{localIssue.category}</span>
              <span style={{ background: "#fef9c3", color: STATUS_COLOR[localIssue.status], padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{localIssue.status}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{localIssue.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ padding: "16px 24px" }}>
          <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: 14 }}>{localIssue.description}</p>

          {localIssue.image_url && (
            <img src={localIssue.image_url} alt="issue" style={{ width: "100%", borderRadius: 12, marginBottom: 14, maxHeight: 240, objectFit: "cover" }} />
          )}

          <div style={{ display: "flex", gap: 16, color: "#64748b", fontSize: 13, marginBottom: 8, flexWrap: "wrap" }}>
            <span>📍 {localIssue.address}</span>
            <span>🌐 {Number(localIssue.lat).toFixed(4)}, {Number(localIssue.lng).toFixed(4)}</span>
          </div>
          <div style={{ display: "flex", gap: 16, color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>
            <span>👤 {localIssue.reporter}</span>
            <span>📅 {localIssue.created_at?.slice(0, 10)}</span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <button onClick={handleVote} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, cursor: "pointer" }}>▲ Upvote ({localIssue.votes})</button>
            {canChangeStatus && (
              <select value={localIssue.status} onChange={e => handleStatus(e.target.value)} style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "9px 12px", fontWeight: 600, background: "#fff", cursor: "pointer" }}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            )}
          </div>

          {/* Comments */}
          <div style={{ borderTop: "1.5px solid #f1f5f9", paddingTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>💬 Comments ({localIssue.comments?.length || 0})</h3>
            {localIssue.comments?.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {c.user?.[0]?.toUpperCase()}
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 12px", flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{c.user} <span style={{ color: "#94a3b8", fontWeight: 400 }}>· {c.date?.slice(0, 10)}</span></div>
                  <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{c.text}</div>
                </div>
              </div>
            ))}
            {user && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && handleComment()} placeholder="Write a comment..." style={{ flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "9px 12px", fontSize: 14, outline: "none" }} />
                <button onClick={handleComment} disabled={posting} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", cursor: "pointer", fontWeight: 700 }}>Post</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
