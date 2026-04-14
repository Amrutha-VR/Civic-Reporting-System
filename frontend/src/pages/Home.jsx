import { useState } from "react";
import IssueCard from "../components/IssueCard";
import IssueModal from "../components/IssueModal";
import StatsBar from "../components/StatsBar";
import { useIssues, useStats } from "../hooks/useIssues";

const CATEGORIES = ["All","Pothole","Broken Streetlight","Garbage Overflow","Water Leakage","Graffiti","Fallen Tree","Damaged Sidewalk","Illegal Dumping","Traffic Signal","Other"];
const STATUSES = ["All","Open","In Progress","Resolved"];

export default function Home() {
  const [filters, setFilters] = useState({ status: "", category: "", search: "", sort: "date", page: 1 });
  const [selected, setSelected] = useState(null);
  const stats = useStats();
  const { issues, loading, error, refetch } = useIssues(filters);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      <StatsBar stats={stats} />

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={filters.search} onChange={e => setFilter("search", e.target.value)} placeholder="🔍 Search issues..." style={{ flex: 1, minWidth: 160, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", fontSize: 14, outline: "none" }} />
          <select value={filters.status || "All"} onChange={e => setFilter("status", e.target.value === "All" ? "" : e.target.value)} style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "8px 10px", fontSize: 13, background: "#fff" }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filters.category || "All"} onChange={e => setFilter("category", e.target.value === "All" ? "" : e.target.value)} style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "8px 10px", fontSize: 13, background: "#fff" }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filters.sort} onChange={e => setFilter("sort", e.target.value)} style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "8px 10px", fontSize: 13, background: "#fff" }}>
            <option value="date">Latest</option>
            <option value="votes">Top Voted</option>
          </select>
        </div>
      </div>

      {/* Issue List */}
      {loading && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading issues...</div>}
      {error && <div style={{ textAlign: "center", padding: 40, color: "#ef4444" }}>{error}</div>}
      {!loading && !error && issues.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No issues found. Try changing filters or report a new one!</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {issues.map(issue => (
          <IssueCard key={issue.id} issue={issue} onClick={() => setSelected(issue)} onUpdated={refetch} />
        ))}
      </div>

      {selected && <IssueModal issue={selected} onClose={() => setSelected(null)} onUpdated={() => { refetch(); }} />}
    </div>
  );
}
