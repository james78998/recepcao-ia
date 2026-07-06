import { useState, useEffect, useCallback } from "react";
import * as automationWebhooksService from "../services/automationWebhooksService";

// O backend só retorna signingSecret em texto puro na resposta de create/
// regenerateSecret — nunca deve ficar guardado na lista persistente do
// estado, só é usado uma vez pelo chamador (AutomationSecretReveal).
function stripSecret(webhook) {
  const { signingSecret, ...rest } = webhook;
  return rest;
}

export function useAutomationWebhooks() {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null); // "new" | webhook.id | null

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return automationWebhooksService
      .listWebhooks()
      .then((result) => setWebhooks(result.data))
      .catch((err) => setError(err?.response?.data?.message || "Erro ao carregar webhooks."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create(data) {
    setSavingId("new");
    try {
      const created = await automationWebhooksService.createWebhook(data);
      setWebhooks((prev) => [...prev, stripSecret(created)]);
      return { success: true, result: created };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Erro ao criar webhook." };
    } finally {
      setSavingId(null);
    }
  }

  async function update(id, data) {
    setSavingId(id);
    try {
      const updated = await automationWebhooksService.updateWebhook(id, data);
      setWebhooks((prev) => prev.map((w) => (w.id === id ? updated : w)));
      return { success: true, result: updated };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Erro ao editar webhook." };
    } finally {
      setSavingId(null);
    }
  }

  async function remove(id) {
    setSavingId(id);
    try {
      await automationWebhooksService.removeWebhook(id);
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Erro ao excluir webhook." };
    } finally {
      setSavingId(null);
    }
  }

  async function regenerateSecret(id) {
    setSavingId(id);
    try {
      const updated = await automationWebhooksService.regenerateSecret(id);
      setWebhooks((prev) => prev.map((w) => (w.id === id ? stripSecret(updated) : w)));
      return { success: true, result: updated };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Erro ao regenerar secret." };
    } finally {
      setSavingId(null);
    }
  }

  async function test(id) {
    setSavingId(id);
    try {
      const result = await automationWebhooksService.testWebhook(id);
      return { success: true, result };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Erro ao testar webhook." };
    } finally {
      setSavingId(null);
    }
  }

  return {
    webhooks,
    loading,
    error,
    savingId,
    create,
    update,
    remove,
    regenerateSecret,
    test,
    reload: load,
  };
}
