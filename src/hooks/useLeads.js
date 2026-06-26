import { useState, useEffect, useCallback } from "react";
import { getLeads } from "../services/leadsService";

export function useLeads({ search = '', page = 1, perPage = 10 } = {}) {
  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLeads({ search, page, perPage })
      .then((result) => {
        if (cancelled) return;
        setLeads(result.data);
        setMeta(result.meta);
        setStats(result.stats);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || 'Erro ao carregar leads.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [search, page, perPage, tick]);

  return { leads, meta, stats, loading, error, refetch };
}
