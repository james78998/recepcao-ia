import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import * as automationWebhooksService from "../../services/automationWebhooksService";
import { useAutomationWebhookLogs } from "../useAutomationWebhookLogs";

vi.mock("../../services/automationWebhooksService");

const LOG = {
  id: "log-1",
  event: "LEAD_CREATED",
  attempt: 1,
  httpStatus: 200,
  success: true,
  errorMessage: null,
  durationMs: 530,
  createdAt: "2026-07-06T16:41:31.944Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  automationWebhooksService.getWebhookLogs.mockResolvedValue({
    data: [LOG],
    meta: { total: 1, page: 1, perPage: 10, totalPages: 1 },
  });
});

describe("useAutomationWebhookLogs", () => {
  it("busca a primeira página no mount, sem filtro", async () => {
    const { result } = renderHook(() => useAutomationWebhookLogs("webhook-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(automationWebhooksService.getWebhookLogs).toHaveBeenCalledWith("webhook-1", {
      page: 1,
      perPage: 10,
      filter: "all",
    });
    expect(result.current.data).toEqual([LOG]);
    expect(result.current.meta.totalPages).toBe(1);
  });

  it("mudar de página busca novamente com a página nova", async () => {
    const { result } = renderHook(() => useAutomationWebhookLogs("webhook-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));

    await waitFor(() =>
      expect(automationWebhooksService.getWebhookLogs).toHaveBeenLastCalledWith("webhook-1", {
        page: 2,
        perPage: 10,
        filter: "all",
      })
    );
  });

  it("mudar o filtro reseta a página para 1", async () => {
    const { result } = renderHook(() => useAutomationWebhookLogs("webhook-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(3));
    await waitFor(() => expect(result.current.page).toBe(3));

    act(() => result.current.setFilter("failure"));

    await waitFor(() => expect(result.current.page).toBe(1));
    await waitFor(() =>
      expect(automationWebhooksService.getWebhookLogs).toHaveBeenLastCalledWith("webhook-1", {
        page: 1,
        perPage: 10,
        filter: "failure",
      })
    );
  });

  it("popula error quando a busca falha", async () => {
    automationWebhooksService.getWebhookLogs.mockRejectedValue({
      response: { data: { message: "Webhook não encontrado." } },
    });

    const { result } = renderHook(() => useAutomationWebhookLogs("webhook-x"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Webhook não encontrado.");
  });
});
