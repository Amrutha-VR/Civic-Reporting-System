export default function StatsBar({ stats }) {
  const cards = [
    { label: "Total", value: stats.total || 0, icon: "📋", color: "#6366f1", bg: "#eef2ff" },
    { label: "Open", value: stats.Open || 0, icon: "🔴", color: "#ef4444", bg: "#fef2f2" },
    { label: "In Progress", value: stats["In Progress"] || 0, icon: "🟡", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Resolved", value: stats.Resolved || 0, icon: "🟢", color: "#22c55e", bg: "#f0fdf4" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: c.bg, borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${c.color}20` }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: c.color }}>{c.value}</div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}
