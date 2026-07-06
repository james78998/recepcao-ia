import { useState } from "react";
import Input from "../Input";
import Button from "../Button";
import { AUTOMATION_EVENT_OPTIONS } from "../../constants/automationEvents";

// Reaproveitado tanto para criar quanto para editar um webhook — só muda o
// initialValues e o que o onSubmit faz com os dados.
function AutomationWebhookForm({ initialValues, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState({
    name: initialValues?.name ?? "",
    url: initialValues?.url ?? "",
    events: initialValues?.events ?? [],
    enabled: initialValues?.enabled ?? true,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleEvent(value) {
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(value)
        ? prev.events.filter((e) => e !== value)
        : [...prev.events, value],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Nome do webhook (ex.: n8n — Qualificação)"
        maxLength={120}
        required
      />
      <Input
        name="url"
        type="url"
        value={form.url}
        onChange={handleChange}
        placeholder="https://..."
        required
      />

      <div>
        <p className="text-sm font-bold text-slate-700 mb-2">Eventos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AUTOMATION_EVENT_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={form.events.includes(option.value)}
                onChange={() => toggleEvent(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 font-bold text-slate-700">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
        />
        Ativo
      </label>

      <div className="flex gap-3">
        <Button type="submit" color="green" disabled={saving || form.events.length === 0}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" color="gray" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default AutomationWebhookForm;
