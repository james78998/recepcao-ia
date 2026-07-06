import { useState, useEffect, useCallback } from "react";
import * as automationWebhooksService from "../services/automationWebhooksService";

// Carregado sob demanda — o componente que usa este hook só é montado quando
// o usuário expande "Ver logs" naquele webhook (lazy, evita N requisições ao
// abrir a tela com N webhooks cadastrados).
export function useAutomationWebhookLogs(webhookId) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilterState] = useState("all"); // "all" | "success" | "failure"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return automationWebhooksService
      .getWebhookLogs(webhookId, { page, perPage: 10, filter })
      .then((result) => {
        setData(result.data);
        setMeta(result.meta);
      })
      .catch((err) => setError(err?.response?.data?.message || "Erro ao carregar logs."))
      .finally(() => setLoading(false));
  }, [webhookId, page, filter]);

  useEffect(() => {
    load();
  }, [load]);

  function setFilter(newFilter) {
    setFilterState(newFilter);
    setPage(1);
  }

  return { data, meta, page, setPage, filter, setFilter, loading, error, reload: load };
}
