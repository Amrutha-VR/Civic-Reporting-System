import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

export function useIssues(filters = {}) {
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await api.get(`/issues/?${params}`);
      setIssues(res.data.issues);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  return { issues, total, pages, loading, error, refetch: fetchIssues };
}

export function useStats() {
  const [stats, setStats] = useState({});
  useEffect(() => {
    api.get("/issues/stats/summary").then(r => setStats(r.data)).catch(() => {});
  }, []);
  return stats;
}
