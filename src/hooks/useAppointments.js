import { useState, useEffect, useCallback } from "react";
import { getAppointments } from "../services/appointmentsService";

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAppointments()
      .then((data) => {
        if (cancelled) return;
        setAppointments(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || "Erro ao carregar a agenda.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tick]);

  return { appointments, loading, error, refetch };
}
