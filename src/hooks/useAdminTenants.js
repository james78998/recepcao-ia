import { useState, useEffect } from "react";
import { getTenants } from "../services/adminTenantsService";

export function useAdminTenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTenants()
      .then((result) => {
        if (cancelled) return;
        setTenants(result.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || 'Erro ao carregar tenants.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { tenants, loading, error };
}
