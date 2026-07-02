import { useState } from "react";
import Layout from "../components/Layout";
import PageTitle from "../components/PageTitle";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Input from "../components/Input";
import Toast from "../components/Toast";
import Loading from "../components/Loading";
import ApiKeyInput from "../components/configuracoes/ApiKeyInput";
import IntegrationStatusBadge from "../components/configuracoes/IntegrationStatusBadge";
import BusinessHoursEditor from "../components/configuracoes/BusinessHoursEditor";
import IntegrationCard from "../components/configuracoes/IntegrationCard";
import { useTenantSettings } from "../hooks/useTenantSettings";

function ProfileSection({ profile, saving, onSave, notify }) {
  const [form, setForm] = useState({
    name: profile.name ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    address: profile.address ?? "",
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    notify(await onSave(form));
  }

  return (
    <Card>
      <h3 className="text-2xl font-bold text-blue-950 mb-6">Dados da clínica</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Nome da clínica" required />
        <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="E-mail" required />
        <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Telefone" />
        <Input name="address" value={form.address} onChange={handleChange} placeholder="Endereço" />
        <Button type="submit" color="green" disabled={saving}>
          {saving ? "Salvando..." : "Salvar dados da clínica"}
        </Button>
      </form>
    </Card>
  );
}

function AiConfigSection({ aiConfig, saving, onSave, notify }) {
  const [form, setForm] = useState({
    aiEnabled: aiConfig.aiEnabled,
    openAiModel: aiConfig.openAiModel ?? "",
    customPrompt: aiConfig.customPrompt ?? "",
    temperature: aiConfig.temperature ?? "",
    maxTokens: aiConfig.maxTokens ?? "",
    openAiApiKey: "",
  });

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      aiEnabled: form.aiEnabled,
      openAiModel: form.openAiModel || undefined,
      customPrompt: form.customPrompt,
      temperature: form.temperature === "" ? undefined : Number(form.temperature),
      maxTokens: form.maxTokens === "" ? undefined : Number(form.maxTokens),
    };
    if (form.openAiApiKey) payload.openAiApiKey = form.openAiApiKey;

    const result = await onSave(payload);
    notify(result);
    if (result.success) setForm((prev) => ({ ...prev, openAiApiKey: "" }));
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-blue-950">Inteligência Artificial</h3>
        <label className="flex items-center gap-2 font-bold text-slate-700">
          <input type="checkbox" name="aiEnabled" checked={form.aiEnabled} onChange={handleChange} />
          Ativa
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ApiKeyInput
          name="openAiApiKey"
          configured={aiConfig.openAiApiKeyConfigured}
          placeholder="Chave da API OpenAI (sk-...)"
          onChange={handleChange}
        />
        <Input name="openAiModel" value={form.openAiModel} onChange={handleChange} placeholder="Modelo (ex.: gpt-4o-mini)" />

        <div className="grid grid-cols-2 gap-4">
          <Input
            name="temperature"
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={form.temperature}
            onChange={handleChange}
            placeholder="Temperatura (0–2)"
          />
          <Input
            name="maxTokens"
            type="number"
            min="50"
            max="2000"
            value={form.maxTokens}
            onChange={handleChange}
            placeholder="Máx. de tokens"
          />
        </div>

        <textarea
          name="customPrompt"
          value={form.customPrompt}
          onChange={handleChange}
          className="w-full border p-3 rounded-xl min-h-28"
          placeholder="Instruções adicionais para a IA (somadas às regras fixas do sistema)"
        />

        <details className="text-sm text-slate-500">
          <summary className="cursor-pointer font-bold">Regras fixas do sistema (não editáveis)</summary>
          <pre className="whitespace-pre-wrap mt-2 bg-slate-50 p-3 rounded-xl">{aiConfig.basePrompt}</pre>
        </details>

        <Button type="submit" color="green" disabled={saving}>
          {saving ? "Salvando..." : "Salvar configuração de IA"}
        </Button>
      </form>
    </Card>
  );
}

function WhatsappConfigSection({ whatsappConfig, saving, onSave, notify }) {
  const [form, setForm] = useState({
    businessAccountId: whatsappConfig.businessAccountId ?? "",
    displayName: whatsappConfig.displayName ?? "",
    accessToken: "",
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { businessAccountId: form.businessAccountId, displayName: form.displayName };
    if (form.accessToken) payload.accessToken = form.accessToken;

    const result = await onSave(payload);
    notify(result);
    if (result.success) setForm((prev) => ({ ...prev, accessToken: "" }));
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-blue-950">WhatsApp Business</h3>
        <IntegrationStatusBadge status={whatsappConfig.connectionStatus} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input value={whatsappConfig.whatsappPhoneNumberId ?? "—"} disabled placeholder="Phone Number ID" />
        <Input name="businessAccountId" value={form.businessAccountId} onChange={handleChange} placeholder="Business Account ID" />
        <Input name="displayName" value={form.displayName} onChange={handleChange} placeholder="Nome exibido da conta" />
        <ApiKeyInput
          name="accessToken"
          configured={whatsappConfig.accessTokenConfigured}
          placeholder="Token de acesso"
          onChange={handleChange}
        />

        <div className="text-sm text-slate-500">
          Webhook verificado:{" "}
          <Badge color={whatsappConfig.webhookVerified ? "green" : "gray"}>
            {whatsappConfig.webhookVerified ? "Sim" : "Não"}
          </Badge>
        </div>

        <Button type="submit" color="green" disabled={saving}>
          {saving ? "Salvando..." : "Salvar WhatsApp"}
        </Button>
      </form>
    </Card>
  );
}

function ScheduleSection({ scheduleConfig, saving, onSave, notify }) {
  const [form, setForm] = useState({
    timezone: scheduleConfig.timezone,
    defaultAppointmentDurationMin: scheduleConfig.defaultAppointmentDurationMin,
    bufferBetweenAppointmentsMin: scheduleConfig.bufferBetweenAppointmentsMin,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "timezone" ? value : Number(value) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    notify(await onSave(form));
  }

  return (
    <Card>
      <h3 className="text-2xl font-bold text-blue-950 mb-6">Agenda</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="timezone" value={form.timezone} onChange={handleChange} placeholder="Fuso horário (ex.: America/Sao_Paulo)" />
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="defaultAppointmentDurationMin"
            type="number"
            min="5"
            max="480"
            value={form.defaultAppointmentDurationMin}
            onChange={handleChange}
            placeholder="Duração padrão (min)"
          />
          <Input
            name="bufferBetweenAppointmentsMin"
            type="number"
            min="0"
            max="240"
            value={form.bufferBetweenAppointmentsMin}
            onChange={handleChange}
            placeholder="Intervalo entre consultas (min)"
          />
        </div>
        <Button type="submit" color="green" disabled={saving}>
          {saving ? "Salvando..." : "Salvar agenda"}
        </Button>
      </form>
    </Card>
  );
}

function BusinessHoursSection({ businessHours, saving, onSave, notify }) {
  const [days, setDays] = useState(businessHours);

  async function handleSubmit(e) {
    e.preventDefault();
    notify(await onSave(days));
  }

  return (
    <Card className="lg:col-span-2">
      <h3 className="text-2xl font-bold text-blue-950 mb-6">Horário de atendimento</h3>
      <form onSubmit={handleSubmit}>
        <BusinessHoursEditor days={days} onChange={setDays} />
        <Button type="submit" color="green" className="mt-6" disabled={saving}>
          {saving ? "Salvando..." : "Salvar horário de atendimento"}
        </Button>
      </form>
    </Card>
  );
}

function IntegrationsSection({ integrations, savingSection, onConnect, onDisconnect, notify }) {
  const googleCalendar = integrations.find((i) => i.provider === "GOOGLE_CALENDAR") ?? null;
  const dentalOffice = integrations.find((i) => i.provider === "DENTAL_OFFICE") ?? null;

  async function handleConnect(provider, data) {
    const result = await onConnect(provider, data);
    notify(result);
    return result;
  }

  async function handleDisconnect(provider) {
    notify(await onDisconnect(provider));
  }

  return (
    <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
      <IntegrationCard
        title="Google Calendar"
        description="Sincronize agendamentos automaticamente."
        integration={googleCalendar}
        saving={savingSection === "integration:GOOGLE_CALENDAR"}
        fields={[
          { name: "accessToken", placeholder: "Token de acesso OAuth" },
          { name: "calendarId", placeholder: "Calendar ID" },
        ]}
        onConnect={(data) => handleConnect("GOOGLE_CALENDAR", data)}
        onDisconnect={() => handleDisconnect("GOOGLE_CALENDAR")}
      />
      <IntegrationCard
        title="Dental Office"
        description="Integração com o sistema de gestão odontológica."
        integration={dentalOffice}
        saving={savingSection === "integration:DENTAL_OFFICE"}
        fields={[
          { name: "apiKey", placeholder: "API Key" },
          { name: "clinicId", placeholder: "Clinic ID" },
        ]}
        onConnect={(data) => handleConnect("DENTAL_OFFICE", data)}
        onDisconnect={() => handleDisconnect("DENTAL_OFFICE")}
      />
    </div>
  );
}

function Configuracoes() {
  const {
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
  } = useTenantSettings();

  const [toast, setToast] = useState(null);

  function notify(result) {
    setToast(
      result.success
        ? { type: "success", message: "Configurações salvas com sucesso!" }
        : { type: "error", message: result.message }
    );
    setTimeout(() => setToast(null), 3000);
  }

  if (loading) return <Loading text="Carregando configurações..." />;

  if (error) {
    return (
      <Layout active="configuracoes">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout active="configuracoes">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <PageTitle
        title="Configurações"
        subtitle="Configure os dados da clínica, IA, WhatsApp, horário de atendimento, agenda e integrações."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <ProfileSection profile={settings.profile} saving={savingSection === "profile"} onSave={updateProfile} notify={notify} />
        <AiConfigSection aiConfig={settings.aiConfig} saving={savingSection === "aiConfig"} onSave={updateAiConfig} notify={notify} />
        <WhatsappConfigSection
          whatsappConfig={settings.whatsappConfig}
          saving={savingSection === "whatsappConfig"}
          onSave={updateWhatsappConfig}
          notify={notify}
        />
        <ScheduleSection
          scheduleConfig={settings.scheduleConfig}
          saving={savingSection === "scheduleConfig"}
          onSave={updateSchedule}
          notify={notify}
        />
        <BusinessHoursSection
          businessHours={settings.businessHours}
          saving={savingSection === "businessHours"}
          onSave={updateBusinessHours}
          notify={notify}
        />
        <IntegrationsSection
          integrations={settings.integrations}
          savingSection={savingSection}
          onConnect={connectIntegration}
          onDisconnect={disconnectIntegration}
          notify={notify}
        />
      </div>
    </Layout>
  );
}

export default Configuracoes;
