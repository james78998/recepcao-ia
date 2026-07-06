import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import * as automationWebhooksService from "../../services/automationWebhooksService";
import { useAutomationStats } from "../useAutomationStats";

vi.mock("../../services/automationWebhooksService");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAutomationStats", () => {
  it("carrega as estatísticas no mount", async () => {
    automationWebhooksService.getStats.mockResolvedValue({
      activeWebhooks: 3,
      eventsLast24h: 10,
      successRate: 0.8,
      failuresLast24h: 2,
    });

    const { result } = renderHook(() => useAutomationStats());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats).toEqual({
      activeWebhooks: 3,
      eventsLast24h: 10,
      successRate: 0.8,
      failuresLast24h: 2,
    });
  });

  it("popula error quando a busca falha", async () => {
    automationWebhooksService.getStats.mockRejectedValue({
      response: { data: { message: "Erro do servidor." } },
    });

    const { result } = renderHook(() => useAutomationStats());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Erro do servidor.");
    expect(result.current.stats).toBeNull();
  });
});
