import { useState } from "react";
import Card from "../Card";
import Button from "../Button";
import Input from "../Input";
import IntegrationStatusBadge from "./IntegrationStatusBadge";

// Card genérico de "conectar/desconectar" — parametrizado por provedor.
// Google Calendar e Dental Office usam o mesmo componente com props
// diferentes; a próxima integração só precisa de uma nova instância aqui.
function IntegrationCard({ title, description, integration, fields, onConnect, onDisconnect, saving }) {
  const [form, setForm] = useState({});

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleConnect(e) {
    e.preventDefault();
    const credentials = Object.fromEntries(Object.entries(form).filter(([, value]) => value));
    if (Object.keys(credentials).length === 0) return;
    const result = await onConnect({ credentials });
    if (result?.success) setForm({});
  }

  const status = integration?.status ?? "NOT_CONNECTED";
  const configured = integration?.credentialsConfigured ?? false;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-bold text-blue-950">{title}</h4>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <IntegrationStatusBadge status={status} />
      </div>

      <form onSubmit={handleConnect} className="space-y-3">
        {fields.map((field) => (
          <Input
            key={field.name}
            name={field.name}
            type={field.type ?? "text"}
            placeholder={configured ? `${field.placeholder} (configurado — deixe em branco para manter)` : field.placeholder}
            value={form[field.name] ?? ""}
            onChange={handleChange}
          />
        ))}

        <div className="flex gap-3">
          <Button type="submit" color="blue" disabled={saving}>
            {saving ? "Salvando..." : configured ? "Atualizar" : "Conectar"}
          </Button>
          {configured && (
            <Button type="button" color="red" disabled={saving} onClick={onDisconnect}>
              Desconectar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

export default IntegrationCard;
