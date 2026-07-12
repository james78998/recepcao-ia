import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../useAuth";
import * as authService from "../../services/authService";

vi.mock("../../services/authService");

beforeEach(() => {
  vi.clearAllMocks();
  authService.refresh.mockRejectedValue(new Error("sem sessão"));
});

describe("useAuth — hasModule", () => {
  it("retorna false quando não há usuário logado", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasModule("CRM")).toBe(false);
  });

  it("retorna true apenas para módulos presentes em user.enabledModules após login", async () => {
    authService.login.mockResolvedValue({
      accessToken: "token-fake",
      user: { id: "user-1", enabledModules: ["CRM", "WHATSAPP"] },
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login("admin@teste.com", "senha123");
    });

    expect(result.current.hasModule("CRM")).toBe(true);
    expect(result.current.hasModule("WHATSAPP")).toBe(true);
    expect(result.current.hasModule("AGENDA")).toBe(false);
  });
});
