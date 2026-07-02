import { useState, useEffect, useCallback } from "react";
import * as tenantSettingsService from "../services/tenantSettingsService";

function replaceIntegration(list, updated) {
  const idx = list.findIndex((item) => item.provider === updated.provider);
  if (idx === -1) return [...list, updated];
  const copy = [...list];
  copy[idx] = updated;
  return copy;
}

export function useTenantSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingSection, setSavingSection] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return tenantSettingsService
      .getMySettings()
      .then(setSettings)
      .catch((err) => {
        setError(err?.response?.data?.message || "Erro ao carregar configurações.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runSectionUpdate = useCallback(async (section, action, applyResult) => {
    setSavingSection(section);
    try {
      const result = await action();
      setSettings((prev) => ({ ...prev, ...applyResult(result, prev) }));
      return { success: true, result };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Erro ao salvar." };
    } finally {
      setSavingSection(null);
    }
  }, []);

  const updateProfile = useCallback(
    (data) => runSectionUpdate("profile", () => tenantSettingsService.updateProfile(data), (profile) => ({ profile })),
    [runSectionUpdate]
  );

  const updateAiConfig = useCallback(
    (data) =>
      runSectionUpdate(
        "aiConfig",
        () => tenantSettingsService.updateAiConfig(data),
        (aiConfig, prev) => ({ aiConfig: { ...aiConfig, basePrompt: prev.aiConfig.basePrompt } })
      ),
    [runSectionUpdate]
  );

  const updateWhatsappConfig = useCallback(
    (data) =>
      runSectionUpdate(
        "whatsappConfig",
        () => tenantSettingsService.updateWhatsappConfig(data),
        (whatsappConfig, prev) => ({
          whatsappConfig: { ...whatsappConfig, whatsappPhoneNumberId: prev.whatsappConfig.whatsappPhoneNumberId },
        })
      ),
    [runSectionUpdate]
  );

  const updateSchedule = useCallback(
    (data) => runSectionUpdate("scheduleConfig", () => tenantSettingsService.updateSchedule(data), (scheduleConfig) => ({ scheduleConfig })),
    [runSectionUpdate]
  );

  const updateBusinessHours = useCallback(
    (days) => runSectionUpdate("businessHours", () => tenantSettingsService.updateBusinessHours(days), (businessHours) => ({ businessHours })),
    [runSectionUpdate]
  );

  const connectIntegration = useCallback(
    (provider, data) =>
      runSectionUpdate(
        `integration:${provider}`,
        () => tenantSettingsService.upsertIntegration(provider, data),
        (integration, prev) => ({ integrations: replaceIntegration(prev.integrations, integration) })
      ),
    [runSectionUpdate]
  );

  const disconnectIntegration = useCallback(
    (provider) =>
      runSectionUpdate(
        `integration:${provider}`,
        () => tenantSettingsService.removeIntegration(provider),
        (integration, prev) => ({ integrations: replaceIntegration(prev.integrations, integration) })
      ),
    [runSectionUpdate]
  );

  return {
    settings,
    loading,
    error,
    savingSection,
    updateProfile,
    updateAiConfig,
    updateWhatsappConfig,
    updateSchedule,
    updateBusinessHours,
    connectIntegration,
    disconnectIntegration,
    reload: load,
  };
}
