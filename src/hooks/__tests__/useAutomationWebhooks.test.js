import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import * as automationWebhooksService from "../../services/automationWebhooksService";
import { useAutomationWebhooks } from "../useAutomationWebhooks";

vi.mock("../../services/automationWebhooksService");

const WEBHOOK = {
  id: "webhook-1",
  name: "n8n — Qualificação",
  url: "https://n8n.exemplo.com/webhook/abc",
  enabled: true,
  events: ["LEAD_CREATED"],
  signingSecretConfigured: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAutomationWebhooks", () => {
  it("carrega a lista de webhooks no mount", async () => {
    automationWebhooksService.listWebhooks.mockResolvedValue({ data: [WEBHOOK] });

    const { result } = renderHook(() => useAutomationWebhooks());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.webhooks).toEqual([WEBHOOK]);
    expect(result.current.error).toBeNull();
  });

  it("popula error quando a listagem falha", async () => {
    automationWebhooksService.listWebhooks.mockRejectedValue({
      response: { data: { message: "Erro do servidor." } },
    });

    const { result } = renderHook(() => useAutomationWebhooks());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Erro do servidor.");
  });

  it("create adiciona o webhook na lista sem manter o secret em texto puro", async () => {
    automationWebhooksService.listWebhooks.mockResolvedValue({ data: [] });
    automationWebhooksService.createWebhook.mockResolvedValue({
      ...WEBHOOK,
      signingSecret: "segredo-em-texto-puro",
    });

    const { result } = renderHook(() => useAutomationWebhooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let created;
    await act(async () => {
      created = await result.current.create({ name: WEBHOOK.name, url: WEBHOOK.url, events: WEBHOOK.events });
    });

    expect(created.success).toBe(true);
    expect(created.result.signingSecret).toBe("segredo-em-texto-puro"); // retornado ao chamador
    expect(result.current.webhooks[0].signingSecret).toBeUndefined(); // mas nunca fica na lista persistente
  });

  it("remove tira o webhook da lista", async () => {
    automationWebhooksService.listWebhooks.mockResolvedValue({ data: [WEBHOOK] });
    automationWebhooksService.removeWebhook.mockResolvedValue({ ...WEBHOOK, enabled: false });

    const { result } = renderHook(() => useAutomationWebhooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.remove(WEBHOOK.id);
    });

    expect(result.current.webhooks).toEqual([]);
  });

  it("retorna success:false com mensagem de erro quando uma ação falha", async () => {
    automationWebhooksService.listWebhooks.mockResolvedValue({ data: [WEBHOOK] });
    automationWebhooksService.removeWebhook.mockRejectedValue({
      response: { data: { message: "Webhook não encontrado." } },
    });

    const { result } = renderHook(() => useAutomationWebhooks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.remove(WEBHOOK.id);
    });

    expect(response).toEqual({ success: false, message: "Webhook não encontrado." });
    expect(result.current.webhooks).toEqual([WEBHOOK]); // não remove otimisticamente em caso de erro
  });
});
