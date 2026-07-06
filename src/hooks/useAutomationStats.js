import { useState, useEffect, useCallback } from "react";
import * as automationWebhooksService from "../services/automationWebhooksService";

export function useAutomationStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return automationWebhooksService
      .getStats()
      .then(setStats)
      .catch((err) => setError(err?.response?.data?.message || "Erro ao carregar estatísticas."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, error, reload: load };
}
